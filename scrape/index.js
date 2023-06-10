const fs = require('fs');
const axios = require('axios');
const jsdom = require('jsdom');
const es6Renderer = require('express-es6-template-engine');
const sharp = require('sharp');
const [url] = process.argv.slice(2);
const folder = url.split('/').pop();
const path = `../docs/s/${folder}`;
const custom = fs.existsSync(`${path}/custom.json`) ? require(`${path}/custom.json`) : {};
const { JSDOM } = jsdom;
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) y8-browser/1.0.10 Chrome/73.0.3683.121 Electron/5.0.13 Safari/537.36'
};
const saveStream = (url, file) => axios({ url, responseType: 'stream' })
    .then(response => response.data.pipe(fs.createWriteStream(`${path}/${file}`)));
const saveIcon = (stream) => stream.on('finish', () => sharp(stream.path)
    .resize({ width: 144, height: 144, fit: sharp.fit.cover, position: sharp.strategy.entropy })
    .toFormat('png')
    .toFile(`${path}/icon.png`)
);
const saveString = (locals, file) => es6Renderer(
    `./templates/${file}`,
    { locals },
    (err, content) => fs.writeFileSync(`${path}/${file}`, content)
)
fs.existsSync(path) || fs.mkdirSync(path);
axios
    .get(url, { headers })
    .then((response) => {
        const dom = new JSDOM(response.data);
        const [html] = response.data.split('.swf');
        const $video = dom.window.document.querySelector('video');
        const title = custom.title || dom.window.document.querySelector('h1').textContent; 
        const description = custom.description || dom.window.document.querySelector('h2').textContent;
        saveStream(`${html.slice(html.lastIndexOf('https'))}.swf`, 'game.swf');
        saveStream($video.poster, 'poster.jpg')
            .then(saveIcon);
        saveStream(`https://img.y8.com${$video.querySelector('source').src}`, 'video.mp4');
        saveString({ title, description }, 'index.html');
        saveString({ title, description, folder }, 'manifest.json');
    });