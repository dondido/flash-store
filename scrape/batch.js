const fs = require('fs');
const scrape = require('./index.js');
fs.readdir('../docs/s/', (err, folders) => {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    folders.forEach(scrape);
});