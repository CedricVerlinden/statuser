const _data = require('./data');
const https = require('https');
const http = require('http');
const helpers = require('./helpers');
const url = require('url');
const _logs = require('./logs');
const { Z_BINARY } = require('zlib');

const workers = {};

workers.gatherChecks = function () {
    _data.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach((check) => {
                _data.read('checks', check, (err, origData) => {
                    if (!err && origData) {
                        workers.validate(origData);
                        return;
                    }

                    console.log('Error reading check data');
                });
            });

            return;
        };

        console.log('Could not find any checks');
    });
};

workers.validate = function (origData) {
    origData = typeof (origData) == 'object' && origData !== null ? origData : {};

    origData.id = typeof (origData.id) == 'string' && origData.id.trim().length == 20 ? origData.id.trim() : false;
    origData.phone = typeof (origData.phone) == 'string' && origData.phone.trim().length == 10 ? origData.phone.trim() : false;
    origData.protocol = typeof (origData.protocol) == 'string' && ['http', 'https'].indexOf(origData.protocol) > -1 ? origData.protocol : false;
    origData.url = typeof (origData.url) == 'string' && origData.url.trim().length > 0 ? origData.url.trim() : false;
    origData.method = typeof (origData.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(origData.method) > -1 ? origData.method : false;
    origData.successCodes = typeof (origData.successCodes) == 'object' && origData.successCodes instanceof Array && origData.successCodes.length > 0 ? origData.successCodes : false;
    origData.timeoutSeconds = typeof (origData.timeoutSeconds) == 'number' && origData.timeoutSeconds % 1 === 0 && origData.timeoutSeconds >= 1 && origData.timeoutSeconds <= 5 ? origData.timeoutSeconds : false;

    origData.state = typeof (origData.state) == 'string' && ['up', 'down'].indexOf(origData.state) > -1 ? origData.state : 'down';
    origData.lastChecked = typeof (origData.lastChecked) == 'number' && origData.lastChecked > 0 ? origData.lastChecked : false;

    if (origData.id && origData.phone && origData.protocol && origData.url && origData.method && origData.successCodes && origData.timeoutSeconds) {
        workers.performCheck(origData);
        return;
    }

    console.log('Check data is not valid');
};

workers.performCheck = function (origData) {
    const checkOutcome = {
        'error': false,
        'responseCode': false
    };

    let outcomeSent = false;

    const parsedUrl = url.parse(origData.protocol + '://' + origData.url, true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path;

    const requestDetails = {
        'protocol': origData.protocol + ':',
        'hostname': hostName,
        'method': origData.method.toUpperCase(),
        'path': path,
        'timeout': origData.timeoutSeconds * 1000
    };

    const _moduleToUse = origData.protocol == 'http' ? http : https;
    const req = _moduleToUse.request(requestDetails, (res) => {
        const status = res.statusCode;

        checkOutcome.responseCode = status;
        if (!outcomeSent) {
            workers.processCheckOutcome(origData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on('error', (err) => {
        checkOutcome.error = {
            'error': true,
            'value': err
        };

        if (!outcomeSent) {
            workers.processCheckOutcome(origData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on('timeout', (err) => {
        checkOutcome.error = {
            'error': true,
            'value': 'timeout'
        };

        if (!outcomeSent) {
            workers.processCheckOutcome(origData, checkOutcome);
            outcomeSent = true;
        }
    });

    req.end();
};

workers.processCheckOutcome = function (origData, checkOutcome) {
    const state = !checkOutcome.error && checkOutcome.responseCode && origData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    const alertWarranted = origData.lastChecked && origData.state !== state ? true : false;

    const timeOfCheck = Date.now();
    workers.log(origData, checkOutcome, state, alertWarranted, timeOfCheck);

    const newCheckData = origData;
    newCheckData.state = state;
    newCheckData.lastChecked = timeOfCheck;


    _data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWarranted) {
                workers.alertUser(newCheckData);
                return;
            }

            console.log('Outcome has not changed, no alert needed.');
            return;
        }

        console.log('Could not save check');
    });
};

workers.alertUser = function (checkData) {
    const message = 'Alert: Your check for ' + checkData.method.toUpperCase() + ' ' + checkData.protocol + '://' + checkData.url + ' is currently ' + checkData.state;
    helpers.sendSms(checkData.phone, message, (err) => {
        if (!err) {
            console.log('User was alerted through sms: ' + message);
            return;
        }

        console.log('Could not send alert to user who had a state change in their check');
    });
};

workers.log = function (origData, checkOutcome, state, alertWarranted, timeOfCheck) {
    const logData = {
        'check': origData,
        'outcome': checkOutcome,
        'state': state,
        'alert': alertWarranted,
        'time': timeOfCheck
    };

    const logString = JSON.stringify(logData);

    const logFileName = origData.id;

    _logs.append(logFileName, logString, (err) => {
        if (!err) {
            console.log('Logged to file');
            return;
        }

        console.log('Could not log to file');
    });
};

workers.loop = function () {
    setInterval(() => {
        workers.gatherChecks();
    }, 1000 * 60);
};

workers.rotateLogs = function () {
    _logs.list(false, (err, logs) => {
        if (!err && logs && logs.length > 0) {
            logs.forEach((log) => {
                const logId = log.replace('.log', '');
                const newFileId = logId+'-'+Date.now();
                _logs.compress(logId, newFileId, (err) => {
                    if (!err) {
                        _logs.truncate(logId, (err) => {
                            if (!err) {
                                console.log('Truncated log file');
                                return;
                            }

                            console.log('Could not truncate log file');
                        });
                        return;
                    }

                    console.log('Could not compress log file:', err);
                });
            });
            return;
        }

        console.log('Could not find any logs');
    });
},

    workers.logRotationLoop = function () {
        setInterval(() => {
            workers.rotateLogs();
        }, 1000 * 60 * 60 * 24);
    };

workers.init = function () {
    workers.gatherChecks();
    workers.loop();

    workers.rotateLogs();
    workers.logRotationLoop();
};

module.exports = workers;