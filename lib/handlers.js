const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

const handlers = {};

// HTML Handlers
handlers.index = function (data, callback) {
    if (data.method == 'get') {

        const templateData = {
            'head.title': 'Uptime Monitoring - Made Simple',
            'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS sites of all kinds. When your site goes down, we\'ll send you a text to let you know.',
            'body.class': 'index'
        }

        helpers.getTemplate('index', templateData, (err, str) => {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                        return;
                    }

                    callback(500, undefined, 'html');
                });
                return;
            }

            callback(500, undefined, 'html');
        });
        return;
    }

    callback(405, undefined, 'html');
};

handlers.accountCreate = function (data, callback) {
    if (data.method == 'get') {

        const templateData = {
            'head.title': 'Create an Account',
            'head.description': 'Sign up is easy and only takes a few seconds.',
            'body.class': 'accountCreate'
        }

        helpers.getTemplate('accountCreate', templateData, (err, str) => {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                        return;
                    }

                    callback(500, undefined, 'html');
                });
                return;
            }

            callback(500, undefined, 'html');
        });
        return;
    }

    callback(405, undefined, 'html');
};

handlers.sessionCreate = function (data, callback) {
    if (data.method == 'get') {

        const templateData = {
            'head.title': 'Log in to your account',
            'head.description': 'Please enter your phone number and password to access your account.',
            'body.class': 'sessionCreate'
        }

        helpers.getTemplate('sessionCreate', templateData, (err, str) => {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                        return;
                    }

                    callback(500, undefined, 'html');
                });
                return;
            }

            callback(500, undefined, 'html');
        });
        return;
    }

    callback(405, undefined, 'html');
};

handlers.sessionDeleted = function (data, callback) {
    if (data.method == 'get') {

        const templateData = {
            'head.title': 'Logged out',
            'head.description': 'You have been logged out of your account',
            'body.class': 'sessionDeleted'
        }

        helpers.getTemplate('sessionDeleted', templateData, (err, str) => {
            if (!err && str) {
                helpers.addUniversalTemplates(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                        return;
                    }

                    callback(500, undefined, 'html');
                });
                return;
            }

            callback(500, undefined, 'html');
        });
        return;
    }

    callback(405, undefined, 'html');
};

handlers.favicon = function (data, callback) {
    if (data.method == 'get') {
        helpers.getStaticAsset('favicon.ico', (err, data) => {
            if (!err && data) {
                callback(200, data, 'favicon');
                return;
            }

            callback(500);
        });
        return;
    }

    callback(405);
};

handlers.public = function (data, callback) {
    if (data.method == 'get') {
        const trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
        if (trimmedAssetName.length > 0) {
            helpers.getStaticAsset(trimmedAssetName, (err, data) => {
                if (!err && data) {
                    let contentType = 'plain';

                    if (trimmedAssetName.indexOf('.css') > -1) {
                        contentType = 'css';
                    }
                    
                    if (trimmedAssetName.indexOf('.png') > -1) {
                        contentType = 'png';
                    }
                    
                    if (trimmedAssetName.indexOf('.jpg') > -1) {
                        contentType = 'jpg';
                    }
                    
                    if (trimmedAssetName.indexOf('.ico') > -1) {
                        contentType = 'favicon';
                    }

                    callback(200, data, contentType);
                    return;
                }

                callback(404);
            });
            return;
        }

        callback(404);
        return;
    }

    callback(405);
}

// JSON API Handlers
handlers.ping = function (data, callback) {
    callback(200);
};

handlers.users = function (data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
        return;
    }

    callback(405);
};

handlers._users = {};

handlers._users.post = function (data, callback) {
    const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tos = typeof (data.payload.tos) == 'boolean' && data.payload.tos == true ? true : false;

    if (firstName && lastName && phone && password && tos) {
        _data.read('users', phone, (err, data) => {
            if (err) {
                const hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    const userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tos': true
                    };

                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                            return;
                        }

                        callback(500, { 'Error': 'Could not create user' });
                    });

                    return;
                }

                callback(500, { 'Error': 'Could not hash password' });
            }

            callback(400, { 'Error': 'Phonenumber is already in use' })
        });
        return;
    }

    callback(400, { 'Error': 'Missing required fields' });

};

handlers._users.get = function (data, callback) {
    const phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false
    if (phone) {
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token, phone, (valid) => {
            if (valid) {
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        delete data.hashedPassword;
                        callback(200, data, 'json');
                        return;
                    }

                    callback(404);
                });
                return;
            }

            callback(403, { 'Error': 'Missing required token' });
        });
        return;
    }

    callback(400, { 'Error': 'Missing required field' });
};

