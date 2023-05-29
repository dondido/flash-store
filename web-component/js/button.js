const triggerKeydownEvent = event => window.dispatchEvent(new KeyboardEvent('keydown', event));
const triggerKeyupEvent = event => window.dispatchEvent(new KeyboardEvent('keyup', event));
export default ({ cssText, mappings, label }) => {
    const button = document.createElement('div');
    button.className = 'button';
    button.textContent = label;
    const { style } = button;
    if (cssText) {
        style.cssText = cssText;
    }
    document.body.appendChild(button);
    const end = () => {
        button.classList.remove('focus');
        mappings.forEach(triggerKeyupEvent);
    };
    const start = (event) => {
        const { clientX, clientY } = event;
        const { offsetLeft: x, offsetTop: y, offsetWidth: w, offsetHeight: h } = button;
        if (clientX >= x && clientX <= x + w && clientY >= y && clientY <= y + h) {
            button.classList.add('focus');
            button.setPointerCapture(event.pointerId);
            mappings.forEach(triggerKeydownEvent);
            button.onpointerup = end;
        }
    };
    button.onpointerdown = start;
    document.addEventListener('pointerdown', start);
}