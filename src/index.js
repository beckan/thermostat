const Gpio = require('onoff').Gpio;

require('dotenv').config();

const packageJSON = require('../package.json');
const startApi = require('./api');
const onApplicationExit = require("./utils/on-application-exit");
const createConfigFile = require("./utils/create-config-file");
const doConfigFileExist = require("./utils/do-config-file-exist");
const temperatureWatch = require("./temperature-watch");
const getTemperatureSensor = require("./utils/get-temperature-sensor");
const printMessage = require("./utils/print-message");

const run = async () => {
    printMessage.splash(`Welcome to ${packageJSON.name} ${packageJSON.version}`);

    if (!doConfigFileExist()) {
        createConfigFile();
    }

    printMessage.heading('Get temperature sensor');
    const temperatureSensor = await getTemperatureSensor();

    printMessage.success('[DONE]');

    const gpioPowerLed = new Gpio(process.env.GPIO_POWER_LED, 'out');
    const gpioCoolerLed = new Gpio(process.env.GPIO_COOLER_LED, 'out');
    const gpioHeaterLed = new Gpio(process.env.GPIO_HEATER_LED, 'out');
    const gpioCooler = new Gpio(process.env.GPIO_COOLER, 'out');
    const gpioHeater = new Gpio(process.env.GPIO_HEATER, 'out');

    printMessage.heading('Starting API');

    await startApi({
        gpioCooler,
        gpioHeater,
        temperatureSensor
    });

    printMessage.success('[DONE]');

    temperatureSensor.on('change', (temperature) => {
        temperatureWatch({
            temperature,
            gpioCoolerLed,
            gpioHeaterLed,
            gpioCooler,
            gpioHeater
        });
    });

    gpioPowerLed.writeSync(Gpio.HIGH);

    printMessage.message('The thermostat is up and running');

    onApplicationExit(() => {
        gpioCooler.writeSync(Gpio.LOW);
        gpioHeater.writeSync(Gpio.LOW);
        gpioPowerLed.writeSync(Gpio.LOW);
        gpioCoolerLed.writeSync(Gpio.LOW);
        gpioHeaterLed.writeSync(Gpio.LOW);
    });
};

run().catch((error) => {
    printMessage.error('[ERROR]');
    console.log(error);
    process.exit(1);
});
