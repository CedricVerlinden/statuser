const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const lib = {};

lib.baseDir = path.join(__dirname, '/../.logs/');

lib.append = function (file, str, callback) {
    fs.open(lib.baseDir + file + '.log', 'a', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            fs.appendFile(fileDescriptor, str + '\n', (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                            return;
                        }

                        callback('Could not close log file');
                    });
                    return;
                }

                callback('Could not append to log file');
            });
            return;
        }

        callback('Could not open log file');
    });
};

lib.list = function (includeCompressedLogs, callback) {
    fs.readdir(lib.baseDir, (err, data) => {
        if (!err && data && data.length > 0) {
            const trimmedFileNames = [];
            data.forEach((fileName) => {
                if (fileName.indexOf('.log') > -1) {
                    trimmedFileNames.push(fileName.replace('.log', ''));
                }

                if (includeCompressedLogs && fileName.indexOf('.gz.b64') > -1) {
                    trimmedFileNames.push(fileName.replace('.gz.b64', ''));
                }
            });

            callback(false, trimmedFileNames);
            return;
        }

        callback(err, data);
    });
};

lib.compress = function (logId, newFileId, callback) {
    const sourceFile = logId + '.log';
    const destinationFile = newFileId + '.gz.b64';

    fs.readFile(lib.baseDir + sourceFile, 'utf-8', (err, inputString) => {
        if (!err && inputString) {
            zlib.gzip(inputString, (err, buffer) => {
                if (!err && buffer) {
                    fs.open(lib.baseDir + destinationFile, 'wx', (err, fileDescriptor) => {
                        if (!err && fileDescriptor) {
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), (err) => {
                                if (!err) {
                                    fs.close(fileDescriptor, (err) => {
                                        if (!err) {
                                            callback(false);
                                            return;
                                        }
                                        callback(err);
                                    });
                                    return;
                                }

                                callback(err);
                            });
                            return;
                        }

                        callback(err);
                    })
                    return;
                }

                callback(err);
            });
            return;
        }

        callback(err);
    });
};

lib.decompress = function (fileId, callback) {
    const fileName = fileId + '.gz.b64';
    fs.readFile(lib.baseDir + fileName, 'utf-8', (err, str) => {
        if (!err && str) {
            const inputBuffer = Buffer.from(str, 'base64');
            zlib.unzip(inputBuffer, (err, outputBuffer) => {
                if (!err && outputBuffer) {
                    const str = outputBuffer.toString();
                    callback(false, str);
                    return;
                }

                callback(err);
            });
            return;
        }

        callback(err);
    });
};

lib.truncate = function (logId, callback) {
    fs.truncate(lib.baseDir + logId + '.log', 0, (err) => {
        if (!err) {
            callback(false);
            return;
        }
        callback(err);
    });
};

module.exports = lib;