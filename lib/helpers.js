const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');

const helpers = {};

helpers.getANumber = function () {
    return 1;
};

helpers.hash = function (str) {
    if (typeof (str) == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    }

    return false;
};

helpers.parseJsonToObject = function (str) {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (ex) {
        return {};
    }
};

helpers.createRandomString = function (strLength) {
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';

        for (i = 0; i < strLength; i++) {
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str += randomCharacter;
        }
        return str;
    }
    return false;
}

helpers.sendSms = function (phone, message, callback) {
    phone = typeof (phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    message = typeof (message) == 'string' && message.trim().length && message.trim().length <= 1600 ? message.trim() : false;

    if (phone && message) {
        const payload = {
            'From': config.twilio.fromPhone,
            'To': '+1' + phone,
            'Body': message
        };

        const stringPayload = querystring.stringify(payload);

        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
            'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            },
        };

        const req = https.request(requestDetails, (res) => {
            const status = res.statusCode;
            if (status == 200 || status == 201) {
                callback(false);
                return;
            }

            callback('Status code: ' + status);
        });

        req.on('error', (err) => {
            callback(err);
        });

        req.write(stringPayload);
        req.end();
        return;
    }

    callback('Invalid parameters');
}

helpers.getTemplate = function (templateName, data, callback) {
    templateName = typeof (templateName) == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof (data) == 'object' && data !== null ? data : {};
    if (templateName) {
        const templatesDir = path.join(__dirname, '/../templates/');
        fs.readFile(templatesDir + templateName + '.html', 'utf-8', (err, str) => {
            if (!err && str && str.length > 0) {
                const finalString = helpers.interpolate(str, data);
                callback(false, finalString);
                return;
            }

            callback('Could not find page');
        });
        return;
    }

    callback('Invalid page name');
};

helpers.addUniversalTemplates = function (str, data, callback) {
    str = typeof (str) == 'string' && str.length > 0 ? str : false;
    data = typeof (data) == 'object' && data !== null ? data : {};

    helpers.getTemplate('_header', data, (err, headerString) => {
        if (!err && headerString) {
            helpers.getTemplate('_footer', data, (err, footerString) => {
                if (!err && footerString) {
                    const fullString = headerString + str + footerString;
                    callback(false, fullString);
                    return;
                }

                callback('Could not find footer');
            });
            return;
        }

        callback('Could not find header');
    });
};

helpers.interpolate = function (str, data) {
    str = typeof (str) == 'string' && str.length > 0 ? str : false;
    data = typeof (data) == 'object' && data !== null ? data : {};

    for (const keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data['global.' + keyName] = config.templateGlobals[keyName];
        }
    }

    for (const key in data) {
        if (data.hasOwnProperty(key) && typeof (data[key]) == 'string') {
            const replace = data[key];
            const find = '{' + key + '}';
            str = str.replace(find, replace);
        }
    }

    return str;
}

helpers.getStaticAsset = function (fileName, callback) {
    fileName = typeof (fileName) == 'string' && fileName.length > 0 ? fileName : false;

    if (fileName) {
        const publicDir = path.join(__dirname, '/../public/');
        fs.readFile(publicDir+fileName, (err, data) => {
            if (!err && data) {
                callback(false, data);
                return;
            }

            callback('Could not find file');
        });
        return;
    }

    callback('Invalid filename');
};

module.exports = helpers;