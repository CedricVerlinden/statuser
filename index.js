const server = require('./lib/server');
const workers = require('./lib/workers');

process.on('uncaughtException', function (err) {
    console.log(err);
});

const app = {};

app.init = function () {
    server.init();
    workers.init();
};

app.init();

module.exports = app;