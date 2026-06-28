import './gamepad-page-handler.js';

let activeVideo = null;
let gameTitles = '';
let searchTimer;
const $gallery = document.querySelector('.gallery');
const $search = document.getElementById('search');
const $slider = document.querySelector('.tags');
const [$buttonPrev, $buttonNext] = $slider.parentElement.querySelectorAll('button');
const $tabs = Array.from(document.querySelectorAll('.sort-by a'));
const matchGameOrdering = $a => location.pathname.slice(1).replace('flash-store/', '')
    .startsWith($a.getAttribute('href').split('/')[1]);
const $currentTab = $tabs.find(matchGameOrdering) || $tabs[0];
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
const cap = str => `${str[0].toUpperCase()}${str.slice(1)}`;
const formatTitle = (title = '') => {
    const exludeWords = ['of', 'the', 'vs', 'in'];
    return cap(title.split('_').join(' ').replace(/\b\w+\b/g, m => exludeWords.includes(m) ? m : cap(m)));
};
const handleSlide = (dir) => {
  const slideWidth = $slider.scrollWidth / $slider.childElementCount;
  $slider.scrollLeft += slideWidth * dir;
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
    $search.onfocus = null;
    const path = location.pathname === '/' || location.pathname === '/flash-store/'
        ? `${location.pathname}views/`
        : location.pathname;
    const response = await fetch(`${path}/search.csv`);
    const csv = await response.text();
    gameTitles = csv.split(' ');
    $search.oninput = searchGames($gallery.innerHTML);
};

document.addEventListener('pointermove', move);
document.addEventListener('DOMContentLoaded', attachObserver);
$search.placeholder = `Search ${$gallery.dataset.count} games`;
$search.onfocus = fetchgameTitles;
$currentTab.className = 'current';
$buttonPrev.onclick = () => handleSlide(-1);
$buttonNext.onclick = () => handleSlide(1);

/* initGamepadHandler(document.body, {
    button: [],
    joystick: [{
        mappings: {
            n: 'ArrowUp',
            s: 'ArrowDown',
            w: 'ArrowLeft',
            e: 'ArrowRight',
        }
    }]
});
 */