handlers._users.put = function (data, callback) {
    const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false

    const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone) {
        if (firstName || lastName || password) {
            const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
            handlers._tokens.verifyToken(token, phone, (valid) => {
                if (valid) {
                    _data.read('users', phone, (err, data) => {
                        if (!err && data) {
                            if (firstName) {
                                data.firstName = firstName;
                            }

                            if (lastName) {
                                data.lastName = lastName;
                            }

                            if (password) {
                                data.hashedPassword = helpers.hash(password);
                            }

                            _data.update('users', phone, data, (err) => {
                                if (!err) {
                                    callback(200);
                                    return;
                                }

                                callback(500, { 'Error': 'Could not update user' });
                            });
                            return;
                        }

                        callback(400, { 'Error': 'The user does not exist' })
                    });
                    return;
                }

                callback(403, { 'Error': 'Missing required token' });
            });
            return;
        }

        callback(400, { 'Error': 'Missing fields to update' });
        return;
    }

    callback(400, { 'Error': 'Missing required field' });
};

handlers._users.delete = function (data, callback) {
    const phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false

    if (phone) {
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token, phone, (valid) => {
            if (valid) {
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        _data.delete('users', phone, (err) => {
                            if (!err) {
                                const userChecks = typeof (data.checks) == 'object' && data.checks instanceof Array ? data.checks : [];
                                const checksToDelete = userChecks.length;
                                if (checksToDelete > 0) {
                                    let checksDeleted = 0;
                                    const deletionErrors = false;
                                    userChecks.forEach((id) => {
                                        _data.delete('checks', id, (err) => {
                                            if (err) {
                                                deletionErrors = true;
                                                return;
                                            }
                                            checksDeleted++;
                                            if (checksDeleted == checksToDelete) {
                                                if (!deletionErrors) {
                                                    callback(200);
                                                    return;
                                                }

                                                callback(500, { 'Error': 'Error deleting checks of users' });
                                            }
                                        });
                                    });
                                    return;
                                }

                                callback(200);
                                return;
                            }

                            callback(500, { 'Error': 'Could not delete user' });
                        });
                        return;
                    }

                    callback(400, { 'Error': 'Could not find user' });
                });
                return;
            }

            callback(403, { 'Error': 'Missing required token' });
        });
        return;
    }

    callback(400, { 'Error': 'Missing required field' });
};


handlers.tokens = function (data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
        return;
    }

    callback(405);
};

handlers._tokens = {};

handlers._tokens.post = function (data, callback) {
    const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone && password) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                const hashedPassword = helpers.hash(password);
                if (hashedPassword == data.hashedPassword) {
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires,
                    };

                    _data.create('tokens', tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject, 'json');
                            return;
                        }

                        callback(500, { 'Error': 'Could not save token' });
                    });
                    return;
                }
                callback(400, { 'Error': 'Credentials do not match' });
                return;
            }

            callback(400, { 'Error': 'Could not find user' });
        });
        return;
    }

    callback(400, { 'Error': 'Missing required fields' });
};

handlers._tokens.get = function (data, callback) {
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
    if (id) {
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                callback(200, data);
                return;
            }

            callback(404);
        })
        return;
    }

    callback(400, { 'Error': 'Missing required field' });
};

handlers._tokens.put = function (data, callback) {
    const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    const extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? data.payload.extend : false;
    if (id && extend) {
        _data.read('tokens', id, (err, data) => {
            if (!err) {
                if (data.expires > Date.now()) {
                    data.expires = Date.now() + 1000 * 60 * 60;
                    _data.update('tokens', id, data, (err) => {
                        if (!err) {
                            callback(200);
                            return;
                        }

                        callback(500, { 'Error': 'Could not update token' });
                    });
                    return;
                }

                callback(400, { 'Error': 'Token has expired' });
                return;
            }

            callback(400, { 'Error:': 'Could not find token' });
        });
        return;
    }

    callback(400, { 'Error': 'Missing required fields' });
};

handlers._tokens.delete = function (data, callback) {
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false

    if (id) {
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                _data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200);
                        return;
                    }

                    callback(500, { 'Error': 'Could not delete token' });
                });
                return;
            }

            callback(400, { 'Error': 'Could not find token' });
        })
        return;
    }

    callback(400, { 'Error': 'Missing required field' });
};

