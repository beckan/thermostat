const W1Temp = require('w1temp');

const packageJSON = require('../package.json');
const settings = require('../settings.json');

const getTemperatureSensor = async () => {
    const sensors = await W1Temp.getSensorsUids();
    return await W1Temp.getSensor(sensors.pop(), true, 1000, false);
}

const temperatureWatch = (temperature, settings) => {
    console.log(settings);
    console.log(temperature);

    const heatThreshold = settings.temperature + settings.temperatureThreshold;
    const coldThreshold = settings.temperature - settings.temperatureThreshold;

    let cooling = false;
    let heating = false;

    if (temperature > heatThreshold && !cooling) {
        console.log('to hot! Turn on cooling');
    } else if (temperature < coldThreshold && !heating) {
        console.log('to cold! Turn on heating!');
    } else if (cooling && temperature < temperatureTarget) {
        console.log('turn off cooling');
    } else if (heating && temperature > temperatureTarget) {
        console.log('turn off heating');
    } else if (temperature < heatThreshold && temperature > coldThreshold) {
        console.log('Temp in range. Take it easy :)');
    } else {
        console.log('continue');
    }
};

const run = async () => {
    console.log(`Welcome to ${packageJSON.name} ${packageJSON.version}`);

    console.log('\nGet temperature sensor');
    const temperatureSensor = await getTemperatureSensor();

    temperatureSensor.on('change', (temperature) => {
        temperatureWatch(temperature, settings);
    });

    console.log('Termostat is up and running!\n\n');
};

run().catch((error) => {
    console.error(error);
});
