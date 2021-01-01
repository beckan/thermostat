const Gpio = require('onoff').Gpio;

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

module.exports = temperatureWatch;