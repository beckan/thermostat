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
    try {
        printMessage.splash(`Welcome to ${packageJSON.name} ${packageJSON.version}`);

        if (!doConfigFileExist()) {
            createConfigFile();
        }

        printMessage.heading('Get temperature sensor');
        const temperatureSensor = await getTemperatureSensor();

        printMessage.success('[DONE]');

        const gpioCooler = new Gpio(process.env.GPIO_COOLER, 'out');
        const gpioHeater = new Gpio(process.env.GPIO_HEATER, 'out');

        printMessage.heading('Starting API');

        await startApi({
            gpioCooler,
            gpioHeater,
            temperatureSensor
        });

        printMessage.success('[DONE]');

        printMessage.heading('The thermostat is up and running');

        temperatureSensor.on('change', (temperature) => {
            temperatureWatch(temperature, gpioCooler, gpioHeater);
        });

        onApplicationExit(() => {
            gpioCooler.writeSync(Gpio.LOW);
            gpioHeater.writeSync(Gpio.LOW);
        });
    } catch (error) {
        printMessage.error('[ERROR]');
        console.log(error);
        process.exit(1);
    }
};

run().catch((error) => {
    console.error(error);
});
