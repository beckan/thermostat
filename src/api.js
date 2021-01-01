const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const printMessage = require("./utils/print-message");
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
        delete require.cache[require.resolve('../.config.json')];
        const config = require('../.config.json');

        try {
            res.send({
                temperature: temperatureSensor.getTemperature(),
                cooling: gpioCooler.readSync() === Gpio.HIGH,
                heating: gpioHeater.readSync() === Gpio.HIGH,
                config
            });
        } catch {
            res.sendStatus(500);
        }
    });

    app.post('/config', (req, res) => {
        delete require.cache[require.resolve('../.config.json')];
        const config = require('../.config.json');

        const newConfig = {
            temperature: req.body.temperature || config.temperature,
            temperatureThreshold: req.body.temperatureThreshold || config.temperatureThreshold
        }

        fs.writeFileSync('./.config.json', JSON.stringify(newConfig));

        res.send({status: 'ok'});
    });

    app.listen(process.env.API_PORT, () => {
        printMessage.heading('Starting API');
        printMessage.success('[DONE]');
    });
};

module.exports = startApi;