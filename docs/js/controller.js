{
	const thumb = document.querySelector('.thumb');
	const { style } = thumb;
	const thumbRect = thumb.getBoundingClientRect();
	const end = () => {
		thumb.classList.remove('focus');
		style.setProperty('--x', 65);
		style.setProperty('--y', 65);
		thumb.onpointerup = null;
		thumb.onpointermove = null;
	};
	const move = ({ clientX, clientY }) => {
		style.setProperty('--x', clientX - thumbRect.x);
		style.setProperty('--y', clientY - thumbRect.y);
	};
	const start = (event) => {
		thumb.classList.add('focus');
		move(event);
		thumb.setPointerCapture(event.pointerId);
		thumb.onpointermove = move;
		thumb.onpointerup = end;
	};
	thumb.onpointerdown = start;
}
{
	const buttonA = document.querySelectorAll('.button');
	const end = () => {
	};
	const start = (event) => {
		event.currentTarget.setPointerCapture(event.pointerId);
	};
	buttonA.onmousedown = () => console.log(222);
	buttonA.onmouseup = () => console.log(223);
}

