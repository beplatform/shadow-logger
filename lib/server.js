import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.static('data'));
app.options('*', cors());

export default app;
