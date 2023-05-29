const getDir = (degree) => {
    const dirs = ['ne', 'n', 'nw', 'w', 'sw', 's', 'sw'];
    const acute = 45;
    let treshold = 22.5;
    for (let dir of dirs) {
        if (degree >= treshold && degree < (treshold += acute)) {
            return dir;
        }
    }
    return 'w';
};
const createElement = () => {
    const element = document.createElement('div');
    element.className = 'joystick';
    return element;
}
export default function({
    element = createElement(),
    parent = document.body,
    down = () => {},
    move = () => {},
    up = () => {},
}) {
    this.dir = '';
    this.degree = 0;
    if (element.parentElement === null) {
        typeof element === 'string' ? parent.innerHTML += element : parent.appendChild(element);
    }
    const r = + getComputedStyle(element).getPropertyValue('--r');
    const setXY = (x, y) => {
        element.style.setProperty('--x', x);
        element.style.setProperty('--y', y);
    };
    const end = () => {
        element.classList.remove('focus');
        setXY(r, r);
        element.onpointerup = element.onpointermove = null;
        this.dir = '';
        up();
    };
    const bind = ({ clientX, clientY }, cb = move) => {
        const dx = clientX - element.offsetLeft;
        const dy = clientY - element.offsetTop;
        const dxr = dx - r;
        const dyr = dy - r;
        const angle = Math.atan2(dyr, dxr);
        const hypot = Math.hypot(dxr, dyr);
        const degree = angle * 180 / Math.PI;
        this.degree = (degree > 0 ? 360 : 0) - degree;
        hypot > r ? setXY(r * Math.cos(angle) + r, r * Math.sin(angle) + r) : setXY(dx, dy);
        this.dir = getDir(this.degree);
        cb();
    };
    const start = (event) => {
        const { clientX, clientY } = event;
        const { offsetLeft: x, offsetTop: y, offsetWidth: w, offsetHeight: h } = element;
        if (clientX >= x && clientX <= x + w && clientY >= y && clientY <= y + h) {
            element.classList.add('focus');
            bind(event, down);
            element.setPointerCapture(event.pointerId);
            element.onpointermove = bind;
            element.onpointerup = end;
        }
    };
    console.log(1111);

    // document.addEventListener('pointerdown', start);
};
