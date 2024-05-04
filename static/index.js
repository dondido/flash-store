const fs = require('fs');
const path = require('path');
const directoryPath = path.join(__dirname, '../docs/s');
const es6Renderer = require('express-es6-template-engine');
const saveString = (locals, file) => es6Renderer(
    `./templates/${file}`,
    { locals },
    (err, content) => fs.writeFileSync(`${path.join(__dirname, '../docs')}/${file}`, content)
);
fs.readdir(directoryPath, (err, folders) => {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all folders using forEach
    const games = folders.map((folder) => {
        // Do whatever you want to do with the file
        console.log(folder);
        const { name } = require(`${directoryPath}/${folder}/manifest.json`);
        return `
            <li class="game">
                <a class="game-link" href="./s/${folder}/">
                    <video poster="spinner.svg"></video>
                    <h2 class="game-title">${name}</h2>
                </a>
            </li>
        `;
    }).join('').replace(/>\s+</g,'><');
    saveString({ games }, 'index.html');
});
