const fs = require('fs');
const axios = require('axios');
const jsdom = require('jsdom');
const es6Renderer = require('express-es6-template-engine');
const sharp = require('sharp');
const [url] = process.argv.slice(2);
const { JSDOM } = jsdom;
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) y8-browser/1.0.10 Chrome/73.0.3683.121 Electron/5.0.13 Safari/537.36'
};
const saveStream = (url, file, path) => axios({ url, responseType: 'stream' })
    .then(response => response.data.pipe(fs.createWriteStream(`${path}/${file}`)));
const saveIcon = (stream, path) => stream.on('finish', () => sharp(stream.path)
    .resize({ width: 144, height: 144, fit: sharp.fit.cover, position: sharp.strategy.entropy })
    .toFormat('png')
    .toFile(`${path}/icon.png`)
);
const saveString = (locals, file, path) => es6Renderer(
    `./templates/${file}`,
    { locals },
    (err, content) => fs.writeFileSync(`${path}/${file}`, content)
);
const requestResources = ({ title, description, game, video, poster, folder, path }) => {
    axios
        .get(url, { headers })
        .then((response) => {
            const dom = new JSDOM(response.data);
            const $video = dom.window.document.querySelector('video');
            const locals = {
                title: title || dom.window.document.querySelector('h1').textContent,
                description: description || dom.window.document.querySelector('h2').textContent
            }
            if (game === undefined) {
                const [html] = response.data.split('.swf');
                saveStream(`${html.slice(html.lastIndexOf('https'))}.swf`, 'game.swf', path);
            }
            if (video === undefined) {
                saveStream(`https://img.y8.com${$video.querySelector('source').src}`, 'video.mp4', path);
            }
            if (poster === undefined) {
                saveStream($video.poster, 'poster.jpg', path)
                    .then(stream => saveIcon(stream, path));
            }
            saveString(locals, 'index.html', path);
            saveString({ ...locals, folder }, 'manifest.json', path);
        });
};
const scrape = (url) => {
    const folder = url.split('/').pop();
    const path = `../docs/s/${folder}`;
    if (fs.existsSync(path)) {
        let title;
        let description;
        const game = fs.existsSync(`${path}/game.swf`);
        const video = fs.existsSync(`${path}/video.mp4`);
        const poster = fs.existsSync(`${path}/poster.jpg`);
        if (fs.existsSync(`${path}/manifest.json`)) {
            const manifest = require(`${path}/manifest.json`);
            title = manifest.name;
            description = manifest.description;
        }
        if (title && description && game && video && poster) {
            saveString({ title, description }, 'index.html', path);
        }
        else {
            requestResources({ title, description, game, video, poster, folder, path });
        }
    }
    else {
        fs.mkdirSync(path);
        requestResources({ folder, path });
    }
};
if (url) {
    scrape(url);
}
module.exports = scrape;