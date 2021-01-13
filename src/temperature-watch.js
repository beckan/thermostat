const printMessage = require("./utils/print-message");
const Gpio = require('onoff').Gpio;

const temperatureWatch = ({temperature, gpioCoolerLed, gpioHeaterLed, gpioCooler, gpioHeater}) => {
    const turnOnCooling = () => {
        gpioCooler.writeSync(Gpio.HIGH);
        gpioCoolerLed.writeSync(Gpio.HIGH);
    };
    const turnOffCooling = () => {
        gpioCooler.writeSync(Gpio.LOW);
        gpioCoolerLed.writeSync(Gpio.LOW);
    };
    const turnOnHeating = () => {
        gpioHeater.writeSync(Gpio.HIGH);
        gpioHeaterLed.writeSync(Gpio.HIGH);
    };
    const turnOffHeating = () => {
        gpioHeater.writeSync(Gpio.LOW);
        gpioHeaterLed.writeSync(Gpio.LOW);
    };

    const settings = require('../.config.json');

    printMessage.message('[Current temp: ' + temperature + ' deg C]');

    const heatThreshold = settings.temperature + settings.temperatureThreshold;
    const coldThreshold = settings.temperature - settings.temperatureThreshold;

    let cooling = gpioCooler.readSync() === Gpio.HIGH;
    let heating = gpioHeater.readSync() === Gpio.HIGH;

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