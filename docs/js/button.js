const downs = [];
const ups = [];
export default ({ mappings, label }, $gamepadButtons, player) => {
    let pointerId;
    const button = document.createElement('div');
    const triggerKeyboardEvent = keyState => event => {
        player.focus();
        console.log(1111111, keyState, event);
        window.dispatchEvent(new KeyboardEvent(keyState, event));
    };
    button.className = `button button-${label.toLowerCase()}`;
    button.textContent = label;
    $gamepadButtons.appendChild(button);
    const end = (event) => {
        if (pointerId === event.pointerId) {
            button.classList.remove('focus');
            mappings.forEach(triggerKeyboardEvent('keyup'));
        }
    };
    const start = (event) => {
        const { clientX, clientY } = event;
        const { top, right, bottom, left } = button.getBoundingClientRect();
        if (clientX >= left && clientX <= right && clientY >= top && clientY <= bottom) {
            button.classList.add('focus');
            pointerId = event.pointerId;
            mappings.forEach(triggerKeyboardEvent('keydown'));
            document.addEventListener('pointerup', end);
        }
    };
    downs.push(start);
    ups.push(end);
}
document.removeEventListener('pointerup', (event) => ups.forEach(up => up(event)));
document.addEventListener('pointerdown', (event) => downs.forEach(down => down(event)));
