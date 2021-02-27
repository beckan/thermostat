const getConfig = require("./utils/get-config");
const printMessage = require("./utils/print-message");
const Gpio = require('onoff').Gpio;

const temperatureWatch = ({temperature, gpioCoolerLed, gpioHeaterLed, gpioCooler, gpioHeater}) => {
    const turnOnCooling = () => {
        gpioCooler.writeSync(Gpio[process.env.GPIO_COOLER_ON]);
        gpioCoolerLed.writeSync(Gpio.HIGH);
    };
    const turnOffCooling = () => {
        gpioCooler.writeSync(Gpio[process.env.GPIO_COOLER_OFF]);
        gpioCoolerLed.writeSync(Gpio.LOW);
    };
    const turnOnHeating = () => {
        gpioHeater.writeSync(Gpio[process.env.GPIO_HEATER_ON]);
        gpioHeaterLed.writeSync(Gpio.HIGH);
    };
    const turnOffHeating = () => {
        gpioHeater.writeSync(Gpio[process.env.GPIO_HEATER_OFF]);
        gpioHeaterLed.writeSync(Gpio.LOW);
    };

    const settings = getConfig();

    printMessage.message('[Current temp: ' + temperature + ' deg C]');

    const heatThreshold = settings.temperature + settings.temperatureThreshold;
    const coldThreshold = settings.temperature - settings.temperatureThreshold;

    let cooling = gpioCooler.readSync() === Gpio[process.env.GPIO_COOLER_ON];
    let heating = gpioHeater.readSync() === Gpio[process.env.GPIO_HEATER_ON];

    if (temperature === false) {
        printMessage.message('Can\'t get temperature data');
    } else if (temperature > heatThreshold && !cooling) {
        turnOnCooling();
        turnOffHeating();
        printMessage.message('Turn on cooling');
    } else if (temperature < coldThreshold && !heating) {
        turnOffCooling();
        turnOnHeating();
        printMessage.message('Turn on heating');
    } else if (cooling && temperature <= settings.temperature) {
        turnOffCooling();
        printMessage.message('Turn off cooling');
    } else if (heating && temperature >= settings.temperature) {
        turnOffHeating();
        printMessage.message('Turn off heating');
    } else if (!cooling && !heating && temperature <= heatThreshold && temperature >= coldThreshold) {
        printMessage.idle('Idle, temperature in range.');
    } else {
        if (cooling) {
            printMessage.cool('Cooling');
        } else if (heating) {
            printMessage.heat('Heating');
        }
    }
};

module.exports = temperatureWatch;