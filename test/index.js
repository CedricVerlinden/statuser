process.env.NODE_ENV = 'testing';

_app = {};

_app.tests = {};

_app.tests.unit = require('./unit');
_app.tests.api = require('./api');

_app.countTests = function () {
    let counter = 0;

    for (const key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            const subTests = _app.tests[key];
            for (const testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    counter++;
                }
            }
        }
    }

    return counter;
};

_app.runTests = function () {
    let errors = [];
    let successes = 0;
    const limit = _app.countTests();
    let counter = 0;

    for (const key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            const subTests = _app.tests[key];
            for (const testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    (function () {
                        const tmpTestName = testName;
                        var testValue = subTests[testName];
                        try {
                            testValue(function () {
                                console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                                counter++;
                                successes++;
                                if (counter == limit) {
                                    _app.produceTestReport(limit, successes, errors);
                                }
                            });
                        } catch (ex) {
                            errors.push({
                                'name': testName,
                                'error': ex
                            });

                            console.log('\x1b[31m%s\x1b[0m', tmpTestName);
                            counter++;
                            if (counter == limit) {
                                _app.produceTestReport(limit, successes, errors);
                            }
                        }
                    })();
                }
            }
        }
    }
};

_app.produceTestReport = function (limit, successes, errors) {
    console.log("")
    console.log("-------------------- BEGIN TEST REPORT --------------------")
    console.log("")
    console.log("Total Tests:", limit);
    console.log("Pass:", successes);
    console.log("Fail:", errors.length);
    console.log("")

    if (errors.length > 0) {
        console.log("---------- BEGIN ERROR REPORT ----------")
        console.log("");

        errors.forEach((testError) => {
            console.log('\x1b[31m%s\x1b[0m', testError.name);
            console.log(testError.error);
            console.log("");
        });

        console.log("");
        console.log("----------- END TEST REPORT -----------")
    }

    console.log("")
    console.log("--------------------- END TEST REPORT ---------------------")
    process.exit();
}

_app.runTests();