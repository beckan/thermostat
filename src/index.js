const W1Temp = require('w1temp');

const packageJSON = require('../package.json');
const settings = require('../settings.json');

const getTemperatureSensor = async () => {
    const sensors = await W1Temp.getSensorsUids();
    return await W1Temp.getSensor(sensors.pop(), true, 500, false);
}

const temperatureWatch = (temperature) => {
    console.log(temperature);
};

const run = async () => {
    console.log(`Welcome to ${packageJSON.name} ${packageJSON.version}`);

    console.log('\nGet temperature sensor');
    const temperatureSensor = await getTemperatureSensor();

    const temperatureTarget = settings.temperature;
    const temperatureThreshold = settings.temperatureThreshold;

    temperatureSensor.on('change', temperatureWatch);

    console.log('Termostat is up and running!\n\n');
};

run().catch((error) => {
    console.error(error);
});
