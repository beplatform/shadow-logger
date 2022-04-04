import cryptoRandomString from 'crypto-random-string';
import express, { request } from 'express';
import fs from 'fs';
import moment from 'moment';
import mung from 'express-mung';

const router = express.Router();

let logBuffer = [];
const info = log => {
    logBuffer.push(log);
};
const emptyLogBuffer = () => {
    logBuffer = [];
};

const env = process.argv[3];
const regexEscape = (str) => {
	return str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&');
};

const configMiddleWare = (config = {writerType: 'fs', path: './data', ingore: []}) => {
    let { writerType, path, ignore } = config;
    if (!writerType) {
        writerType = 'fs';
    }
    if (!path) {
        path = './data'
    }

    if (!ignore) {
        ignore = [];
    }

    // path and function to write log in fs
    const initIndexFile = () => {
        const indexFile = [];
        fs.writeFileSync(path + '/index.json', JSON.stringify(indexFile));
    };
    const appendLogToIndex = (log, req, res) => {
        const indexFile = JSON.parse(fs.readFileSync(path + '/index.json'));
        indexFile.push({
            id: log.id,
            time: new Date().toISOString(),
            ip: req.ip,
            queryCount: 0,
            mailCount: 0,
            method: req.method,
            url: req.url,
            status: res.statusCode,
        });
        fs.writeFileSync(path + '/index.json', JSON.stringify(indexFile));
    };
    const writeToFs = (log, req, res) => {
        if (fs.existsSync(path + '/index.json')) {
            appendLogToIndex(log, req, res);
        } else {
            initIndexFile();
            appendLogToIndex(log, req, res);
        }

        const filePath = `${path}/${log.id}.json`;
        fs.writeFileSync(filePath, JSON.stringify(log));
    };
    const writeToS3 = (log) => {
        // todo
    };

    const logCall = (req, res, body) => {
        const logId = cryptoRandomString({ length: 10 });
        const log = {
            id: logId,
            request: {
                time: new Date().toISOString(),
                method: req.method,
                url: req.url,
                headers: req.headers,
                ip: req.socket.localAddress
            },
            response: {
                status: res.statusCode,
                headers: res.headers,
                body: body
            },
            logs: logBuffer,
        };

        if (ignore.every(c => req.url.search(c) !== 0)) {
            if (writerType === 'fs') {
                writeToFs(log, req, res);
            } else if (writerType === 'console') {
                console.log(log);
            } else if (writerType === 's3') {
                writeToS3(log, req, res);
            }
        }
    };
    const middleware = (mung.json((body, req, res) => {
        logCall(req, res, body);
        emptyLogBuffer();
        return body;
    }));

    return middleware;
};

const serveDebugger = (debuggerUrlPath = '/debug', debuggerBuildPath = './build') => {
    router.use(debuggerUrlPath, express.static(debuggerBuildPath))
    return router;
};

const serveFSLogger = (logsApiUrl = '/logs', logsPath= './logs') => {
    router.use(`${logsApiUrl}/:file`, (req, res, next) => {
        const file = req.params.file;
        if (!file) {
            res.status(400).send('File not found');
        }
        fs.readFile(`${logsPath}/${file}`, 'utf8', (err, data) => {
            if (err) {
                if (file === 'index.json') {
                    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
                    res.setHeader('X-Total-Count', 0);
                    res.json([]);
                } else {
                    res.status(500).send(err);
                }
            } else {
                let obj = JSON.parse(data);
                if (file === 'index.json') {
                    const {perPage, field, order} = req.query;

                    if (field && order) {
                        obj.sort((a, b) => {
                            const isASC = order === 'ASC' ? 1 : -1;
                            if (field === 'time') {
                                return moment(a.time).isAfter(b.time) ? isASC : -isASC;
                            }

                            return a[field] < b[field] ? isASC : (a[field] > b[field] ? -isASC : 0);
                        });
                    }

                    if (req.query.method) {
                        const method = req.query.method.split(',').map(m => m.toLowerCase());
                        obj = obj.filter((o, i) => {
                            return method.indexOf(o.method.toLowerCase()) !== -1;
                        });
                    }

                    if (req.query.url) {
                        const url = req.query.url;
                        obj = obj.filter((o, i) => {
                            return o.url.toLowerCase().search(regexEscape(url).toLowerCase()) !== -1;
                        });
                    }

                    if (req.query.status) {
                        const status = req.query.status;
                        obj = obj.filter((o, i) => {
                            return o.status.toString().search(regexEscape(status).toString()) !== -1;
                        });
                    }

                    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
                    res.setHeader('X-Total-Count', obj.length);

                    const page = req.query.page || 1;
                    if (perPage) {
                        obj = obj.filter((o, i) => {
                            return i < (parseInt(perPage) * page) && (i+1) > ((page-1) * perPage);
                        });
                    }
                }
                res.json(obj);
            }
        });
    });
    return router;
};

export default configMiddleWare;
export { info, serveDebugger, serveFSLogger };