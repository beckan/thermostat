const printMessage = require('./print-message');

const onApplicationExit = (callback) => {
    const turnOffEverything = () => {
        callback();
        process.exit();
    };

    process.on('exit', turnOffEverything);
    process.on('SIGINT', turnOffEverything);
    process.on('SIGUSR1', turnOffEverything);
    process.on('SIGUSR2', turnOffEverything);
    process.on('uncaughtException', (err) => {
        printMessage.error('[ERROR]');
        console.log(err);

        turnOffEverything();
    });
};

module.exports = onApplicationExit;