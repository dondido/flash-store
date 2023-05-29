const { pathname } = window.location;
const response = await fetch(`${pathname}/manifest.json`);
const { url, controls } = await response.json();
window.RufflePlayer = window.RufflePlayer || {};
const ruffle = window.RufflePlayer.newest();
const player = ruffle.createPlayer();
player.config = {
    contextMenu: 'rightClickOnly'
};
const container = document.getElementById('container');
const triggerKeydownEvent = event => window.dispatchEvent(new KeyboardEvent('keydown', event));
const triggerKeyupEvent = event => window.dispatchEvent(new KeyboardEvent('keyup', event));
container.appendChild(player);
player.load(`${pathname}/${url}`);
controls.forEach(async ({ joystick, button }) => {
    if (joystick) {
        const { mappings, dataset } = joystick;
        const mapKeydown = direction => triggerKeydownEvent({ code: mappings[direction] });
        const mapKeyup = direction => triggerKeyupEvent({ code: mappings[direction] });
        document.body.insertAdjacentHTML('beforeend', '<virtual-joystick></virtual-joystick>');
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
    if (button) {
        const Button = await import('./button.js');
        Button.default(button);
    }
});
