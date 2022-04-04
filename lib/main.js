import cryptoRandomString from 'crypto-random-string';
import express, { request } from 'express';
import fs from 'fs';
import moment from 'moment';
import mung from 'express-mung';
import { S3Client } from "@aws-sdk/client-s3";

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

const configMiddleWare = (config = {writerType: 'fs', path: './logs', ingore: []}) => {
    let { writerType, path, ignore, s3 } = config;
    if (!writerType) {
        writerType = 'fs';
    }
    if (!path) {
        path = './logs'
    }

    if (!ignore) {
        ignore = [];
    }

    if (writerType === 's3') {
        if (!s3) {
            console.error('Need s3 configuration');
        }
        if (!s3.bucket) {
            console.error('Need s3 bucket configuration');
        }
        if (!s3.region) {
            s3.region = 'us-east-1';
        }
    }

    // path and function to write log in fs
    const initIndexFile = () => {
        const indexFile = [];
        fs.writeFileSync(path + '/index.json', JSON.stringify(indexFile));
    };
    const appendLogToIndex = (log) => {
        const indexFile = JSON.parse(fs.readFileSync(path + '/index.json'));
        indexFile.push({
            id: log.id,
            ...log.request,
            status: log.response.status,
        });
        fs.writeFileSync(path + '/index.json', JSON.stringify(indexFile));
    };
    const writeToFs = (log) => {
        if (fs.existsSync(path + '/index.json')) {
            appendLogToIndex(log);
        } else {
            initIndexFile();
            appendLogToIndex(log);
        }

        const filePath = `${path}/${log.id}.json`;
        fs.writeFileSync(filePath, JSON.stringify(log));
    };
    const writeToAWS = (log) => {
        const s3Client = S3Client({region: s3.region});
        let uploadParams = {Bucket: s3.bucket, Key: 'index.json'};
        s3Client.getObject(uploadParams, function(err, data) {
            if (err) console.log(err, err.stack);
            else     console.log(data);
        });
    };

    const logCall = (req, res, request, body) => {
        const logId = cryptoRandomString({ length: 10 });
        const log = {
            id: logId,
            request: request,
            response: {
                time: new Date().toISOString(),
                status: res.statusCode,
                headers: res.headers,
                body: body
            },
            logs: logBuffer,
        };

        if (ignore.every(c => request.url.search(c) !== 0)) {
            if (writerType === 'fs') {
                writeToFs(log, req, res);
            } else if (writerType === 'console') {
                console.log(log);
            } else if (writerType === 's3') {
                writeToAWS(log, req, res);
            }
        }
    };

    let request = {};

    const middleware = (req, res, next) => {
        request = {
            time: new Date().toISOString(),
            method: req.method,
            url: req.url,
            headers: req.headers,
            ip: req.socket.localAddress
        };
        next();
    };

    const endware = (mung.json((body, req, res) => {
        logCall(req, res, request, body);
        emptyLogBuffer();
        return body;
    }));

    return [middleware, endware];
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