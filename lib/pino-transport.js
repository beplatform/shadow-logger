import { createReadStream, createWriteStream } from 'fs';
import build from 'pino-abstract-transport';
import { once } from 'events';
import { GetObjectCommand, S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import streamToString from './streamToString';

const s3Client = new S3Client({ region: 'us-east-1' });

const appendIdToIndexfile = async(id) => {
    let indexJson = '{}';
    const s3Res  = await s3Client.send(new GetObjectCommand({
        Bucket: 'express-logger',
        Key: 'stream/index.json'
    })).catch(err => console.error(err));

    if (!s3Res) {
        return
    }

    indexJson = await streamToString(s3Res.Body);
    const indexData = JSON.parse(indexJson);
    indexData[id] = { id, date: new Date().toISOString() };
    await s3Client.send(new PutObjectCommand({
        Bucket: 'express-logger',
        Body: JSON.stringify(indexData),
        Key: 'stream/index.json'
    }));
};

/**
 * Transport for pino setup
 */
export default (opts) => {
    const streams = new Map();
    return build(async function(source) {
        for await (let obj of source) {
            try {
                // const toDrain = !destination.write(JSON.stringify(obj) + ',\n')
                let stream = null;
                if (streams.get(obj.id)) {
                    stream = streams.get(obj.id);
                } else {
                    stream = createWriteStream(`${opts.destination}/${obj.id}.json`);
                    await once(stream, 'open');
                    streams.set(obj.id, stream);
                    await appendIdToIndexfile(obj.id);
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
                    Key: 'stream/' + stream.path
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

