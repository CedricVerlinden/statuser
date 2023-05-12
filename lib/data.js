const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

const lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');

// Write
lib.create = function (dir, file, data, callback) {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                            return;
                        }

                        callback('Error cosing new file');
                    });
                    return;
                }

                callback('Error writing to new file');
            });
            return;
        }

        callback('Could not create new file, it may already exist');
    });
};

// Read
lib.read = function (dir, file, callback) {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
        if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
            return;
        }

        callback(err, data);
    });
};

// Update
lib.update = function (dir, file, data, callback) {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            fs.ftruncate(fileDescriptor, (err) => {
                if (!err) {
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false);
                                    return;
                                }

                                callback('Error closing existing file');
                            });
                            return;
                        }

                        callback('Error writing to existing file');
                    });
                    return;
                }

                callback('Error truncating file');
            });
            return;
        }

        callback('Could not open the file for updating, it may not exist yet');
    });
};

// Delete
lib.delete = function (dir, file, callback) {
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
        if (!err) {
            callback(false);
            return;
        }

        callback('Could not delete existing file');
    });
};

lib.list = function (dir, callback) {
    fs.readdir(lib.baseDir + dir + '/', (err, data) => {
        if (!err && data && data.length > 0) {
            const trimmedFileNames = [];
            data.forEach((fileName) => {
                trimmedFileNames.push(fileName.replace('.json', ''));
            });

            callback(false, trimmedFileNames);
            return;
        }

        callback(err, data);
    });
};

module.exports = lib;