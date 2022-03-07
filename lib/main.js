import fs from 'fs';
import cryptoRandomString from 'crypto-random-string';
import nodeModules from 'node_modules-path';

let rootPath = nodeModules.default() + '/data';

const initIndexFile = () => {
    console.log('initIndexFile');
    const indexFile = [];
    fs.writeFileSync(rootPath + '/index.json', JSON.stringify(indexFile));
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
            logs: [],
        };

        if (writer.type === 'file') {
            // const filePath = `${rootPath}${logId}.json`;
            const filePath = `${rootPath}/${logId}.json`;
            fs.writeFileSync(filePath, JSON.stringify(log));

            if (!fs.existsSync(rootPath + 'index.json')) {
                initIndexFile();
            }
        }
        // fs.readyFileSync('index.json');
        // JSON.parse();
        // fs.writeFileSync('index.json', JSON.stringify(log));

        console.log('logger middleware 2223');
        next();
    };

    return middleware;
};

export default configMiddleWare;

