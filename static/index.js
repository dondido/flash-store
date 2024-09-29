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
    const games = folders.reduce((games, game) => {
        const path = `${directoryPath}/${game}/`;
        const intrinsic = require(`${path}intrinsic.json`);
        return { ...games, [game]: intrinsic };
    }, {});
    
    const sortByReleaseDate = (a, b) => games[b].released - games[a].released;
    const sortByPublishDate = (a, b) => games[b].published - games[a].published;
    const gamesByPublishDate = folders.toSorted(sortByPublishDate);
    const getGameIndex = game => gamesByPublishDate.indexOf(game);
    const gamesByReleaseDate = gamesByPublishDate.toSorted(sortByReleaseDate).map(getGameIndex);
    const gameList = gamesByPublishDate.map((folder) => {
        const { name } = require(`${directoryPath}/${folder}/manifest.json`);
        return `
            <li>
                <a href="./s/${folder}/">
                    <video poster="spinner.svg"></video>
                    <h2>${name}</h2>
                </a>
            </li>
        `;
    }).join('').replace(/>\s+</g,'><');
    saveString({ games: gameList }, 'index.html');
    fs.writeFileSync(`${path.join(__dirname, '../docs')}/release-order.csv`, gamesByReleaseDate.toString());
});
