const downs = [];
const ups = [];
const normaliseKey = ({ key, code }) => {
    if (code && key === undefined) {
        key = code.startsWith('Key') ? code.at(-1).toLowerCase() : code;
    }
    return { key, code: code || key };
}
export default ({ mappings, label }, $gamepadButtons, player) => {
    let pointerId;
    const keys = mappings.map(normaliseKey)
    const button = document.createElement('div');
    const triggerKeyboardEvent = keyState => event => {
        player.focus();
        window.dispatchEvent(new KeyboardEvent(keyState, event));
    };
    button.className = `button button-${label.toLowerCase()}`;
    button.textContent = label;
    $gamepadButtons.appendChild(button);
    const end = (event) => {
        if (pointerId === event.pointerId) {
            button.classList.remove('focus');
            keys.forEach(triggerKeyboardEvent('keyup'));
        }
    };
    const start = (event) => {
        const { clientX, clientY } = event;
        const { top, right, bottom, left } = button.getBoundingClientRect();
        if (clientX >= left && clientX <= right && clientY >= top && clientY <= bottom) {
            button.classList.add('focus');
            pointerId = event.pointerId;
            keys.forEach(triggerKeyboardEvent('keydown'));
            document.addEventListener('pointerup', end);
        }
    };
    downs.push(start);
    ups.push(end);
}
document.removeEventListener('pointerup', (event) => ups.forEach(up => up(event)));
document.addEventListener('pointerdown', (event) => downs.forEach(down => down(event)));
