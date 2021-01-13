const W1Temp = require("w1temp");

const getTemperatureSensor = async (pollInterval) => {
    const sensors = await W1Temp.getSensorsUids();
    return await W1Temp.getSensor(sensors.pop(), true, pollInterval, false);
}

module.exports = getTemperatureSensor;