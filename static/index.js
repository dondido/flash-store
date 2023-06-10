const fs = require('fs');
const path = require('path');
//joining path of directory 
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
            <li>
                <a href="./s/${folder}/">
                    <img alt="${name}" src="./s/${folder}/poster.jpg" >
                </a>
            </li>
        `
    });
    console.log(2222, `${path.join(__dirname, '../docs')}\index.html`)
    saveString({ games }, 'index.html');
});
