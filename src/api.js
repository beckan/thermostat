const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const Gpio = require('onoff').Gpio;

const startApi = (args) => {
    const {
        gpioCooler,
        gpioHeater,
        temperatureSensor
    } = args;

    const app = express();

    app.use(bodyParser.json());

    app.get('/status', (req, res) => {
        delete require.cache[require.resolve('../.settings.json')];
        const settings = require('../.settings.json');

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

    app.post('/settings', (req, res) => {
        delete require.cache[require.resolve('../.settings.json')];
        const settings = require('../.settings.json');

        const newSettings = {
            temperature: req.body.temperature || settings.temperature,
            temperatureThreshold: req.body.temperatureThreshold || settings.temperatureThreshold
        }

        fs.writeFileSync('./.settings.json', JSON.stringify(newSettings));

        res.send({status: 'ok'});
    });

    app.listen(process.env.API_PORT, () => {
        console.log(`API is up and running at http://localhost:${process.env.API_PORT}`)
    });
};

module.exports = startApi;