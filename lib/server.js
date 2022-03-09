import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.options('*', cors());
app.use('/data', express.static('data'));
app.use('/', express.static('dashboard/public/'));

export default app;
