const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const Gpio = require('onoff').Gpio;
const getConfig = require("./utils/get-config");

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
        const config = getConfig();

        try {
            res.send({
                version: packageJSON.version,
                temperature: temperatureSensor.getTemperature(),
                cooling: gpioCooler.readSync() === Gpio[process.env.GPIO_COOLER_ON],
                heating: gpioHeater.readSync() === Gpio[process.env.GPIO_HEATER_ON],
                config
            });
        } catch {
            res.sendStatus(500);
        }
    });

    app.post('/config', (req, res) => {
        const config = getConfig();

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