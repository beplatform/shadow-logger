import express from 'express';
import cryptoRandomString from 'crypto-random-string';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import pino from 'pino';
import moment from 'moment';

const regexEscape = (str) => {
    return str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&');
};

const serveDebugger = (debuggerUrlPath = '/debug', debuggerBuildPath = './build') => {
    const router = express.Router();
    router.use(debuggerUrlPath, express.static(debuggerBuildPath));
    return router;
};
// 
const sendEmptyIndex = (file, res, err) => {
    if (file === 'index.json') {
        res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
        res.setHeader('X-Total-Count', 0);
        res.json([]);
    } else {
        res.status(500).send(err);
    }
};

const parseIndex = (req, res, obj) => {
    const { perPage, field, order } = req.query;

    if (field && order) {
        obj.sort((a, b) => {
            const isASC = order === 'ASC' ? 1 : -1;
            if (field === 'date') {
                return moment(a.time).isAfter(b.time) ? isASC : -isASC;
            }

            return a[field] < b[field] ? isASC : (a[field] > b[field] ? -isASC : 0);
        });
    }

    if (req.query.method) {
        const method = req.query.method.split(',').map(m => m.toLowerCase());
        obj = obj.filter((o) => {
            return method.indexOf(o.method.toLowerCase()) !== -1;
        });
    }

    if (req.query.url) {
        const url = req.query.url;
        obj = obj.filter((o) => {
            return o.url.toLowerCase().search(regexEscape(url).toLowerCase()) !== -1;
        });
    }

    if (req.query.status) {
        const status = req.query.status;
        obj = obj.filter((o) => {
            return o.status.toString().search(regexEscape(status).toString()) !== -1;
        });
    }

    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    res.setHeader('X-Total-Count', obj.length);

    const page = req.query.page || 1;
    if (perPage) {
        obj = obj.filter((o, i) => {
            return i < (parseInt(perPage) * page) && (i + 1) > ((page - 1) * perPage);
        });
    }

    return obj;
};

const serveFSLogger = (logsApiUrl = '/logs', logsPath = './logs') => {
    const router = express.Router();
    // router.use(`${logsApiUrl}/:file`, (req, res, next) => {
    //     const file = req.params.file;
    //     if (!file) {
    //         res.status(400).send('File not found');
    //     }
    //     fs.readFile(`${logsPath}/${file}`, 'utf8', (err, data) => {
    //         if (err) {
    //             sendEmptyIndex(file, res, err);
    //         } else {
    //             let obj = JSON.parse(data);
    //             if (file === 'index.json') {
    //                 obj = parseIndex(req, res, obj);
    //             }
    //             res.json(obj);
    //         }
    //     });
    // });
    return router;
};

const streamToString = (stream) =>
    new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });


const serveS3Logger = (logsApiUrl, bucket, s3Prefix) => {
    const router = express.Router();
    const s3Client = new S3Client({
        region: 'us-east-1',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        }
    });

    s3Prefix = s3Prefix.replace('//', '/');
    if (s3Prefix.substring(0, 1) === '/') {
        s3Prefix = s3Prefix.substring(1, s3Prefix.length);
    }

    router.use(`${logsApiUrl}/:file`, async (req, res) => {
        const file = req.params.file;
        if (!file) {
            res.status(400).send('File not found');
        }

        try {
            let obj = '{}';
            if (file === 'index.json') {
                const data = await s3Client.send(new GetObjectCommand({
                    Bucket: bucket,
                    Key: `${s3Prefix}/index.json`
                }));
                obj = JSON.parse(await streamToString(data.Body));
                obj = parseIndex(req, res, Object.values(obj));
            } else {
                const data = await s3Client.send(new GetObjectCommand({
                    Bucket: bucket,
                    Key: `${s3Prefix}/${file}`
                }));
                obj = JSON.parse(await streamToString(data.Body));
            }
            res.json(obj);
        } catch (error) {
            console.error(error);
            sendEmptyIndex(file, res, error);
        }
    });

    return router;
};

const pinoTransport = () => {
    return pino.transport({
        target: `${process.env.PWD}/node_modules/shadow-logger/lib/pino-transport.js`,
        // options: { destination: __dirname + 'logs.logs' }
    });
}

const shadowMiddleware = (logger) => {
    return (req, res, next) => {
        req.logger = logger.child({ id: cryptoRandomString({ length: 10 }) })
        req.logger.trace({
            time: new Date().toISOString(),
            method: req.method,
            url: req.url,
            headers: req.headers,
            ip: req.socket.localAddress,
            body: req.body
        });

        res.on('finish', () => {
            req.logger.trace({ statusCode: res.statusCode });
        });

        next();
    }
}

export { serveDebugger, serveFSLogger, serveS3Logger, pinoTransport, shadowMiddleware };

