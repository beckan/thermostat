const express = require('express');
const Gpio = require('onoff').Gpio;

const startApi = (args) => {
    const {
        settings,
        gpioCooler,
        gpioHeater,
        temperatureSensor
    } = args;

    const app = express();

    app.get('/status', (req, res) => {
        try {
            res.send({
                temperature: temperatureSensor.getTemperature(),
                cooling: gpioCooler.readSync() === Gpio.HIGH,
                heating: gpioHeater.readSync() === Gpio.HIGH,
                settings
            });
        } catch {
            res.sendStatus(500);
        }
    });

    app.listen(settings.apiPort, () => {
        console.log(`API is up and running at http://localhost:${settings.apiPort}`)
    });
};

module.exports = startApi;