import { createReadStream, createWriteStream, readdirSync, rmSync } from 'fs'
import build from 'pino-abstract-transport'
// import SonicBoom from 'sonic-boom'
import { once } from 'events'
import { GetObjectCommand, S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const config = {
    logsDir: '',
}

const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    }
});

// export default async (options) => {
//   const stream = createWriteStream(options.destination)
//   await once(stream, 'open')
//   stream.on('write', (a) => {
//   })
//   return stream
// }

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
            Bucket: 'express-logger',
            Key: `${config.logsDir}/index.json`
        }))
        indexJson = await streamToString(s3Res.Body)
    } catch { 'str to make eslint shutup' }
    const indexData = JSON.parse(indexJson)
    indexData[id] = { id }
    await s3Client.send(new PutObjectCommand({
        Bucket: 'express-logger',
        Body: JSON.stringify(indexData),
        Key: `${config.logsDir}/index.json`
    }))
}

const updateIndexFile = async (obj) => {
    const { statusCode, time, method, url, headers, ip, body } = obj
    let indexJson = '{}';
    try {
        const s3Res = await s3Client.send(new GetObjectCommand({
            Bucket: 'express-logger',
            Key: `${config.logsDir}/index.json`
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
        Bucket: 'express-logger',
        Body: JSON.stringify(indexData),
        Key: `${config.logsDir}/index.json`
    }));
};

const myTransport = function(opts) {
    let { logsDir, cleanFileLogs, s3Bucket, s3PrefixKey } = opts;
    if (!s3Bucket) {
        s3Bucket = 'express-logger';
    }
    if (!s3PrefixKey) {
        s3PrefixKey = 'default'
    }
    if (!logsDir) {
        logsDir = 'logs'
    }
    logsDir = logsDir.replace('/', '');
    config.logsDir = logsDir;

    const streams = new Map()

    return build(async function(source) {
        for await (let obj of source) {
            try {
                let stream = null;
                const logFile = `./${logsDir}/${obj.id}.log`
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
                    continue;
                }

                const toDrain = !stream.write(JSON.stringify(obj) + '\n')

                if (toDrain) {
                    await once(stream, 'drain')
                }

                try {
                    const rs = createReadStream(stream.path)
                    await once(rs, 'open')
                    const params = {
                        Bucket: s3Bucket,
                        Body: rs,
                        Key: `${s3PrefixKey}/${stream.path}`
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

export default myTransport
