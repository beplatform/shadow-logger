import express from 'express';
import cors from 'cors';
import nodeModules from 'node_modules-path';
import fs from 'fs';
import bodyParser from 'body-parser';
import moment from 'moment';

const app = express();

const env = process.argv[3];

app.use(cors());
app.options('*', cors());
app.use('/', express.static(nodeModules() + '/express-logger/dashboard/build'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const path = env === 'dev' ? nodeModules() + '/../data' : nodeModules() + '/express-logger/data';

export const regexEscape = (str) => {
	return str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&');
};

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

			if (req.query.method) {
				const method = req.query.method.split(',').map(m => m.toLowerCase());
				obj = obj.filter((o, i) => {
					return method.indexOf(o.method.toLowerCase()) !== -1;
				});
			}

			if (req.query.url) {
				const url = req.query.url;
				obj = obj.filter((o, i) => {
					return o.url.toLowerCase().search(regexEscape(url).toLowerCase()) !== -1;
				});
			}

			if (req.query.status) {
				const status = req.query.status;
				obj = obj.filter((o, i) => {
					return o.status.toString().search(regexEscape(status).toString()) !== -1;
				});
			}

			res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
			res.setHeader('X-Total-Count', obj.length);

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

