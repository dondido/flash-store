const fs = require('fs');
const path = require('path');

const GAMES_PER_PAGE = 100;
const BUILD_PATH = path.join(__dirname, '../docs/');

const directoryPath = path.join(__dirname, '../docs/s');
const $template = fs.readFileSync('./templates/index.html', 'utf8');

let pageCount = 0;

const savePage = (content, folder) => {
    const html = $template.replace('${games}', content)
        .replace(/>\s+</g,'><');
    console.log(`Page ${++ pageCount}: ${folder}index.html`)
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
            $pages += `
                <li>
                    <a href="./${path}/${i}/" ${ariaCurrent}>${i}</a>
                </li>
            `;
        } else if (i === currentPage - (offset + 1) || i === currentPage + (offset + 1)) {
            $pages += '<li></li>';
        }
    }
    return `
        <nav role="navigation" aria-label="Pagination Navigation">
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
        const path = '/../..'
        savePage(content, pageFolder, path);
    }
    savePage(content, folder, '/..');
    fs.writeFileSync(`${folder}search.csv`, games.join(' '));
    return content;
};
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
    const sortByDate = (a, b) => games[b].date - games[a].date;
    const sortByViews = (a, b) => games[b].views - games[a].views;
    const sortByRating = (a, b) => games[b].rating - games[a].rating;
    const gamesByViews = folders.toSorted(sortByViews);
    const gamesByRating = gamesByViews.toSorted(sortByRating);
    const gamesByDate = gamesByViews.toSorted(sortByDate);
    const content = makePages(gamesByViews, 'views');
    savePage(content, BUILD_PATH, '');
    makePages(gamesByRating, 'rating');
    makePages(gamesByDate, 'newest');
});
