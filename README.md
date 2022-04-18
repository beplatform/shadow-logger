# shadow-logger
Debugger dashboard for express apps

## Install
Install with either npm or yarn
```
npm install shadow-logger
```

## Get Logger Middleware Running
### Example
```
import logger from 'shadow-logger';

...
const app = express();
...

app.use(logger({writerType: 'fs', path: './logs', ignore: ['/logs','/debug']}))
```
| Parameter | Values |
| --- | --- |
| writerType | 'fs', 'console', 's3' |
| path | root directory where the files will be written |
| ignore | Array for paths to ignore, will not log these paths, make sure you add the path of your debugger |

## Serve Logger
This is to allow the logs to be read by API calls. Ex: http://localhost/logs/index.json.
Make sure you create your express app.
### FS Logger
Reads logs save by `writerType: 'fs'` on your computer file system.
```
app.use('/', serveFSLogger(logsApiUrl, logsPath));
```
| Parameter | Values | Example |
| --- | --- | --- |
| logsApiUrl | Where your API is serve | '/logs' |
| logsPath | root directory where the files will be written, can be a relative path | './logs' or './data' |

You can have different log path name and url path name. The url path is for how you will access the logs with api calls.
Ex:
```
app.use('/', serveFSLogger('/logs', './data'));
```
Logs will be access by api calls on http://domain.com/logs/index.json and https://domain.com/logs/logid.json.
The files are being save on ./data folder on your project root directory.

## Serve Debugger
Serve frontend application made in React Admin to manage and view your logs.
### 1. Build Application
On the CLI of your project run:
```
npx shadow-logger build <LogsApiUrl> <DebuggerUrlPath> <DebuggerBuildPath>
```
| Parameter | Values | Example |
| --- | --- | --- |
| LogsApiUrl | Same one you add to the logger function, but add the full domain | 'http:localhost/logs' |
| DebuggerUrlPath | Where you debugger will be serve on your express app | '/debug' or 'https://domain.com/debug' |
| DebuggerBuildPath | Build frontend debugger files | default: ./build |

Ex:
```
npx shadow-logger build 'https://domain.com/logs' '/debug' './build'
```
This will allow to access your debugger on localhost/debug.

Tip: Add this script to your package.json file to easily run it with yarn or npm `yarn buildDebugger` or `npm run buildDebugger`:
```
"scripts": {
  "buildDebugger": "npx shadow-logger build 'https://domain.com/logs' '/debug' './build'"
}
```

### 2. Serve Application

```
app.use('/', serveDebugger(DebuggerUrlPath, DebuggerBuildPath));
```
| Parameter | Values | Example |
| --- | --- | --- |
| DebuggerUrlPath | Where you debugger will be serve on your express app, use the same value you use on the build, but relative url path not full domain | '/debug' |
| DebuggerBuildPath | Same location you build the debugger | './build' |

## Full Example
```
import logger, { serveDebugger, serveFSLogger } from 'shadow-logger';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import router from './routes/index.js';

const PORT = process.env.PORT || 80;

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});
app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger({writerType: 'fs', path: './logs', ignore: ['/debug', '/logs']}));

// API ROUTES
app.use('/', router);
app.use('/', serveDebugger('/debug'));
app.use('/', serveFSLogger('/logs', './logs'));

// SERVER
app.set('port', PORT);
const server = http.createServer(app);
server.on('listening', () => {
  console.log('Listening on ' + PORT);
});

server.listen(PORT);
```
