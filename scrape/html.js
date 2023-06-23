const fs = require('fs');
const { JSDOM } = require('jsdom');
const es6Renderer = require('express-es6-template-engine');
fs.readdir('../docs/s/', (err, folders) => {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    folders.forEach(folder => {
        const { name, description } = require(`../docs/s/${folder}/manifest.json`);
        const ref = `../docs/s/${folder}/index.html`;
        const html = fs.readFileSync(ref, 'utf8');
        const dom = new JSDOM(html);
        const extractAspectRatio = () => {
            const style = dom.window.document.querySelector('.playground').getAttribute('style');
            if (style) {
                return style.replace('aspect-ratio: ', '').replace(';', '')
            }
            const cfg = `../docs/s/${folder}/game.json`;
            return fs.existsSync(cfg) ? (require(cfg).aspectRatio || '') : '';
        };
        const addedOn = dom.window.document.querySelector('.description + p')?.textContent || '';
        const locals = { title: name, description, addedOn, aspectRatio: extractAspectRatio() };
        es6Renderer(
            './templates/index.html',
            { locals },
            (err, content) => fs.writeFileSync(ref, content)
        );
    });
});