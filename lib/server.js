import express from 'express';
import cors from 'cors';
import nodeModules from 'node_modules-path';

const app = express();

console.log(nodeModules() + '/express-logger/data');
app.use(cors());
app.options('*', cors());
app.use('/data', express.static(nodeModules() + '/express-logger/data'));
app.use('/', express.static(nodeModules() + '/express-logger/dashboard/build'));

export default app;

