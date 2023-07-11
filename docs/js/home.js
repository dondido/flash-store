let activeVideo = null;
const up = ({ target }) => target.load();
const move = ({ target }) => {
    if (target.tagName === 'VIDEO') {
        if (activeVideo === null) {
            target.load();
            target.play();
            activeVideo = target;
        }
    }
    else {
        activeVideo?.load();
        activeVideo = null;
    }
};
document.addEventListener('pointermove', move);
document.addEventListener('DOMContentLoaded', () => {
    /* const lazyVideos = [...document.querySelectorAll('video.lazy')];
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
    } */
});