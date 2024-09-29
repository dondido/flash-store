let activeVideo = null;
let releaseOrder = null;
let $gallery = document.querySelector('.gallery');
let $games = Array.from($gallery.querySelectorAll('li'), $game => {
    $game.dataset.title = $game.firstElementChild.lastElementChild.textContent.toLocaleLowerCase();
    return $game;
});
const gameTitles = Array.from($gallery.querySelectorAll('h2'))
    .map(({ textContent }) => textContent.toLocaleLowerCase());
const up = ({ target }) => target.load();
const disablePreview = () => {
    activeVideo?.load();
    activeVideo = null;
};
const enablePreview = target => {
    target.load();
    target.play();
    activeVideo = target;
};
const move = ({ target }) => {
    if (target.tagName === 'VIDEO') {
        if (activeVideo === null) {
            return enablePreview(target);
        }
        if (activeVideo.poster !== target.poster) {
            disablePreview();
            enablePreview(target);
        }
        return;
    }
    disablePreview();
};
const lazyVideoObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
            const { href } = target.parentElement;
            target.disableremoteplayback = true;
            target.loop = true;
            target.poster = `${href}poster.jpg`;
            target.muted = true;
            target.src = `${href}video.mp4`;
            lazyVideoObserver.unobserve(target);
        }
    });
});
const applyObserver = lazyVideo => lazyVideoObserver.observe(lazyVideo);
const attachObserver = () => $gallery.querySelectorAll('video').forEach(applyObserver);
const sortGames = (games) => {
    const $ul = document.createElement('ul');
    $ul.className = 'gallery';
    games.forEach(game => $ul.appendChild($games.find($game => $game.dataset.title === game).cloneNode(true)));
    $gallery.replaceWith($ul);
    $gallery = $ul;
    $games = Array.from($gallery.querySelectorAll('li'));
    attachObserver();
};
document.addEventListener('pointermove', move);
document.addEventListener('DOMContentLoaded', attachObserver);
window.search.placeholder = `Search ${gameTitles.length} games`
window.search.oninput = ({ target: { value } }) => {
    const term = value.toLowerCase();
    $games.forEach(($game) => {
        $game.hidden = $game.dataset.title.includes(term) === false;
    });
};
document.querySelector('label:has([value=az])').onclick = () => sortGames(gameTitles.toSorted());
document.querySelector('label:has([value=published])').onclick = () => sortGames(gameTitles);
document.querySelector('label:has([value=released])').onclick = async () => {
    releaseOrder = releaseOrder || (await (await fetch('./release-order.csv')).text()).split(',').map(index => gameTitles[index]);
    sortGames(releaseOrder); 
};