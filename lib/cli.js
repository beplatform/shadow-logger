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
    const apiUrl = process.argv[3];
    const debugPath = process.argv[4];
    const buildPath = process.argv[5] || './build';
    if (!apiUrl || !debugPath) {
        console.log('missing params, please run: npx express-logger build <LogsApiUrl> <DebuggerUrlPath>');
    }
    console.log('starting build');
    exec(`cd ./node_modules/express-logger && REACT_APP_API_URL=${apiUrl} PUBLIC_URL=${debugPath || '/debug'} yarn build`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout);
        console.log('copying build');
        exec(`rm -r ${buildPath}`, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            exec(`mv ./node_modules/express-logger/dashboard/build ${buildPath}`, (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(stdout);
            });
        });
    });
}