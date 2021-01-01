const W1Temp = require("w1temp");

const getTemperatureSensor = async () => {
    const sensors = await W1Temp.getSensorsUids();
    return await W1Temp.getSensor(sensors.pop(), true, 1000, false);
}

module.exports = getTemperatureSensor;