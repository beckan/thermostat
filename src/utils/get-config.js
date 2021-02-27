const getConfig = () => {
    delete require.cache[require.resolve('../../.config.json')];
    return require('../../.config.json');
};

module.exports = getConfig;