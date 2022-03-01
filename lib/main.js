import fs from 'fs';
import cryptoRandomString from 'crypto-random-string';

const configMiddleWare = (config) => {
    const { writer } = config;
    if (!writer) {
        writer = { type: 'file', path: '../data/' };
    }

    const rootPath = config.rootPath ?? '../data/';

    const middleware = (req, res, next) => {
        const logId = cryptoRandomString({ length: 10 });
        const log = {
            id: logId,
            method: req.method,
            url: req.url,
            headers: {
                request: req.headers,
                response: res.headers,
            },
            logs: [],
        }

        if (writer.type === 'file') {
            const filePath = `${rootPath}${logId}.json`;
            fs.writeFileSync(filePath, JSON.stringify(log));
        }
        // fs.readyFileSync('index.json');
        // JSON.parse();
        // fs.writeFileSync('index.json', JSON.stringify(log));

        console.log('logger middleware');
        next();
    };

    return middleware;
};

export default configMiddleWare;

