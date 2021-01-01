const printMessage = require("./utils/print-message");
const Gpio = require('onoff').Gpio;

const temperatureWatch = (temperature, gpioCooler, gpioHeater) => {
    const settings = require('../.config.json');

    printMessage.message('[Current temp: ' + temperature + ' deg C]');

    const heatThreshold = settings.temperature + settings.temperatureThreshold;
    const coldThreshold = settings.temperature - settings.temperatureThreshold;

    let cooling = gpioCooler.readSync() === Gpio.HIGH;
    let heating = gpioHeater.readSync() === Gpio.HIGH;

    if (temperature > heatThreshold && !cooling) {
        gpioCooler.writeSync(Gpio.HIGH);
        gpioHeater.writeSync(Gpio.LOW);
        printMessage.message('Turn on cooling');
    } else if (temperature < coldThreshold && !heating) {
        gpioCooler.writeSync(Gpio.LOW);
        gpioHeater.writeSync(Gpio.HIGH);
        printMessage.message('Turn on heating');
    } else if (cooling && temperature <= settings.temperature) {
        gpioCooler.writeSync(Gpio.LOW);
        printMessage.message('Turn off cooling');
    } else if (heating && temperature >= settings.temperature) {
        gpioHeater.writeSync(Gpio.LOW);
        printMessage.message('Turn off heating');
    } else if (!cooling && !heating && temperature <= heatThreshold && temperature >= coldThreshold) {
        printMessage.message('Temp in range.');
    } else {
        if (cooling) {
            printMessage.cool('Cooling');
        } else if (heating) {
            printMessage.heat('Heating');
        }
    }
};

module.exports = temperatureWatch;