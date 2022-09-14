# shadow-logger
Pino.js stream Debugger dashboard 

## Install
Install with either npm or yarn
```
npm install shadow-logger
```
```
yarn add shadow-logger
```

### 1. Add pino.js stream
```js
import { pinoTransport } from 'shadow-logger';

const streams = [
  {
    level: 'trace', stream: pinoTransport({
      s3Bucket: 'express-logger',
      s3Prefix: `cupid-${process.env.NODE_ENV}`,
    })
  }
]

const logger = pino({
  ...
}, pino.multistream(streams));

export default logger;
```

### 2. Add shadowMiddleware
```js
const app = express();
app.use(shadowMiddleware())
```

### 3. Add debugger middleware
```js
app.use('/debug', shadowDebugger({
  s3Bucket: 'express-logger',
  s3Prefix: `/cupid-${process.env.NODE_ENV}`,
}))
```
| Field | Required | Description |
| --- | --- | --- |
| s3Bucket | Yes | The s3 bucket |
| s3Prefix | Yes | The prefix key for s3 |
| awsConfigCredentials | No | The object config for new S3Client(). By default it will try to login with default aws environment variables see: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html |
This will serve the debugger on /debug.


### 4. Install debugger
```
npx shadow-logger install
```
Will install the dashboard static files on .debug/ by default. 

## Usage

After finishing the steps on installation the debugger should be available on /debug and write logs grouped by their request.




https://user-images.githubusercontent.com/1624006/190043748-57cff199-e6cd-4de0-9690-66f477c26bfa.mov

