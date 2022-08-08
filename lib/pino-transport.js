import { createReadStream, createWriteStream } from 'fs';
import build from 'pino-abstract-transport';
import { once } from 'events';
import { GetObjectCommand, S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });

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

const appendIdToIndexfile = async(id) => {
    let indexJson = '{}';
    try {
        const s3Res = await s3Client.send(new GetObjectCommand({
            Bucket: 'express-logger',
            Key: 'stream/index.json'
        }));
        indexJson = await streamToString(s3Res.Body);
    } catch { 'str to make eslint shutup'; }
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
const PinoTransport = function(opts) {
    // SonicBoom is necessary to avoid loops with the main thread.
    // It is the same of pino.destination().
    // const destination = new SonicBoom({ dest: opts.destination || 1, sync: false })
    // const destination = createWriteStream(opts.destination)
    // once(destination, 'ready').catch(err => console.error(err))
    const streams = new Map();

    return build(async function(source) {
        for await (let obj of source) {
            try {
                // const toDrain = !destination.write(JSON.stringify(obj) + ',\n')
                let stream = null;
                const logFile = `${obj.id}.json`;
                if (streams.get(obj.id)) {
                    stream = streams.get(obj.id);
                } else {
                    stream = createWriteStream(logFile);
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

export default PinoTransport
