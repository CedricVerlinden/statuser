const http = require('http');
const https = require('https');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// HTTP
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

httpServer.listen(config.httpPort, () => {
    console.log('Server listening to port ' + config.httpPort);
});


// HTTPS
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, () => {
    console.log('Server listening to port ' + config.httpsPort);
});

const unifiedServer = function (req, res) {
    const parsedUrl = url.parse(req.url, true);

    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    const queryStringObject = parsedUrl.query;

    const method = req.method.toLowerCase();

    const headers = req.headers;

    const decoder = new stringDecoder('utf-8');
    let buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            payload = typeof (payload) == 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');

            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('Returning:', statusCode, payloadString);

        });
    });
};

// Routing
const router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
};