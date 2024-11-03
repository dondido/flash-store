const fs = require('fs');
const scrape = require('./index.js');
fs.readdir('../docs/s/', (err, folders) => {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    for(let i = 0; i < folders.length; i++){
        setTimeout(() => {
            scrape(folders[i]);
            console.log(i, folders[i]);
        }, i * 300)
    }
});