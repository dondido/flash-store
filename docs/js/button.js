const triggerKeydownEvent = e => window.dispatchEvent(new KeyboardEvent('keydown', e));
const triggerKeyupEvent = e => window.dispatchEvent(new KeyboardEvent('keyup', e));
const downs = [];
const ups = [];
export default ({ mappings, label }, $player) => {
    let pointerId;
    const button = document.createElement('div');
    button.className = `button button-${label.toLowerCase()}`;
    button.textContent = label;
    $player.appendChild(button);
    const end = (event) => {
        if (pointerId === event.pointerId) {
            button.classList.remove('focus');
            mappings.forEach(triggerKeyupEvent);
        }
    };
    const start = (event) => {
        const { clientX, clientY } = event;
        const { offsetLeft: x, offsetTop: y, offsetWidth: w, offsetHeight: h } = button;
        if (clientX >= x && clientX <= x + w && clientY >= y && clientY <= y + h) {
            button.classList.add('focus');
            pointerId = event.pointerId;
            mappings.forEach(triggerKeydownEvent);
            document.addEventListener('pointerup', end);
        }
    };
    downs.push(start);
    ups.push(end);
}
document.removeEventListener('pointerup', (event) => ups.forEach(up => up(event)));
document.addEventListener('pointerdown', (event) => downs.forEach(down => down(event)));
