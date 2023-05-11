const crypto = require('crypto');
const config = require('./config');
const { type } = require('os');
const { callbackify } = require('util');

const helpers = {};

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
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';

        for (i = 0; i < strLength; i++) {
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length)); 
            str+=randomCharacter;
        }
        return str;
    }
    return false;
}

module.exports = helpers;