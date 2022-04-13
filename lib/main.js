import cryptoRandomString from 'crypto-random-string';
import express, { request } from 'express';
import fs from 'fs';
import moment from 'moment';
import AWS from 'aws-sdk';

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
        if (!s3.path) {
            s3.path = '';
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
    const writeToS3 = (log) => {
        const s3Client = new AWS.S3();

        const uploadIndex = (index, log) => {
            const newIndex = [...index, {
                id: log.id,
                ...log.request,
                status: log.response.status
            }];
            const buf = Buffer.from(JSON.stringify(newIndex));
            const uploadIndexParams = {
                Bucket: s3.bucket,
                Body: buf,
                Key: `${s3.path}/index.json`
            };
            s3Client.upload(uploadIndexParams, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('index succesfully uploaded!!!');
                }
            });
        };

        const uploadLog = (log) => {
            const buf = Buffer.from(JSON.stringify(log));
            const uploadLogParams = {
                Bucket: s3.bucket,
                Body: buf,
                Key: `${s3.path}/${log.id}.json`
            };
            s3Client.upload(uploadLogParams, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('log succesfully uploaded!!!');
                }
            });
        };

        const searchParams = {
            Bucket: s3.bucket,
            Key: `${s3.path}/index.json`
        };

        s3Client.getObject(searchParams, (err, data) => {
            if (err) {
                if (err.statusCode === 404) {
                    uploadIndex([], log);
                    uploadLog(log);
                } else {
                    console.log(err);
                }
            } else {
                const indexArray = JSON.parse(data.Body.toString());
                uploadIndex(indexArray, log);
                uploadLog(log);
            }
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
                writeToS3(log, req, res);
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
        const oldSend = res.send;
        res.send = (data) => {
          logCall(req, res, request, data);
          res.send = oldSend;
          return res.send(data);
        };
        const oldJson = res.json;
        res.json = (data) => {
          logCall(req, res, request, data);
          res.json = oldJson;
          return res.json(data);
        };
        const oldStatus = res.status;
        res.status = (status) => {
          logCall(req, res, request, status);
          res.status = oldStatus;
          return res.status(status);
        };
        next();
    };


    return middleware;
};

const serveDebugger = (debuggerUrlPath = '/debug', debuggerBuildPath = './build') => {
    router.use(debuggerUrlPath, express.static(debuggerBuildPath))
    return router;
};

const sendEmptyIndex = (file, res, err) => {
    if (file === 'index.json') {
        res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
        res.setHeader('X-Total-Count', 0);
        res.json([]);
    } else {
        res.status(500).send(err);
    }
};

const parseIndex = (req, res, obj) => {
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

    return obj;
}

const serveFSLogger = (logsApiUrl = '/logs', logsPath= './logs') => {
    router.use(`${logsApiUrl}/:file`, (req, res, next) => {
        const file = req.params.file;
        if (!file) {
            res.status(400).send('File not found');
        }
        fs.readFile(`${logsPath}/${file}`, 'utf8', (err, data) => {
            if (err) {
                sendEmptyIndex(file, res, err);
            } else {
                let obj = JSON.parse(data);
                if (file === 'index.json') {
                    obj = parseIndex(req, res, obj);
                }
                res.json(obj);
            }
        });
    });
    return router;
};

const serveS3Logger = (logsApiUrl, bucket = '', path = '') => {
    const s3Client = new AWS.S3();

    router.use(`${logsApiUrl}/:file`, (req, res, next) => {
        const file = req.params.file;
        if (!file) {
            res.status(400).send('File not found');
        }

        const searchParams = {
            Bucket: bucket,
            Key: `${path}/${file}`
        };
        s3Client.getObject(searchParams, (err, data) => {
            if (err) {
                sendEmptyIndex(file, res, err);
            } else {
                let obj = JSON.parse(data.Body.toString());
                if (file === 'index.json') {
                    obj = parseIndex(req, res, obj);
                }
                res.json(obj);
            }
        });
    });
    return router;
};

export default configMiddleWare;
export { info, serveDebugger, serveFSLogger, serveS3Logger };
