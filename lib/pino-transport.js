import { createReadStream, createWriteStream } from 'fs';
import build from 'pino-abstract-transport';
import { once } from 'events';
import { GetObjectCommand, S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import streamToString from './streamToString.js';

const s3Client = new S3Client({ region: 'us-east-1' });

const appendIdToIndexfile = async (obj) => {
    const { id, date, ip, queryCount, method, url, statusCode } = obj
    let indexJson = '{}';
    try {
        const s3Res = await s3Client.send(new GetObjectCommand({
            Bucket: 'express-logger',
            Key: 'stream/index.json'
        }));

        indexJson = await streamToString(s3Res.Body);
    } catch (err) { 'string to shut up linter' }

    const indexData = JSON.parse(indexJson);
    indexData[id] = { id, date, ip, queryCount, method, url, statusCode };
    await s3Client.send(new PutObjectCommand({
        Bucket: 'express-logger',
        Body: JSON.stringify(indexData),
        Key: 'stream/index.json'
    }));
};

const updateIndexFile = async (obj) => {
    const { statusCode } = obj
    let indexJson = '{}';
    try {
        const s3Res = await s3Client.send(new GetObjectCommand({
            Bucket: 'express-logger',
            Key: 'stream/index.json'
        }));

        indexJson = await streamToString(s3Res.Body);
    } catch (err) { 'string to shut up linter' }

    const indexData = JSON.parse(indexJson);
    if (indexData[obj.id]) {
        if (statusCode) {
            indexData[obj.id].statusCode = statusCode
        }
    }

    await s3Client.send(new PutObjectCommand({
        Bucket: 'express-logger',
        Body: JSON.stringify(indexData),
        Key: 'stream/index.json'
    }));
};

/**
 * Transport for pino setup
 */
export default () => {
    const streams = new Map();
    return build(async function(source) {
        for await (let obj of source) {
            try {
                // const toDrain = !destination.write(JSON.stringify(obj) + ',\n')
                let stream = null;
                if (streams.get(obj.id)) {
                    stream = streams.get(obj.id);
                } else {
                    stream = createWriteStream(`${obj.id}.json`);
                    await once(stream, 'open');
                    streams.set(obj.id, stream);
                    await appendIdToIndexfile(obj);
                }

                if (obj.statusCode) {
                    updateIndexFile(obj);
                }

                const toDrain = !stream.write(JSON.stringify(obj));
                if (toDrain) {
                    await once(stream, 'drain');
                }

                const rs = createReadStream(stream.path);
                await once(rs, 'open');
                const params = {
                    Bucket: 'express-logger',
                    Body: rs,
                    Key: `stream/${obj.id}.json`
                };
                try {
                    await s3Client.send(new PutObjectCommand(params));
                } catch (err) { console.error(err); }
            } catch (err) { console.error(err); }
        }
    }, {
        async close() {
            for (let val of streams.values()) {
                val.end();
                await once(val, 'close');
            }
        }
    });
};
