const fs = require('fs');
const path = require('path');
const directoryPath = path.join(__dirname, '../docs/s');
fs.readdir(directoryPath, (err, folders) => {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    folders.forEach((folder) => {
        const path = `${directoryPath}/${folder}/`;
        const intrinsicPath = `${path}intrinsic.json`;
        const date = fs.statSync(`${path}game.swf`).mtimeMs;
        const getPublishDate = () => {
            const html = fs.readFileSync(`${path}index.html`, 'utf8');
            const addedOn = html.match(/\d{2}\s{1}\w{3}\s{1}20\d{2}/)?.[0] || '01 Jan 2001';
            return + new Date(addedOn);
        };
        const { tags, views, rating, published = getPublishDate() } = require(intrinsicPath);
        /*const isIntrinsicCreated = fs.existsSync(intrinsicPath);
        if (isIntrinsicCreated) {
            return;
        } */
        fs.writeFileSync(intrinsicPath, JSON.stringify({ date, tags, views, rating, published }));
    });
});
