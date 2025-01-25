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
const matchGameOrdering = $a => location.pathname.slice(1).replace('flash-store/', '')
    .startsWith($a.getAttribute('href').split('/')[1]);
const $currentTab = Array.from(document.querySelectorAll('.sort-by a')).find(matchGameOrdering) || document.querySelector('.sort-by a');
const cap = str => `${str[0].toUpperCase()}${str.slice(1)}`;
const formatTitle = (title = '') => {
    const exludeWords = ['of', 'the', 'vs', 'in'];
    return cap(title.split('_').join(' ').replace(/\b\w+\b/g, m => exludeWords.includes(m) ? m : cap(m)));
};
const searchGames = (originalGallery) => ({ target: { value } }) => {
    const term = value.toLocaleLowerCase().split(' ').join('_');
    clearTimeout(searchTimer); 
    searchTimer = setTimeout(() => {
        $gallery.innerHTML = term
            ? gameTitles
                .filter(gameTitle => gameTitle.includes(term))
                .map(game => `<li><a href="./s/${game}/"><h2>${formatTitle(game)}</h2></a></li>`)
                .join('')
            : originalGallery;
        attachObserver();
    }, 300);
};
const fetchgameTitles = async () => {
    window.search.onfocus = null;
    const path = location.pathname === '/' || location.pathname === '/flash-store/'
        ? `${location.pathname}views/`
        : location.pathname;
    const response = await fetch(`${path}/search.csv`);
    const csv = await response.text();
    gameTitles = csv.split(' ');
    window.search.oninput = searchGames($gallery.innerHTML);
};
const handleSlide = (dir) => {
  const slideWidth = $slider.scrollWidth / $slider.childElementCount;
  $slider.scrollLeft += slideWidth * dir;
};
const $slider = document.querySelector('.tags');
const [$buttonPrev, $buttonNext] = $slider.parentElement.querySelectorAll('button');
$buttonPrev.onclick = () => handleSlide(-1);
$buttonNext.onclick = () => handleSlide(1);
document.addEventListener('pointermove', move);
document.addEventListener('DOMContentLoaded', attachObserver);
window.search.placeholder = `Search ${$gallery.dataset.count} games`;
window.search.onfocus = fetchgameTitles;
$currentTab.className = 'current';
