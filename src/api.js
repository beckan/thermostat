const express = require('express');

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
                cooling: gpioCooler.readSync() === 1,
                heating: gpioHeater.readSync() === 1,
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