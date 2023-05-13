const helpers = require('../lib/helpers');
const assert = require('assert');
const logs = require('../lib/logs');

const unit = {};

unit['helpers.getANumber should return a number'] = function (done) {
    const val = helpers.getANumber();
    assert.equal(typeof (val), 'number');
    done();
};

unit['helpers.getANumber should return 1'] = function (done) {
    const val = helpers.getANumber();
    assert.equal(val, 1);
    done();
};

unit['helpers.getANumber should return 2'] = function (done) {
    const val = helpers.getANumber();
    assert.equal(val, 2);
    done();
};

unit['logs.list should callback a false error and an array of logs names'] == function (done) {
    logs.list(true, (err, logFileNames) => {
        assert.equal(err, false);
        assert.ok(logFileNames instanceof Array);
        assert.ok(logFileNames.length > 1);
        done();
    });
};

unit['logs.truncate should not throw if the logsId does not exist. It should callback an error instead'] = function (done) {
    assert.doesNotThrow(() => {
        logs.truncate('I do not exist', (err) => {
            assert.ok(err)
            done();
        });
    }, TypeError);
};

module.exports = unit;