/* const { pathname } = window.location;
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
controls?.forEach(async ({ joystick, button }) => {
    if (joystick) {
        const Joystick = await import('./joystick.js');
        console.log(333)
        const j = new Joystick.default({
            down: () => {console.log(111, j)},
            move: () => {console.log(112, j)},
            up: () => {console.log(113, j)},
        });
    }
    if (button) {
        const Button = await import('./button.js');
        Button.default(button);
    }
}); 
const Joystick = await import('./joystick.js');
console.log(333)
const j = new Joystick.default({
    down: () => {console.log(111, j)},
    move: () => {console.log(112, j)},
    up: () => {console.log(113, j)},
});*/
import('./virtual-joystick.js');
window.addEventListener('joypaddown', (e) => {
    console.log(233, e, document.activeElement);
})
document.querySelector('virtual-joystick').addEventListener('joypaddown', (e) => {
    console.log(234, e.target);
})