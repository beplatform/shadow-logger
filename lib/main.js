import fs from 'fs';
import cryptoRandomString from 'crypto-random-string';
import nodeModules from 'node_modules-path';

let rootPath = nodeModules() + '/express-debugger/data';

const initIndexFile = () => {
    const indexFile = [];
    fs.writeFileSync(rootPath + '/index.json', JSON.stringify(indexFile));
};

let logBuffer = [];
const info = log => {
    logBuffer.push(log);
};
const emptyLogBuffer = () => {
    logBuffer = [];
};

const configMiddleWare = (config) => {
    let { writer } = config;
    if (!writer) {
        writer = { type: 'file', path: '../data/' };
    }

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

        if (writer.type === 'file') {
            // const filePath = `${rootPath}${logId}.json`;
            const filePath = `${rootPath}/${logId}.json`;
            fs.writeFileSync(filePath, JSON.stringify(log));

            if (!fs.existsSync(rootPath + '/index.json')) {
                initIndexFile();
            }
        }

        emptyLogBuffer();
        next();
    };

    return middleware;
};

export default configMiddleWare;
export { info };

