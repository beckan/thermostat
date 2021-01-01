const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const Gpio = require('onoff').Gpio;

const packageJSON = require('../package.json');

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
                version: packageJSON.version,
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

    return new Promise(resolve => {
        app.listen(process.env.API_PORT, () => {
            resolve();
        });
    });
};

module.exports = startApi;