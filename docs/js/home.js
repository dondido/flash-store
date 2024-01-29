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
    const lazyVideos = [...document.querySelectorAll('video.lazy')];
    if ('IntersectionObserver' in window) {
        const lazyVideoObserver = new IntersectionObserver((entries) => {
            entries.forEach((video) => {
                if (video.isIntersecting) {
                    video.target.poster = video.target.dataset.poster;
                    for (const source in video.target.children) {
                        const videoSource = video.target.children[source];
                        if (typeof videoSource.tagName === 'string' && videoSource.tagName === 'SOURCE') {
                            videoSource.src = videoSource.dataset.src;
                        }
                    }
                    video.target.classList.remove('lazy');
                    lazyVideoObserver.unobserve(video.target);
                }
            });
        });
        lazyVideos.forEach(lazyVideo => lazyVideoObserver.observe(lazyVideo));
    }
});
window.search.placeholder = `Search ${gameTitles.length} games`
window.search.oninput = ({ target: { value } }) => {
    const term = value.toLowerCase();
    $games.forEach(($game, index) => {
        $game.hidden = gameTitles[index].includes(term) === false;
    })
};