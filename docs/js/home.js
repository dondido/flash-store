let activeVideos = [];
const up = ({ target }) => target.load();
const move = ({ target, pointerId }) => {
    if (target.classList.contains('game-link-video')) {
        target.setPointerCapture(pointerId);
        target.play();
        activeVideos.push(target);
    }
    else {
        activeVideos.forEach(activeVideo => activeVideo.load());
        activeVideos = [];
    }
};
const click = (event) => {
    const link = event.target.closest('.game-link');
    if (link) {
        event.preventDefault();
        location.href = link.href;
        alert(link.href);
    }
};
document.addEventListener('pointermove', move);
document.addEventListener('click', click);