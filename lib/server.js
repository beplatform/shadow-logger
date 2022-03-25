import express from 'express';
import cors from 'cors';
import nodeModules from 'node_modules-path';
import fs from 'fs';

const app = express();

const env = process.argv[3];

console.log(nodeModules() + '/express-logger/data');
app.use(cors());
app.options('*', cors());
app.use('/', express.static(nodeModules() + '/express-logger/dashboard/build'));

const path = env === 'dev' ? nodeModules() + '/../data' : nodeModules() + '/express-logger/data';

app.get('/data/:file', (req, res, next) => {
	const file = req.params.file;
	fs.readFile(`${path}/${file}`, 'utf8', (err, data) => {
		if (err) {
			res.status(500).send(err);
		}
		const obj = JSON.parse(data);
		res.json(obj);
	});
});

export default app;

