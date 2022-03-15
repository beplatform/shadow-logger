#!/usr/bin/env node
import server from './server.js';

const port = process.env.LOGGER_PORT || 8081;
const [,, command] = process.argv;
if (command === 'up') {
    console.log('starting server');

    server.listen(port, () => {
        console.log('Server is running on port: ' + port);
    });
}

