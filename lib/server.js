import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.static('data'));
app.options('*', cors());

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
