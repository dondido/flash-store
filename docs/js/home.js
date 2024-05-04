let activeVideo = null;
const $games = document.querySelectorAll('.game');
const gameTitles = Array.from(document.querySelectorAll('.game-title'))
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
document.addEventListener('pointermove', move);
document.addEventListener('DOMContentLoaded', () => {
    if ('IntersectionObserver' in window) {
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
        document.querySelectorAll('video').forEach(lazyVideo => lazyVideoObserver.observe(lazyVideo));
    }
});
window.search.placeholder = `Search ${gameTitles.length} games`
window.search.oninput = ({ target: { value } }) => {
    const term = value.toLowerCase();
    $games.forEach(($game, index) => {
        $game.hidden = gameTitles[index].includes(term) === false;
    })
};