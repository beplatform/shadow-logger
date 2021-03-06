import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { serveDebugger, serveFSLogger } from './main.js';

const app = express();

app.use(cors());
app.options('*', cors());
app.use('/', express.static('./dashboard/build'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', serveDebugger('/debug'));
app.use('/', serveFSLogger('/logs', './logs'));

export default app;