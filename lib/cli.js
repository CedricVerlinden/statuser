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
    const commands = {
        'exit': 'Kill the CLI (and the rest of the application)',
        'man': 'Show this help page',
        'help': 'Alias of the "man" command',
        'stats': 'Get statistics on the underlying operating system and resource utilization',
        'list users': 'Show a list of all the registered (undeleted) users in the system',
        'more user info --{userId}': 'Show details of a specific users',
        'list checks --up --down': 'Show a list of all the active checks in the system, including their state. The "--up" and the "--down" flags are both optional',
        'more check info --{checkId}': 'Show details of a specified check',
        'list logs': 'Show a list of all the log files available to be read (compressed and uncompressed)',
        'more log info --{fileName}': 'Show details of a specified log file'
    };

    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    for (const key in commands) {
        if (commands.hasOwnProperty(key)) {
            const value = commands[key];
            let line = '\x1b[33m' + key + '\x1b[0m';
            const padding = 60 - line.length;
            for (i = 0; i < padding; i++) {
                line += ' ';
            }

            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace(1);
    cli.horizontalLine();
}

cli.verticalSpace = function (lines) {
    lines = typeof (lines) == 'number' && lines > 0 ? lines : 1;
    for (i = 0; i < lines; i++) {
        console.log('');
    }
};

cli.horizontalLine = function () {
    const width = process.stdout.columns;

    let line = '';
    for (i = 0; i < width; i++) {
        line += '-';
    }

    console.log(line);
};

cli.centered = function (str) {
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : '';

    const width = process.stdout.columns;

    const leftPadding = Math.floor((width - str.length) / 2);

    let line = '';
    for (i = 0; i < leftPadding; i++) {
        line += ' ';
    }

    line += str;
    console.log(line);
};

cli.responders.exit = function () {
    process.exit();
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