import fs from 'fs';
import cryptoRandomString from 'crypto-random-string';
import nodeModules from 'node_modules-path';


let logBuffer = [];
const info = log => {
    logBuffer.push(log);
};
const emptyLogBuffer = () => {
    logBuffer = [];
};

const configMiddleWare = (config) => {
    let { writerType } = config;
    if (!writerType) {
        writerType = 'fs';
    }

    // path and function to write log in fs
    let rootPath = nodeModules() + '/express-debugger/data';
    const initIndexFile = () => {
        const indexFile = [];
        fs.writeFileSync(rootPath + '/index.json', JSON.stringify(indexFile));
    };
    const writeToFs = (log) => {
        // const filePath = `${rootPath}${logId}.json`;
        const filePath = `${rootPath}/${log.id}.json`;
        fs.writeFileSync(filePath, JSON.stringify(log));

        if (!fs.existsSync(rootPath + '/index.json')) {
            initIndexFile();
        }
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
            writeToFs(log);
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

export default configMiddleWare;
export { info };

