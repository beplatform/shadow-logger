#!/usr/bin/env node
import server from './server.js';
import { exec } from 'child_process';

const port = process.env.LOGGER_PORT || 8081;
const [,, command] = process.argv;
if (command === 'up') {
    console.log('starting server');

    server.listen(port, () => {
        console.log('Server is running on port: ' + port);
    });
}

if (command === 'build') {
    const url = process.argv[3];
    exec(`REACT_APP_API_URL=${url} yarn build`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout);
    });
}