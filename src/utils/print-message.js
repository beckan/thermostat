const chalk = require("chalk");
const printMessages = {
    splash: (text) => {
        const spacedText = `   ${text}   `;
        const dashes = spacedText.split('').reduce((a) => a + '-', '');
        console.log(dashes);
        console.log(spacedText);
        console.log(dashes + '\n');
    },
    heading: (text) => {
        console.log(chalk.black.bgWhite(`   ${text}   `) + '\n');
    },
    success: (text) => {
        console.log(chalk.greenBright(text) + '\n');
    },
    error: (text) => {
        console.log(chalk.redBright(text) + '\n');
    },
    message: (text) => {
        console.log(text + '\n');
    }
};

module.exports = printMessages;