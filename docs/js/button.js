const insertStylesheet = (href) => {
    if (document.querySelector(`[${href}]`)) {
        return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = href;
    document.head.appendChild(link);
};
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
    const { top, right, bottom, left } = button.getBoundingClientRect();
    const end = () => {
        button.classList.remove('focus');
        mappings.forEach(triggerKeyupEvent);
    };
    const start = (event) => {
        const { clientX, clientY } = event;
        console.log(111, top, right, bottom, left, clientX >= left && clientX <= right && clientY >= top && clientY <= bottom)
        if (clientX >= left && clientX <= right && clientY >= top && clientY <= bottom) {
            button.classList.add('focus');
            button.setPointerCapture(event.pointerId);
            mappings.forEach(triggerKeydownEvent);
            button.onpointerup = end;
        }
    };
    button.onpointerdown = start;
    document.addEventListener('pointerdown', start);
}
