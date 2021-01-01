const fs = require("fs");

const doConfigFileExist = () => {
    return fs.existsSync('./.config.json');
};

module.exports = doConfigFileExist;