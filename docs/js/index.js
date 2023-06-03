const { pathname } = window.location;
await navigator.serviceWorker.register('../../js/sw.js');
const response = await fetch(`${pathname}game.json`);
const { url, controls, aspectRatio } = await response.json();
window.RufflePlayer = window.RufflePlayer || {};
const $playground = document.querySelector('.playground');
const run = () => {
    document.body.classList.add('run');
    $playground.onclick = null;
};
const attachPlayer = () => {
    $playground.prepend(player);
    player.load(`${pathname}/${url}`);
    $playground.onclick = run;
};
$playground.style.aspectRatio = aspectRatio;
document.querySelector('.button-close').onclick = (event) => {
    event.preventDefault();
    document.body.classList.remove('run');
    console.log(111, player.ensureFreshInstance);
    player.ensureFreshInstance();
    //player.remove();
    //$playground.prepend(player);
    
    //$playground.onclick = run;
    setTimeout(attachPlayer, 1000)
}
const ruffle = window.RufflePlayer.newest();
const player = ruffle.createPlayer();
player.config = {
    contextMenu: 'rightClickOnly'
};
const triggerKeydownEvent = event => window.dispatchEvent(new KeyboardEvent('keydown', event));
const triggerKeyupEvent = event => window.dispatchEvent(new KeyboardEvent('keyup', event));
attachPlayer();
controls.forEach(async (control) => {
    const { type } = control;
    if ('joystick' === type) {
        const { mappings, dataset } = control;
        const mapKeydown = direction => triggerKeydownEvent({ code: mappings[direction] });
        const mapKeyup = direction => triggerKeyupEvent({ code: mappings[direction] });
        $playground.insertAdjacentHTML('beforeend', '<virtual-joystick></virtual-joystick>');
        const $joystick = document.querySelector('virtual-joystick');
        $joystick.addEventListener('joystickdown', () => {
            $joystick.dataset.capture.split('').forEach(mapKeydown);
        });
        $joystick.addEventListener('joystickmove', () => {
            $joystick.dataset.release.split('').forEach(mapKeyup);
            $joystick.dataset.capture.split('').forEach(mapKeydown);
        });
        $joystick.addEventListener('joystickup', () => {
            $joystick.dataset.release.split('').forEach(mapKeyup);
        });
        if (dataset) {
            Object.assign($joystick.dataset, dataset);
        }
    }
    if ('button' === type) {
        const Button = await import('./button.js');
        Button.default(control, $playground);
    }
});
