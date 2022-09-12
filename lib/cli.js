#!/usr/bin/env node
import server from './server.js';
import { exec } from 'child_process';
import fs from 'fs';

const port = process.env.LOGGER_PORT || 8081;
const [, , command, ...params] = process.argv;
if (command === 'up') {
    console.log('starting server');

    server.listen(port, () => {
        console.log('Server is running on port: ' + port);
    });
}

if (command === 'install') {
    const debugPath = params[4] || './.debug'
    console.log(`Installing debugger on : ${debugPath}`);
    if (fs.existsSync(debugPath)) {
        exec(`rm -r ${debugPath}`, (err/*, stdout, stderr*/) => {
            if (err) {
                console.error(err);
                return;
            }
            exec(`cp -a ./node_modules/shadow-logger/dashboard/build ${debugPath}`, (err/*, stdout, stderr*/) => {
                if (err) {
                    console.error(err);
                    return;
                }
            });
        });
    } else {
        exec(`cp -a ./node_modules/shadow-logger/dashboard/build ${debugPath}`, (err, stdout/*, stderr*/) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(stdout);
        });
    }
}

