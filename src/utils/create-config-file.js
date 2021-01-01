const fs = require("fs");

const createConfigFile = () => {
    fs.writeFileSync('./.config.json', JSON.stringify({
        temperature: 20,
        temperatureThreshold: 1
    }));
};

module.exports = createConfigFile;