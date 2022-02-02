import fs from 'fs';
import cryptoRandomString from 'crypto-random-string';

const middleware = (req, res, next) => {
    const logId = cryptoRandomString({ length: 10 });

    fs.writeFileSync(logId + '.json', JSON.stringify(log));
    fs.readyFileSync('index.json');
    JSON.parse()
    fs.writeFileSync('index.json', JSON.stringify(log));

    console.log('main.js');
    next();
};

export default middleware;

