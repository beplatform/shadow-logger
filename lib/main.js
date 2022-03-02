import fs from 'fs';
import cryptoRandomString from 'crypto-random-string';

const initIndexFile = () => {
    const indexFile = [];
    fs.writeFileSync('index.json', JSON.stringify(indexFile));
};

const configMiddleWare = (config) => {
    let { writer } = config;
    if (!writer) {
        writer = { type: 'file', path: '../data/' };
    }

    const rootPath = config.rootPath ?? '../data/';

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
            const filePath = `${rootPath}${logId}.json`;
            fs.writeFileSync(filePath, JSON.stringify(log));

            if (!fs.fileExistsSync(rootPath + 'index.json')) {
                initIndexFile();
            }
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

