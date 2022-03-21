import express from 'express';
import cors from 'cors';
import nodeModules from 'node_modules-path';

const app = express();

const env = process.argv[3];

console.log(nodeModules() + '/express-logger/data');
app.use(cors());
app.options('*', cors());
app.use('/', express.static(nodeModules() + '/express-logger/dashboard/build'));

if (env === 'dev') {
	app.use('/data', express.static(nodeModules() + '/../data'));
} else {
	app.use('/data', express.static(nodeModules() + '/express-logger/data'));
}

export default app;

