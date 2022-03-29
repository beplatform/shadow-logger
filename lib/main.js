import fs from 'fs';
import cryptoRandomString from 'crypto-random-string';
import nodeModules from 'node_modules-path';
import express from 'express';
const router = express.Router();

let logBuffer = [];
const info = log => {
    logBuffer.push(log);
};
const emptyLogBuffer = () => {
    logBuffer = [];
};

const configMiddleWare = (config = {writerType: 'fs', path: 'data'}) => {
    let { writerType, path } = config;
    if (!writerType) {
        writerType = 'fs';
    }
    if (!path) {
        path = 'data'
    }

    // path and function to write log in fs
    let rootPath = nodeModules() + `/express-logger/${path}`;
    const initIndexFile = () => {
        const indexFile = [];
        fs.writeFileSync(rootPath + '/index.json', JSON.stringify(indexFile));
    };
    const appendLogToIndex = (log, req) => {
        const indexFile = JSON.parse(fs.readFileSync(rootPath + '/index.json'));
        indexFile.push({
            id: log.id,
            time: new Date().toISOString(),
            ip: req.socket.localAddress,
            queryCount: 0,
            mailCount: 0,
            method: req.method,
            url: req.url,
            status: res.statusCode,
        });
        fs.writeFileSync(rootPath + '/index.json', JSON.stringify(indexFile));
    };
    const writeToFs = (log, req, res) => {
        if (fs.existsSync(rootPath + '/index.json')) {
            appendLogToIndex(log, req, res);
        } else {
            initIndexFile();
            appendLogToIndex(log, req, res);
        }

        const filePath = `${rootPath}/${log.id}.json`;
        fs.writeFileSync(filePath, JSON.stringify(log));
    };

    const writeToS3 = (log) => {
        // todo
    };

    const middleware = (req, res, next) => {
        const logId = cryptoRandomString({ length: 10 });
        const log = {
            id: logId,
            request: {
                method: req.method,
                url: req.url,
                headers: req.headers,
            },
            response: {
                status: res.statusCode,
                headers: res.headers,
            },
            logs: logBuffer,
        };

        if (writerType === 'fs') {
            writeToFs(log, req, res);
        } else if (writerType === 'console') {
            console.log(log);
        } else if (writerType === 's3') {
            writeToS3(log);
        }

        emptyLogBuffer();
        next();
    };

    return middleware;
};

const createDebugger = (path = '/debugger') => {
    router.use(path, express.static('./node_modules/express-logger/dashboard/build'))
    router.use('/', express.static('./node_modules/express-logger/dashboard/build'))
};

export default configMiddleWare;
export { info, createDebugger };