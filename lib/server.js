import express from 'express';
import cors from 'cors';
import nodeModules from 'node_modules-path';
import fs from 'fs';
import bodyParser from 'body-parser';
import moment from 'moment';

const app = express();

const env = process.argv[3];

console.log(nodeModules() + '/express-logger/data');
app.use(cors());
app.options('*', cors());
app.use('/', express.static(nodeModules() + '/express-logger/dashboard/build'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const path = env === 'dev' ? nodeModules() + '/../data' : nodeModules() + '/express-logger/data';

app.get('/data/:file', (req, res, next) => {
	const file = req.params.file;
	if (!file) {
		res.status(400).send('File not found');
	}
	fs.readFile(`${path}/${file}`, 'utf8', (err, data) => {
		if (err) {
			res.status(500).send(err);
		}
		let obj = JSON.parse(data);
		if (file === 'index.json') {
			res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
			res.setHeader('X-Total-Count', obj.length);

			const {perPage, field, order} = req.query;

			if (field && order) {
				obj.sort((a, b) => {
					const isASC = order === 'ASC' ? 1 : -1;
					if (field === 'time') {
						return moment(a.time).isAfter(b.time) ? isASC : -isASC;
					}

					return a[field] < b[field] ? isASC : (a[field] > b[field] ? -isASC : 0);
				});
			}

			const page = req.query.page || 1;
			if (perPage) {
				obj = obj.filter((o, i) => {
					return i < (parseInt(perPage) * page) && (i+1) > ((page-1) * perPage);
				});
			}
		}
		res.json(obj);
	});
});

export default app;

