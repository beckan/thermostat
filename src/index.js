const W1Temp = require('w1temp');
const Gpio = require('onoff').Gpio;

require('dotenv').config();

const packageJSON = require('../package.json');
const startApi = require('./api');
const fs = require("fs");

const getTemperatureSensor = async () => {
    const sensors = await W1Temp.getSensorsUids();
    return await W1Temp.getSensor(sensors.pop(), true, 1000, false);
}

const temperatureWatch = (temperature, gpioCooler, gpioHeater) => {
    const settings = require('../.settings.json');

    console.log('Current temp: ' + temperature);

    const heatThreshold = settings.temperature + settings.temperatureThreshold;
    const coldThreshold = settings.temperature - settings.temperatureThreshold;

    let cooling = gpioCooler.readSync() === Gpio.HIGH;
    let heating = gpioHeater.readSync() === Gpio.HIGH;

    if (temperature > heatThreshold && !cooling) {
        gpioCooler.writeSync(Gpio.HIGH);
        gpioHeater.writeSync(Gpio.LOW);
        console.log('to hot! Turn on cooling');
    } else if (temperature < coldThreshold && !heating) {
        gpioCooler.writeSync(Gpio.LOW);
        gpioHeater.writeSync(Gpio.HIGH);
        console.log('to cold! Turn on heating!');
    } else if (cooling && temperature <= settings.temperature) {
        gpioCooler.writeSync(Gpio.LOW);
        console.log('turn off cooling');
    } else if (heating && temperature >= settings.temperature) {
        gpioHeater.writeSync(Gpio.LOW);
        console.log('turn off heating');
    } else if (!cooling && !heating && temperature <= heatThreshold && temperature >= coldThreshold) {
        console.log('Temp in range. Take it easy :)');
    } else {
        console.log('continue');
    }
};

const onExit = (callback) => {
    const turnOffEverything = () => {
        callback();
        process.exit();
    };
    process.on('exit', turnOffEverything);
    process.on('SIGINT', turnOffEverything);
    process.on('SIGUSR1', turnOffEverything);
    process.on('SIGUSR2', turnOffEverything);
    process.on('uncaughtException', turnOffEverything);
};

const findSettingsFile = () => {
    return fs.existsSync('./.settings.json');
};

const createSettingsFile = () => {
    fs.writeFileSync('./.settings.json', JSON.stringify({
        temperature: 20,
        temperatureThreshold: 1
    }));
};

const run = async () => {
    console.log(`Welcome to ${packageJSON.name} ${packageJSON.version}`);

    if (!findSettingsFile()) {
        createSettingsFile();
    }

    console.log('\nGet temperature sensor');
    const temperatureSensor = await getTemperatureSensor();

    const gpioCooler = new Gpio(process.env.GPIO_COOLER, 'out');
    const gpioHeater = new Gpio(process.env.GPIO_HEATER, 'out');

    startApi({
        gpioCooler,
        gpioHeater,
        temperatureSensor
    });

    temperatureSensor.on('change', (temperature) => {
        temperatureWatch(temperature, gpioCooler, gpioHeater);
    });

    onExit(() => {
        gpioCooler.writeSync(Gpio.LOW);
        gpioHeater.writeSync(Gpio.LOW);
    });

    console.log('Termostat is up and running!\n\n');
};

run().catch((error) => {
    console.error(error);
});
