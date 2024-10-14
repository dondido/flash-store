let activeVideo = null;
let gameTitles = '';
let searchTimer;
let $gallery = document.querySelector('.gallery');
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
            const { href } = target;
            const video = document.createElement('video');
            video.disableremoteplayback = true;
            video.loop = true;
            video.poster = `${href}poster.jpg`;
            video.muted = true;
            video.src = `${href}video.mp4`;
            target.prepend(video);
            lazyVideoObserver.unobserve(target);
        }
    });
});
const applyObserver = lazyVideo => lazyVideoObserver.observe(lazyVideo);
const attachObserver = () => $gallery.querySelectorAll('a').forEach(applyObserver);
const matchGameOrdering = $a => location.pathname.startsWith($a.getAttribute('href').slice(1));
const $currentTab = location.pathname === '/'
    ? document.querySelector('.sort-by a')
    : Array.from(document.querySelectorAll('.sort-by a')).find(matchGameOrdering);
const cap = str => `${str[0].toUpperCase()}${str.slice(1)}`;
const formatTitle = (title = '') => {
    const exludeWords = ['of', 'the', 'vs', 'in'];
    return cap(title.split('_').join(' ').replace(/\b\w+\b/g, m => exludeWords.includes(m) ? m : cap(m)));
};
const searchGames = ({ target: { value } }) => {
    const term = value.toLocaleLowerCase().split(' ').join('_');
    clearTimeout(searchTimer); 
    searchTimer = setTimeout(() => {
        $gallery.innerHTML = gameTitles
            .filter(gameTitle => gameTitle.includes(term))
            .map(game => `<li><a href="/s/${game}/"><h2>${formatTitle(game)}</h2></a></li>`)
            .join('');
        attachObserver();
    }, 300);
};
const fetchgameTitles = async () => {
    window.search.onfocus = null;
    const response = await fetch(`${$currentTab.href}/search.csv`);
    const csv = await response.text();
    gameTitles = csv.split(' ');
    window.search.oninput = searchGames;
};
document.addEventListener('pointermove', move);
document.addEventListener('DOMContentLoaded', attachObserver);
window.search.placeholder = `Search ${$gallery.dataset.count} games`;
window.search.onfocus = fetchgameTitles;
$currentTab.className = 'current';
document.querySelector('.gallery a').styles.viewTransitionName = 'my';