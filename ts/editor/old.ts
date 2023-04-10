// public Move(e)
// {
	// let Ax = this.wh / 2 * this.scale - this.rotate_x;
	// let Ay = this.wh / 2 * this.scale - this.rotate_y;
	// let Bx = this.wh / 2 * this.scale - (e.pageX - this.canvas[0].offsetLeft);
	// let By = this.wh / 2 * this.scale - (e.pageY - this.canvas[0].offsetTop);
	//
	// let a = Math.sqrt( Ax * Ax + Ay * Ay );
	// let b = Math.sqrt( Bx * Bx + By * By );
	//
	// let one = Ax * Bx + Ay * By;
	// let two = a * b;
	// let three = Ax * By - Ay * Bx;
	//
	// let cos = one / two;
	// this.mouse_angle = three > 0 ? Math.acos(cos) : -Math.acos(cos);
	// let angle = this.angle + e.pageX - this.mouse_x;
	// this.Rotate(this.mouse_angle_from + this.mouse_angle/TO_RADIANS);
// }

// private Search(x: number, y: number, angle: number): [number, number] {
// 	const ca = Math.cos(angle);
// 	const sa = Math.sin(angle);
//
// 	return [x * ca - y * sa, x * sa + y * ca];
// }

// const A = this.Search(this.image.width / 2, this.image.height / 2, angle * TO_RADIANS);
// const B = this.Search(- this.image.width / 2, this.image.height / 2, angle * TO_RADIANS);
//
// console.log(A, B, this.image.width, this.image.height);
//
// const new_w = Math.max(Math.abs(A[0]), Math.abs(B[0]));
// const new_h = Math.max(Math.abs(A[1]), Math.abs(B[1]));
//
// this.canvas.width = 2 * new_w;
// this.canvas.height = 2 * new_h;

// this.canvas_container.on('mousedown', (e) => {
// if (this.state == States.Rotate)
// {
// 	this.mouse_angle_from = this.angle;
// 	this.rotate_x = e.pageX - this.canvas[0].offsetLeft;
// 	this.rotate_y = e.pageY - this.canvas[0].offsetTop;
// 	this.canvas_container.on('mousemove.editor', this.Move.bind(this));
//
// 	this.canvas_container.on('mouseup.editor', () => {
// 		this.canvas_container.off('mousemove.editor');
// 		this.canvas_container.off('mouseup.editor');
// 	});
// }

// if (this.state == States.Ready && e.ctrlKey)
// {
// 	const _top = this.canvas_container.scrollTop();
// 	const _left = this.canvas_container.scrollLeft();
//
// 	const _x = e.pageX;
// 	const _y = e.pageY;
// 	this.canvas_container.on('mousemove.editor', (e) => {
// 		this.canvas_container.scrollLeft(_left - (e.pageX - _x));
// 		this.canvas_container.scrollTop(_top - (e.pageY - _y));
// 	});
//
// 	this.canvas_container.on('mouseup.editor', () => {
// 		this.canvas_container.off('mousemove.editor');
// 		this.canvas_container.off('mouseup.editor');
// 	});
// }

// if (this.state == States.Blur)
// {
// 	this.canvas_container.on('mousemove.editor', (e) => {
// 		const mX = (e.pageX - this.canvas_container[0].offsetLeft + this.canvas_container.scrollLeft() - this.canvas[0].width/2) / this.scale;
// 		const mY = (e.pageY - this.canvas_container[0].offsetTop + this.canvas_container.scrollTop() - this.canvas[0].height/2) / this.scale;
// 		const rX =  (mX * Math.cos(-this.angle * TO_RADIANS) - mY * Math.sin(-this.angle * TO_RADIANS) + this.width/2);
// 		const rY =  (mX * Math.sin(-this.angle * TO_RADIANS) + mY * Math.cos(-this.angle * TO_RADIANS) + this.height/2);
//
// 		if (e.ctrlKey) this.UnBlur(rX, rY, this.blur_size);
// 		else this.Blur(rX, rY, this.blur_size);
//
// 		this.setNeedUpdateBright();
// 	});
//
// 	this.canvas_container.on('mouseup.editor', () => {
// 		this.canvas_container.off('mousemove.editor');
// 		this.canvas_container.off('mouseup.editor');
// 	});
// }

// if (this.state == States.Crop)
// {
// 	const _crop_l = this.crop[0];
// 	const _crop_t = this.crop[1];
// 	const _crop_r = this.crop[2];
// 	const _crop_b = this.crop[3];
//
// 	const _x = e.pageX;
// 	const _y = e.pageY;
// 	this.canvas_container.on('mousemove.editor', (e) => {
// 		this.crop[0] = _crop_l + (e.pageX - _x) / this.scale;
// 		this.crop[1] = _crop_t + (e.pageY - _y) / this.scale;
// 		this.crop[2] = _crop_r + (e.pageX - _x) / this.scale;
// 		this.crop[3] = _crop_b + (e.pageY - _y) / this.scale;
// 		this.setNeedCropUpdate();
// 	});
//
// 	this.canvas_container.on('mouseup.editor', () => {
// 		this.canvas_container.off('mousemove.editor');
// 		this.canvas_container.off('mouseup.editor');
// 	});
// }

// if (this.state == States.Bright)
// {
// 	this.ChangeBright(this.buffer, 25);
//
// 	// this.canvas_container.on('mousemove.editor', (e) => {
// 	//
// 	// });
// 	//
// 	// this.canvas_container.on('mouseup.editor', () => {
// 	// 	this.canvas_container.off('mousemove.editor');
// 	// 	this.canvas_container.off('mouseup.editor');
// 	// });
// 	this.Draw();
// }
// });

//
// this.touch.on('mousedown', (e) => {
// 	if (this.state == States.Bright)
// 	{
// 		let left = this.left;
// 		let e_x = e.pageX;
// 		$(document).on('mousemove.editor', (e) => {
// 			let percent = e.pageX - e_x;
// 			left = this.left + percent;
//
// 			this.touch.css({ 'left': left });
// 			const br = (510.0/300.0) * (left + 8) - 255;
// 			this.Bright(br);
// 		});
//
// 		$(document).on('mouseup.editor', () => {
// 			this.left = left;
//
// 			$(document).off('mousemove.editor');
// 			$(document).off('mouseup.editor');
// 		});
// 	}
// })