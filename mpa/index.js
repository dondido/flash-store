const fs = require('fs');
const path = require('path');

const GAMES_PER_PAGE = 100;
const BUILD_PATH = path.join(__dirname, '../docs/');

const directoryPath = path.join(__dirname, '../docs/s');
const $templateIndex = fs.readFileSync('./templates/index.html', 'utf8');
const $templateTags = fs.readFileSync('./templates/tags.html', 'utf8');

let pageCount = 0;
let gamesPerTag = {};
let topGamesPerTag = {};
const games = {};
const assignGame = (game) => {
    const path = `${directoryPath}/${game}/`;
    const intrinsic = require(`${path}intrinsic.json`);
    games[game] = intrinsic;
};
const savePage = (content, folder) => {
    let orderSuffix = '';
    const [, orderSuffixPath] = folder.split('/tags/')
    const orderBy = folder.match(/(\w+)\//gi)?.[0].replace('tags/', '') || '';
    if (orderSuffixPath) {
        orderSuffix = `tags/${orderSuffixPath.split('/')[0]}`;
    }
    const html = $templateIndex
        .replace('${games}', content)
        .replace('${tags}', makeTags(`${orderBy}tags/`, topGamesPerTag))
        .replaceAll('${orderSuffix}', orderSuffix)
        .replaceAll('${orderBy}', orderBy)
        .replace(/>\s+</g,'><');
    console.log(`Page ${++ pageCount}: ${folder}index.html`);
    folder !== BUILD_PATH && fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(`${folder}index.html`, html);
};
const makePagination = (currentPage, lastPage, path, onSides = 1) => {
    // pages
    let $pages = '';
    // Loop through
    for (let i = 1; i <= lastPage; i++) {
        let offset = (i === 1 || lastPage) ? onSides + 1 : onSides;
        // If added
        if (i === 1 || (currentPage - offset <= i && currentPage + offset >= i) || 
            i === currentPage || i === lastPage) {
            const ariaCurrent = i === currentPage ? ' aria-current="true"' : '';
            $pages += `<li><a href="./${path}/${i}/" ${ariaCurrent}>${i}</a></li>`;
        } else if (i === currentPage - (offset + 1) || i === currentPage + (offset + 1)) {
            $pages += '<li></li>';
        }
    }
    return `
        <nav class="nav-pagination" aria-label="Pagination">
            <ul class="pagination">
                ${$pages}
            </ul>
        </nav>
    `;
};
const makeGallery = (games, gameCount) => {
    const $games =  games.map((game) => {
        const { name } = require(`${directoryPath}/${game}/manifest.json`);
        return `<li><a href="./s/${game}/"><h2>${name}</h2></a></li>`;
    }).join('');
    return `<ul class="gallery" data-count=${gameCount}>${$games}</ul>`;
};
const iconMap = {
    '2-player': '2-players',
    '3+-player': '3-players',
    gun: 'guns',
    trap: 'traps',
    reflex: 'reflexion',
    platform: 'platforms',
    monster: 'monsters',
    matching: 'icon-game',
    guessing: 'icon-game',
    zombie: 'zombies',
    stunt: 'stunts',
    block: 'blocks',
    pixel: 'pixel-art',
    word: 'words',
    board: 'board-game',
    clicking: 'clicker',
    fairy: 'faerie',
    mining: 'mine',
    upgrade: 'purchase-equipment-upgrades',
}
const toKebabCase = tag => tag.toLowerCase().replace("'", '').split(' ').join('-');
const makeTags = (folder, gameMap = gamesPerTag) => {
    let $tags = `<li><a style="background-image: url(../icons/sprite-tags.svg#icon-game" href="./${folder.replace('tags/', '')}">All<span>${Object.keys(games).length}</span></a></li>`;
    for (const key in gameMap) {
        
        const id = toKebabCase(key);
        $tags = `${$tags}<li><a style="background-image: url(../icons/sprite-tags.svg#${iconMap[id] || id}" href="./${folder}${id}/">${key}<span>${gamesPerTag[key].length}</span></a></li>`;
    }
    return $tags;
};
const extractGamesPerTag = () => {
    const sortObjectByKeys = o => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
    for (const key in games) {
        const { tags } = games[key];
        const processTag = tag => {
            if (tag.includes('Y8') || ['1 player', 'Flash'].includes(tag)) return;
            gamesPerTag[tag] = gamesPerTag[tag] ? [...new Set([...gamesPerTag[tag], key])] : [key];
        };
        tags.forEach(processTag);
    }
    gamesPerTag = sortObjectByKeys(gamesPerTag);
    topGamesPerTag = Object.fromEntries(
        Object.entries(gamesPerTag).sort(([, a],[, b]) => b.length - a.length).slice(0, 8)
    );
};
const makePages = (games, order) => {
    const gameCount = games.length;
    const folder = `${BUILD_PATH}${order}/`;
    const lastPage = Math.ceil(gameCount / GAMES_PER_PAGE);
    let count = lastPage + 1;
    let content = '';
    while (1 < count --) {
        const pageFolder = `${folder}${count}/`;
        const end = count * GAMES_PER_PAGE;
        const start = end - GAMES_PER_PAGE;
        content = `
            ${makeGallery(games.slice(start, end), gameCount)}
            ${makePagination(count, lastPage, order)}
        `;
        savePage(content, pageFolder);
    }
    savePage(content, folder);
    fs.writeFileSync(`${folder}search.csv`, games.join(' '));
    return content;
};
const makeTagsPage = (folder) => {
    const $tags = makeTags(folder);
    const html = $templateTags.replace('${tags}', $tags);
    fs.mkdirSync(`${BUILD_PATH}${folder}`, { recursive: true });
    fs.writeFileSync(`${BUILD_PATH}${folder}index.html`, html);
};
const makeGamesPerTagPage = (orderedGames, path) => {
    const folder = `${path}/tags/`.replace('//', '/');
    makeTagsPage(folder);
    for (const key in gamesPerTag) {
        const ref = toKebabCase(key);
        const gameList = gamesPerTag[key];
        const games = orderedGames.filter(value => gameList.includes(value));
        makePages(games, `${folder}${ref}`);
    }
};
fs.readdir(directoryPath, (err, folders) => {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    folders.forEach(assignGame);
    extractGamesPerTag();
    const sortByDate = (a, b) => games[b].date - games[a].date;
    const sortByViews = (a, b) => games[b].views - games[a].views;
    const sortByRating = (a, b) => games[b].rating - games[a].rating;
    const gamesByViews = folders.toSorted(sortByViews);
    const gamesByRating = gamesByViews.toSorted(sortByRating);
    const gamesByDate = gamesByViews.toSorted(sortByDate);
    const content = makePages(gamesByViews, 'views');
    makeGamesPerTagPage(gamesByViews, 'views');
    savePage(content, BUILD_PATH);
    makeGamesPerTagPage(gamesByViews, '');
    makePages(gamesByRating, 'rating');
    makeGamesPerTagPage(gamesByRating, 'rating');
    makePages(gamesByDate, 'newest');
    makeGamesPerTagPage(gamesByDate, 'newest');
});
