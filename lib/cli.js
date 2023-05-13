const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
class _events extends events { };
const e = new _events();

const cli = {};

e.on('man', (str) => {
    cli.responders.help();
});

e.on('help', (str) => {
    cli.responders.help();
});

e.on('exit', (str) => {
    cli.responders.exit();
});

e.on('stats', (str) => {
    cli.responders.stats();
});

e.on('list users', (str) => {
    cli.responders.listUsers();
});

e.on('more user info', (str) => {
    cli.responders.moreUserInfo(str);
});

e.on('list checks', (str) => {
    cli.responders.listChecks(str);
});

e.on('more check info', (str) => {
    cli.responders.moreCheckInfo(str);
});

e.on('list logs', (str) => {
    cli.responders.listLogs();
});

e.on('more log info', (str) => {
    cli.responders.moreLogInfo(str);
});

cli.responders = {};

cli.responders.help = function () {
    console.log('You asked for help');
}

cli.responders.exit = function () {
    console.log('You asked for exit');
}

cli.responders.stats = function () {
    console.log('You asked for stats');
}

cli.responders.listUsers = function () {
    console.log('You asked to list users');
}

cli.responders.moreUserInfo = function (str) {
    console.log('You asked for more user info', str);
}

cli.responders.listChecks = function (str) {
    console.log('You asked to list checks', str);
}

cli.responders.moreCheckInfo = function (str) {
    console.log('You asked for more check info', str);
}

cli.responders.listLogs = function (str) {
    console.log('You asked to list logs');
}

cli.responders.moreLogInfo = function (str) {
    console.log('You asked for more log info', str);
}

cli.processInput = function (str) {
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : false;
    if (str) {
        const uniqueInputs = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ];

        let matchFound = false;
        const counter = 0;
        uniqueInputs.some((input) => {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true;

                e.emit(input, str);
                return true;
            }
        });

        if (!matchFound) {
            console.log('Sorry, try again')
        }
    }
};

cli.init = function () {
    console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');

    const _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '$ '
    });

    _interface.prompt();

    _interface.on('line', (str) => {
        cli.processInput(str);

        _interface.prompt();
    });

    _interface.on('close', () => {
        process.exit();
    });
};

module.exports = cli;