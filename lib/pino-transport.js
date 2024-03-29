import { createReadStream, createWriteStream, readdirSync, rmSync, mkdirSync } from 'fs'
import build from 'pino-abstract-transport'
import { once } from 'events'
import { GetObjectCommand, S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const config = {
    s3Prefix: '',
    s3Bucket: '',
}

let s3Client = new S3Client({
    region: 'us-east-1',
});

const streamToString = (stream) =>
    new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });

const appendIdToIndexfile = async (id) => {
    let indexJson = '{}'
    try {
        const s3Res = await s3Client.send(new GetObjectCommand({
            Bucket: config.s3Bucket,
            Key: `${config.s3Prefix}/index.json`
        }))
        indexJson = await streamToString(s3Res.Body)
    } catch { 'str to make eslint shutup' }
    const indexData = JSON.parse(indexJson)
    indexData[id] = { id }
    await s3Client.send(new PutObjectCommand({
        Bucket: config.s3Bucket,
        Body: JSON.stringify(indexData),
        Key: `${config.s3Prefix}/index.json`
    }))
}

const updateIndexFile = async (obj) => {
    const { statusCode, time, method, url, headers, ip, body } = obj
    let indexJson = '{}';
    try {
        const s3Res = await s3Client.send(new GetObjectCommand({
            Bucket: config.s3Bucket,
            Key: `${config.s3Prefix}/index.json`
        }));

        indexJson = await streamToString(s3Res.Body);
    } catch (err) { 'string to shut up linter' }

    const indexData = JSON.parse(indexJson);
    if (Object.hasOwn(indexData, obj.id)) {
        if (statusCode) {
            indexData[obj.id].statusCode = statusCode
        }
        if (time) {
            indexData[obj.id].time = time
        }
        if (method) {
            indexData[obj.id].method = method
        }
        if (url) {
            indexData[obj.id].url = url
        }
        if (headers) {
            indexData[obj.id].headers = headers
        }
        if (ip) {
            indexData[obj.id].ip = ip
        }
        if (body) {
            indexData[obj.id].body = body
        }
    }

    await s3Client.send(new PutObjectCommand({
        Bucket: config.s3Bucket,
        Body: JSON.stringify(indexData),
        Key: `${config.s3Prefix}/index.json`
    }));
};

const shadowTransport = function(opts) {
    let { logsDir, cleanFileLogs, s3Bucket, s3Prefix, awsClientConfig } = opts;
    if (!s3Bucket) {
        s3Bucket = 'express-logger';
    }
    if (!s3Prefix) {
        s3Prefix = 'default'
    }
    if (!logsDir) {
        logsDir = '.debug/logs'
    }
    if (awsClientConfig) {
        s3Client = new S3Client(awsClientConfig);
    }

    try {
        mkdirSync(logsDir);
    } catch (err) { 'dir already exists' }
    config.s3Prefix = s3Prefix;
    config.s3Bucket = s3Bucket;

    const streams = new Map()

    return build(async function(source) {
        for await (let obj of source) {
            if (!obj.id) {
                continue;
            }

            try {
                let stream = null;
                const logFile = `${logsDir}/${obj.id}.log`
                if (streams.get(obj.id)) {
                    stream = streams.get(obj.id)
                } else {
                    stream = createWriteStream(logFile)
                    await once(stream, 'open')
                    streams.set(obj.id, stream)
                    await appendIdToIndexfile(obj.id)
                }

                if (obj.statusCode || obj.method) {
                    updateIndexFile(obj);
                } else {
                    const toDrain = !stream.write(JSON.stringify(obj) + '\n')
                    if (toDrain) {
                        await once(stream, 'drain')
                    }
                }

                try {
                    const rs = createReadStream(stream.path)
                    await once(rs, 'open')
                    const path = stream.path.split('/').pop()
                    const params = {
                        Bucket: s3Bucket,
                        Body: rs,
                        Key: `${s3Prefix}/${path}`
                    }
                    await s3Client.send(new PutObjectCommand(params))
                } catch (err) { console.error(err) }
            } catch (err) { console.error(err) }
        }
    }, {
        async close() {
            for (let val of streams.values()) {
                val.end()
                await once(val, 'close')
            }

            if (cleanFileLogs) {
                readdirSync(logsDir).forEach(v => rmSync(`${logsDir}/${v}`))
            }
        }
    })
}

export default shadowTransport