handlers._tokens.verifyToken = function (id, phone, callback) {
    _data.read('tokens', id, (err, data) => {
        if (!err && data) {
            if (data.phone == phone && data.expires > Date.now()) {
                callback(true);
                return;
            }

            callback(false);
            return;
        }

        callback(false)
    });
}

handlers.checks = function (data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
        return;
    }

    callback(405);
};

handlers._checks = {};

handlers._checks.post = function (data, callback) {
    const protocol = typeof (data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        _data.read('tokens', token, (err, data) => {
            if (!err && data) {
                const phone = data.phone;
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        const checks = typeof (data.checks) == 'object' && data.checks instanceof Array ? data.checks : [];
                        if (checks.length < config.maxChecks) {
                            const id = helpers.createRandomString(20);
                            const checkObject = {
                                'id': id,
                                'phone': phone,
                                'protocol': protocol,
                                'url': url,
                                'method': method,
                                'successCodes': successCodes,
                                'timeoutSeconds': timeoutSeconds
                            };
                            _data.create('checks', id, checkObject, (err) => {
                                if (!err) {
                                    data.checks = checks;
                                    data.checks.push(id);
                                    _data.update('users', phone, data, (err) => {
                                        if (!err) {
                                            callback(200, checkObject, 'json');
                                            return;
                                        }

                                        callback(500, { 'Error': 'Could not save check' });
                                    });
                                    return;
                                }

                                callback(500, { 'Error': 'Could not create check' });
                            });
                            return;
                        }

                        callback(400, { 'Error': 'Max checks reached' });
                        return;
                    }

                    callback(403);
                });
                return;
            }

            callback(403);
        });
        return;
    }

    callback(400, { 'Error': 'Missing required fields' });
};

handlers._checks.get = function (data, callback) {
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
    if (id) {
        _data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                handlers._tokens.verifyToken(token, checkData.phone, (valid) => {
                    if (valid) {
                        callback(200, checkData, 'json');
                        return;
                    }

                    callback(403, { 'Error': 'Missing required token' });
                });
                return;
            }

            callback(404);
        });

        return;
    }

    callback(400, { 'Error': 'Missing required field' });
};

handlers._checks.put = function (data, callback) {
    const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false

    const protocol = typeof (data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false; const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            _data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                    handlers._tokens.verifyToken(token, checkData.phone, (valid) => {
                        if (valid) {
                            if (protocol) {
                                checkData.protocol = protocol;
                            }

                            if (url) {
                                checkData.url = url;
                            }

                            if (method) {
                                checkData.method = method;
                            }

                            if (successCodes) {
                                checkData.successCodes = successCodes;
                            }

                            if (timeoutSeconds) {
                                checkData.timeoutSeconds = timeoutSeconds;
                            }

                            _data.update('checks', id, checkData, (err) => {
                                if (!err) {
                                    callback(200);
                                    return;
                                }

                                callback(500, { 'Error': 'Could not update check' });
                            });
                            return;
                        }

                        callback(403);
                    });
                    return;
                }

                callback(400, { 'Error': 'Check does not exist' });
            });
            return;
        }

        callback(400, { 'Error': 'Missing fields to update' });
        return;
    }

    callback(400, { 'Error': 'Missing required field' });
};

handlers._checks.delete = function (data, callback) {
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false

    if (id) {
        _data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                handlers._tokens.verifyToken(token, checkData.phone, (valid) => {
                    if (valid) {
                        _data.delete('checks', id, (err) => {
                            if (!err) {
                                _data.read('users', checkData.phone, (err, userData) => {
                                    if (!err && userData) {
                                        const userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                        const checkPosition = userChecks.indexOf(id);
                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                            _data.update('users', checkData.phone, userData, (err) => {
                                                if (!err) {
                                                    callback(200);
                                                    return;
                                                }

                                                callback(500, { 'Error': 'Could not update check for user' });
                                            });
                                            return;
                                        }

                                        callback(500, { 'Error': 'Could not delete check from user' });
                                        return;
                                    }

                                    callback(400, { 'Error': 'Could not find token' });
                                });
                                return;
                            }

                            callback(500, { 'Error': 'Could not delete check' });
                            return;
                        });
                        return;
                    }

                    callback(403);
                    return;
                });
                return;
            }
            callback(400, { 'Error': 'Check does not exist' });
        });
        return;
    }

    callback(400, { 'Error': 'Missing required field' });
};


handlers.notFound = function (data, callback) {
    callback(404);
};

module.exports = handlers;