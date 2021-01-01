const W1Temp = require('w1temp');
const Gpio = require('onoff').Gpio;

const packageJSON = require('../package.json');
const settings = require('../settings.json');
const startApi = require('./api');

const getTemperatureSensor = async () => {
    const sensors = await W1Temp.getSensorsUids();
    return await W1Temp.getSensor(sensors.pop(), true, 1000, false);
}

const temperatureWatch = (temperature, settings, gpioCooler, gpioHeater) => {
    console.log('Current temp: ' + temperature);

    const heatThreshold = settings.temperature + settings.temperatureThreshold;
    const coldThreshold = settings.temperature - settings.temperatureThreshold;

    let cooling = gpioCooler.readSync() === 1;
    let heating = gpioHeater.readSync() === 1;

    if (temperature > heatThreshold && !cooling) {
        gpioCooler.writeSync(1);
        gpioHeater.writeSync(0);
        console.log('to hot! Turn on cooling');
    } else if (temperature < coldThreshold && !heating) {
        gpioCooler.writeSync(0);
        gpioHeater.writeSync(1);
        console.log('to cold! Turn on heating!');
    } else if (cooling && temperature < settings.temperature) {
        gpioCooler.writeSync(0);
        console.log('turn off cooling');
    } else if (heating && temperature > settings.temperature) {
        gpioHeater.writeSync(0);
        console.log('turn off heating');
    } else if (!cooling && !heating && temperature <= heatThreshold && temperature >= coldThreshold) {
        console.log('Temp in range. Take it easy :)');
    } else {
        console.log('continue');
    }
};

const run = async () => {
    console.log(`Welcome to ${packageJSON.name} ${packageJSON.version}`);

    console.log('\nGet temperature sensor');
    const temperatureSensor = await getTemperatureSensor();

    const gpioCooler = new Gpio(settings.gpioCooler, 'out');
    const gpioHeater = new Gpio(settings.gpioHeater, 'out');

    startApi({
        settings,
        gpioCooler,
        gpioHeater,
        temperatureSensor
    });

    temperatureSensor.on('change', (temperature) => {
        temperatureWatch(temperature, settings, gpioCooler, gpioHeater);
    });

    process.on('beforeExit', (code) => {
        gpioCooler.writeSync(0);
        gpioHeater.writeSync(0);
        console.log('Process beforeExit event with code: ', code);
    });

    console.log('Termostat is up and running!\n\n');
};

run().catch((error) => {
    console.error(error);
});
