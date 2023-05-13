const app = require('../index');
const assert = require('assert');
const http = require('http');
const config = require('../lib/config');

const api = {};

const helpers = {};
helpers.makeGetRequest = function (path, callback) {
    const requestDetails = {
        'protocol': 'http:',
        'hostname': 'localhost',
        'port': config.httpPort,
        'method': 'GET',
        'path': path,
        'header': {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(requestDetails, (res) => {
        callback(res);
    });

    req.end();
};

api['app.init should start without throwing'] = function (done) {
    assert.doesNotThrow(() => {
        app.init((err) => {
            done();
        });
    }, TypeError);
};

api['/ping should respond to GET with 200'] = function (done) {
    helpers.makeGetRequest('/ping', (res) => {
        assert(res.statusCode, 200);
        done();
    });
};

api['/api/users should respond to GET with 400'] = function (done) {
    helpers.makeGetRequest('/api/users', (res) => {
        assert(res.statusCode, 400);
        done();
    });
};

api['A random path should respond to GET with 404'] = function (done) {
    helpers.makeGetRequest('/random/path/that/does/not/exist', (res) => {
        assert(res.statusCode, 404);
        done();
    });
};

api

module.exports = api;