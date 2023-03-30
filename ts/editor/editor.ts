import MouseMoveEvent = JQuery.MouseMoveEvent;

const TO_RADIANS = Math.PI/180;

enum States {
	None,
	Ready,
	Crop,
	Rotate,
	Blur,
	Bright
}

class Editor {
	canvas						: JQuery<HTMLCanvasElement>;
	context						: CanvasRenderingContext2D;
	orig						: HTMLCanvasElement;
	orig_ctx					: CanvasRenderingContext2D;
	image						: HTMLCanvasElement;
	image_ctx					: CanvasRenderingContext2D;
	buffer						: ImageData;

	canvas_container			: JQuery;
	top_container				: JQuery;
	btn_container				: JQuery;
	btn_rotate					: JQuery;
	btn_crop					: JQuery;
	btn_blur					: JQuery;
	btn_bright					: JQuery;
	btn_scale					: JQuery;
	btn_reset					: JQuery;
	toolbar						: JQuery;
	tool_rotate					: JQuery;
	tool_blur					: JQuery;
	brush1						: JQuery;
	brush2						: JQuery;
	brush3						: JQuery;
	brush4						: JQuery;
	tool_bright					: JQuery;
	touch						: JQuery;

	state						: number;
	scale						: number;
	wh							: number;
	width						: number;
	height						: number;
	angle						: number;
	mouse_angle_from			: number;
	mouse_angle					: number;
	rotate_x					: number;
	rotate_y					: number;
	left						: number;
	bright_percent				: number;

	crop						: [number, number, number, number];

	crop_background				: JQuery;
	crop_container				: JQuery;
	crop_boxes					: {
		top						: JQuery;
		right					: JQuery;
		bottom					: JQuery;
		left					: JQuery;
		top_left				: JQuery;
		top_right				: JQuery;
		bot_right				: JQuery;
		bot_left				: JQuery;
	}

	constructor() {
		this.state				= States.None;
		this.canvas				= $('canvas#test');
		this.context 			= this.canvas[0].getContext('2d');
		this.angle				= 0;
		// this.scale_x			= 0;
		// this.scale_y			= 0;
		this.orig				= document.createElement("canvas");
		this.orig_ctx			= this.orig.getContext('2d');
		this.image				= document.createElement("canvas");
		this.image_ctx			= this.image.getContext('2d');

		/* Elements */
		this.top_container 		= $('<div/>', { class: 'top_container' });
		this.btn_container 		= $('<div/>', { class: 'btn_container' });
		this.btn_rotate 		= $('<div/>', { class: 'btn rotate' }).attr('title', 'Поворот');
		this.btn_crop 			= $('<div/>', { class: 'btn crop' }).attr('title', 'Обрезка');
		this.btn_blur 			= $('<div/>', { class: 'btn blur' }).attr('title', 'Размытие');
		this.btn_bright 		= $('<div/>', { class: 'btn bright' }).attr('title', 'Яркость');
		this.btn_scale 			= $('<div/>', { class: 'btn scale btn_use' }).attr('title', 'Масштаб');

		this.btn_reset 			= $('<div/>', { class: 'reset' }).text('Сбросить');
		this.toolbar 			= $('<div/>', { class: 'toolbar' }).addClass('hide');
		this.tool_rotate 		= $('<div/>', { class: 'tool_rotate' }).addClass('hide');
		this.tool_blur	 		= $('<div/>', { class: 'tool_blur' }).addClass('hide');
		this.brush1 			= $('<div/>', { class: 'brush1' });
		this.brush2 			= $('<div/>', { class: 'brush2' });
		this.brush3 			= $('<div/>', { class: 'brush3' });
		this.brush4 			= $('<div/>', { class: 'brush4' });
		this.tool_bright 		= $('<div/>', { class: 'tool_bright' }).addClass('hide');
		this.touch 				= $('<div/>', { class: 'touch' });

		this.canvas_container	= $('div.canvas');
		this.crop_background 	= $('<div/>', { class: 'crop_background' }).appendTo(this.canvas_container);

		this.crop_container 	= $('<div/>', { class: 'crop_container' }).appendTo(this.canvas_container);
		this.crop_boxes 		= {
			top 				: $('<div/>', { class: 'top' }).appendTo(this.crop_container),
			right 				: $('<div/>', { class: 'right' }).appendTo(this.crop_container),
			bottom 				: $('<div/>', { class: 'bottom' }).appendTo(this.crop_container),
			left 				: $('<div/>', { class: 'left' }).appendTo(this.crop_container),
			top_left 			: $('<div/>', { class: 'angle_nw' }).appendTo(this.crop_container),
			top_right 			: $('<div/>', { class: 'angle_ne' }).appendTo(this.crop_container),
			bot_right 			: $('<div/>', { class: 'angle_nw' }).appendTo(this.crop_container),
			bot_left 			: $('<div/>', { class: 'angle_ne' }).appendTo(this.crop_container),
		}

		/* Building DOM */
		$('body').prepend(
			this.top_container.append(
				this.btn_container.append(
					this.btn_rotate,
					this.btn_crop,
					this.btn_blur,
					this.btn_bright,
					this.btn_scale,
				),
				this.toolbar.append(
					this.tool_rotate,
					this.tool_blur.append(
						this.brush1,
						this.brush2,
						this.brush3,
						this.brush4
					),
					this.tool_bright. append(
						this.touch
					),
					this.btn_reset
				)
			)
		);


		/* Onload image */
		const img = document.createElement('img');
		img.crossOrigin = "Anonymous";
		img.onload = () => {
			this.width = img.width;
			this.height = img.height;

			this.orig.width = this.width;
			this.orig.height = this.height;
			this.orig_ctx.drawImage(img, 0, 0);

			this.image.width = this.width;
			this.image.height = this.height;
			this.image_ctx.drawImage(img, 0, 0);

			this.wh = Math.sqrt(this.width * this.width + this.height * this.height);

			this.crop = [
				(this.wh - this.width) / 2, (this.wh - this.height) / 2,
				(this.wh + this.width) / 2, (this.wh + this.height) / 2
			];

			this.Scale(0.25, this.wh/2, this.wh/2, this.canvas_container.width()/2, this.canvas_container.height()/2);
			this.state = States.Ready;
		}
		img.src = 'https://tests.local/Editor/2.jpg';


		/* Events */
		this.btn_rotate.on(	'click', () => { if (this.state == States.None) return; this.state = States.Rotate; this.UseBtn(); this.ChangeToolbar(); });
		this.btn_crop.on(	'click', () => { if (this.state == States.None) return; this.state = States.Crop; this.UseBtn(); this.ChangeToolbar(); });
		this.btn_blur.on(	'click', () => { if (this.state == States.None) return; this.state = States.Blur; this.UseBtn(); this.ChangeToolbar(); this.buffer = this.image_ctx.getImageData(0, 0, this.width, this.height); });
		this.btn_bright.on(	'click', () => { if (this.state == States.None) return; this.state = States.Bright; this.UseBtn(); this.ChangeToolbar(); this.buffer = this.image_ctx.getImageData(0, 0, this.width, this.height); });
		this.btn_scale.on(	'click', () => { if (this.state == States.None) return; this.state = States.Ready; this.UseBtn(); this.ChangeToolbar(); });

		this.btn_reset.on(	'click', () => { if (this.state != States.Ready) return; else { this.Scale(0.25, this.wh/2, this.wh/2, this.canvas_container.width()/2, this.canvas_container.height()/2); this.Draw(); } });
		this.btn_reset.on(	'click', () => { if (this.state != States.Rotate) return; else { this.Rotate(0); } });
		this.btn_reset.on(	'click', () => { if (this.state != States.Bright) return; else { this.ChangeBright(this.orig_ctx.getImageData(0, 0, this.width, this.height), 0); this.Draw(); this.touch.css({ 'left': 142 }); } });
		this.btn_reset.on(	'click', () => {
				if (this.state != States.Crop) return;
				else
				{
					this.crop = [
						(this.wh - this.width) / 2, (this.wh - this.height) / 2,
						(this.wh + this.width) / 2, (this.wh + this.height) / 2
					];

				this.DrawPolygon();
				}
			}
		);

		this.touch.on('mousedown', (e) => {
			if (this.state == States.Bright)
			{
				if (!this.bright_percent) this.bright_percent = 0;
				if (!this.left) this.left = 142;

				let left = 0;
				let b_percent = 0;
				let e_x = e.pageX;
				console.log(e.pageX);
				$(document).on('mousemove.editor', (e) => {
					let percent = e.pageX - e_x;
					console.log(e.pageX, e_x, percent);

					left = this.left + percent;
					b_percent = this.bright_percent + percent * 100 / 150;

					this.touch.css({ 'left': left });
					this.ChangeBright(this.buffer, b_percent);
					this.Draw();
				});

				$(document).on('mouseup.editor', () => {
					this.left = left;
					this.bright_percent = b_percent;
					$(document).off('mousemove.editor');
					$(document).off('mouseup.editor');
				});
			}
		})

		this.canvas_container.on('wheel', (e) => {
			// if (this.state != States.Ready) return;
			if (e.ctrlKey) {
				const oe = (e.originalEvent as WheelEvent);

				const dx = oe.pageX - this.canvas_container.offset().left;
				const dy = oe.pageY - this.canvas_container.offset().top;
				const px = (dx + this.canvas_container.scrollLeft()) / this.scale;
				const py = (dy + this.canvas_container.scrollTop()) / this.scale;
				oe.deltaY < 0 ? this.Scale(this.scale * 1.1, px, py, dx, dy) : this.Scale( this.scale / 1.1, px, py, dx, dy);
				return false;
			}
			else return;
		});

		this.canvas_container.on('mousedown', (e) => {
			if (this.state == States.Rotate)
			{
				this.mouse_angle_from = this.angle;
				this.rotate_x = e.pageX - this.canvas[0].offsetLeft;
				this.rotate_y = e.pageY - this.canvas[0].offsetTop;
				this.canvas_container.on('mousemove.editor', this.Move.bind(this));

				this.canvas_container.on('mouseup.editor', () => {
					this.canvas_container.off('mousemove.editor');
					this.canvas_container.off('mouseup.editor');
				});
			}

			if (this.state == States.Ready)
			{
				const _top = this.canvas_container.scrollTop();
				const _left = this.canvas_container.scrollLeft();

				const _x = e.pageX;
				const _y = e.pageY;
				this.canvas_container.on('mousemove.editor', (e) => {
					this.canvas_container.scrollLeft(_left - (e.pageX - _x));
					this.canvas_container.scrollTop(_top - (e.pageY - _y));
				});

				this.canvas_container.on('mouseup.editor', () => {
					this.canvas_container.off('mousemove.editor');
					this.canvas_container.off('mouseup.editor');
				});
			}

			if (this.state == States.Blur)
			{
				this.canvas_container.on('mousemove.editor', (e) => {
					const mX = (e.pageX - this.canvas_container[0].offsetLeft + this.canvas_container.scrollLeft() - this.canvas[0].width/2) / this.scale;
					const mY = (e.pageY - this.canvas_container[0].offsetTop + this.canvas_container.scrollTop() - this.canvas[0].height/2) / this.scale;
					const rX =  (mX * Math.cos(-this.angle * TO_RADIANS) - mY * Math.sin(-this.angle * TO_RADIANS) + this.width/2);
					const rY =  (mX * Math.sin(-this.angle * TO_RADIANS) + mY * Math.cos(-this.angle * TO_RADIANS) + this.height/2);

					if (e.ctrlKey) this.UnBlur(rX, rY, 50);
					else this.Blur(rX, rY, 50);

					this.Draw();
				});

				this.canvas_container.on('mouseup.editor', () => {
					this.canvas_container.off('mousemove.editor');
					this.canvas_container.off('mouseup.editor');
				});
			}

			if (this.state == States.Crop)
			{
				const _crop_l = this.crop[0];
				const _crop_t = this.crop[1];
				const _crop_r = this.crop[2];
				const _crop_b = this.crop[3];

				const _x = e.pageX;
				const _y = e.pageY;
				this.canvas_container.on('mousemove.editor', (e) => {
					this.crop[0] = _crop_l + (e.pageX - _x) / this.scale;
					this.crop[1] = _crop_t + (e.pageY - _y) / this.scale;
					this.crop[2] = _crop_r + (e.pageX - _x) / this.scale;
					this.crop[3] = _crop_b + (e.pageY - _y) / this.scale;
					this.DrawPolygon();
				});

				this.canvas_container.on('mouseup.editor', () => {
					this.canvas_container.off('mousemove.editor');
					this.canvas_container.off('mouseup.editor');
				});
			}

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
		});

		const CropMove = (a: number, b: number, e, box: {left ?: number, right ?: number, top ?: number, bottom ?: number}) => {
			if (this.state == States.Crop)
			{
				const _crop_x = this.crop[a ?? 0];
				const _crop_y = this.crop[b ?? 0];
				const _x = e.pageX;
				const _y = e.pageY;
				this.canvas_container.on('mousemove.editor', e => {
					if (a !== null)
					{
						this.crop[a] = _crop_x + Math.round((e.pageX - _x) / this.scale);
						if (box.left !== null && this.crop[a] < box.left) this.crop[a] = box.left;
						if (box.right  !== null && this.crop[a] > box.right) this.crop[a] = box.right;
					}
					if (b !== null)
					{
						this.crop[b] = _crop_y + Math.round((e.pageY - _y) / this.scale);
						if (box.top !== null && this.crop[b] < box.top) this.crop[b] = box.top;
						if (box.bottom  !== null && this.crop[b] > box.bottom) this.crop[b] = box.bottom;
					}
					this.DrawPolygon();
				});
				this.canvas_container.on('mouseup.editor', () => { this.canvas_container.off('mousemove.editor'); this.canvas_container.off('mouseup.editor'); });
			}
			return false;
		};

		this.crop_boxes.top.on(			'mousedown', e => { return CropMove(null, 1, e, {top: 0, bottom: this.crop[3]}); });
		this.crop_boxes.bottom.on(		'mousedown', e => { return CropMove(null, 3, e, {top: this.crop[1], bottom: this.wh}); });
		this.crop_boxes.left.on(		'mousedown', e => { return CropMove(0, null, e, {left: 0, right: this.crop[2]}); });
		this.crop_boxes.right.on(		'mousedown', e => { return CropMove(2, null, e, {left: this.crop[0], right: this.wh}); });
		this.crop_boxes.top_left.on(	'mousedown', e => { return CropMove(0, 1, e, {left: 0, right: this.crop[2], top: 0, bottom: this.crop[3]}); });
		this.crop_boxes.top_right.on(	'mousedown', e => { return CropMove(2, 1, e, {left: this.crop[0], right: this.wh, top: 0, bottom: this.crop[3]}); });
		this.crop_boxes.bot_left.on(	'mousedown', e => { return CropMove(0, 3, e, {left: 0, right: this.crop[2], top: this.crop[1], bottom: this.wh}); });
		this.crop_boxes.bot_right.on(	'mousedown', e => { return CropMove(2, 3, e, {left: this.crop[0], right: this.wh, top: this.crop[1], bottom: this.wh}); });
	}

	/* Methods */
	public Scale(scale: number, px: number, py: number, dx: number, dy: number)
	{
		let whs = Math.round(scale * this.wh);
		if (whs > 6000) return;
		if (whs < Math.max(this.canvas_container.width(), this.canvas_container.height())) return;
		this.scale = scale;

		this.canvas[0].width = whs;
		this.canvas[0].height = whs;

		this.crop_background.css({ 'width': whs, 'height': whs});
		this.crop_container.css({ 'width': whs, 'height': whs});
		this.context.scale(this.scale, this.scale);

		const scroll_x = px * this.scale - dx;
		const scroll_y = py * this.scale - dy;
		this.canvas_container.scrollLeft(scroll_x);
		this.canvas_container.scrollTop(scroll_y);
		// this.crop = [
		// 	Math.round(this.scale * (this.wh - this.width) / 2) + 'px', Math.round(this.scale * (this.wh - this.height) / 2) + 'px',
		// 	Math.round(this.scale * (this.wh + this.width) / 2) + 'px', Math.round(this.scale * (this.wh + this.height) / 2) + 'px'
		// ];

		this.Draw();
	}

	public Rotate(angle: number) { this.angle = angle; this.Draw(); }

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

	protected Draw()
	{
		this.context.clearRect(0, 0, this.wh, this.wh);

		this.context.save();
		this.context.translate(this.wh / 2, this.wh / 2);
		this.context.rotate(this.angle * TO_RADIANS);
		this.context.drawImage(this.image, - this.width / 2, - this.height / 2);
		this.context.restore();

		this.DrawPolygon();
	}

	private Move(e)
	{
		let Ax = this.wh / 2 * this.scale - this.rotate_x;
		let Ay = this.wh / 2 * this.scale - this.rotate_y;
		let Bx = this.wh / 2 * this.scale - (e.pageX - this.canvas[0].offsetLeft);
		let By = this.wh / 2 * this.scale - (e.pageY - this.canvas[0].offsetTop);

		let a = Math.sqrt( Ax * Ax + Ay * Ay );
		let b = Math.sqrt( Bx * Bx + By * By );

		let one = Ax * Bx + Ay * By;
		let two = a * b;
		let three = Ax * By - Ay * Bx;

		let cos = one / two;
		this.mouse_angle = three > 0 ? Math.acos(cos) : -Math.acos(cos);
		// let angle = this.angle + e.pageX - this.mouse_x;
		this.Rotate(this.mouse_angle_from + this.mouse_angle/TO_RADIANS);
	}

	// private Search(x: number, y: number, angle: number): [number, number] {
	// 	const ca = Math.cos(angle);
	// 	const sa = Math.sin(angle);
	//
	// 	return [x * ca - y * sa, x * sa + y * ca];
	// }

	private DrawPolygon()
	{
		let pol = [];

		const whs 		= Math.round(this.scale * this.wh);
		const left 		= Math.ceil(this.scale * this.crop[0]);
		const right 	= Math.floor(this.scale * this.crop[2]);
		const top 		= Math.ceil(this.scale * this.crop[1]);
		const bottom 	= Math.floor(this.scale * this.crop[3]);
		const space 	= 4;

		const push = (x: string|number, y: string|number) => { pol.push(`${x} ${y}`); };
		push(0,0);
		push(0,'100%');
		push(left + 'px','100%');
		push(left + 'px',  top + 'px');
		push(right + 'px', top + 'px');
		push(right + 'px', bottom + 'px');
		push(left + 'px',  bottom + 'px');
		push(left + 'px','100%');
		push('100%','100%');
		push('100%','0');
		this.crop_background.css({ 'clip-path' : `polygon(${pol.join(',')})` });

		this.crop_boxes.top.css(		{ 'top': (top - space) + 'px', 'left': (left + space) + 'px', 'right': (whs - right + space) + 'px'});
		this.crop_boxes.bottom.css(		{ 'top': (bottom - space) + 'px', 'left': (left + space) + 'px', 'right': (whs - right + space) + 'px'});
		this.crop_boxes.left.css(		{ 'top': (top + space) + 'px', 'left': (left - space) + 'px', 'bottom': (whs - bottom + space) + 'px'});
		this.crop_boxes.right.css(		{ 'top': (top + space) + 'px', 'right': (whs - right - space) + 'px', 'bottom': (whs - bottom + space) + 'px'});

		this.crop_boxes.top_left.css(	{ 'top': (top - space) + 'px', 'left': (left - space) + 'px'});
		this.crop_boxes.top_right.css(	{ 'top': (top - space) + 'px', 'right': (whs - right - space) + 'px'});
		this.crop_boxes.bot_left.css(	{ 'top': (bottom - space) + 'px', 'left': (left - space) + 'px'});
		this.crop_boxes.bot_right.css(	{ 'top': (bottom - space) + 'px', 'right': (whs - right - space) + 'px'});
	}

	private Blur(x, y, wh) {
		let imageData = this.image_ctx.getImageData(x - wh / 2, y - wh / 2, wh, wh);

		Functions.blur(imageData, wh, wh, 2);

		this.image_ctx.putImageData(imageData, x - wh / 2, y - wh / 2);
	}

	private UnBlur(x, y, wh) {
		let imageData = this.orig_ctx.getImageData(x - wh / 2, y - 25, wh, wh);
		this.image_ctx.putImageData(imageData, x - wh / 2, y - wh / 2);
	}

	private ChangeBright(img: ImageData, percent: number) {

		const imageData = this.image_ctx.getImageData(0, 0, this.width, this.height);

		for (let i = 0; i < img.data.length; i += 4) {
			const red = img.data[i];
			const green = img.data[i + 1];
			const blue = img.data[i + 2];

			let HSL = this.RGBtoHSB(red, green, blue);

			let newBrightness = HSL[2] + HSL[2] * (percent / 100)
			let RGB = this.HSBtoRGB(HSL[0], HSL[1], newBrightness, red, green, blue)

			imageData.data[i] = RGB[0];
			imageData.data[i + 1] = RGB[1];
			imageData.data[i + 2] = RGB[2];
		}

		this.image_ctx.putImageData(imageData, 0, 0);
	}

	private RGBtoHSB(r, g, b) {
		let max = Math.max(r, g, b)
		let	min = Math.min(r, g, b);

		let h, s, l = (max + min) / 2;

		if (max == min) {
			h = s = 0; // achromatic
		}
		else {
			let d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return [h, s, l];
	}

	private HSBtoRGB(h, s, l, r, g, b) {
		if(s == 0) {
			r = g = b = l; // achromatic
		}

		else {
			function hue2rgb(p, q, t) {
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			let p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		return [r, g, b];
	}

 	private UseBtn() {
		this.crop_container.removeClass('act');
		this.btn_container.children('.btn').removeClass('btn_use');
		switch (this.state) {
			case States.Rotate: this.btn_rotate.addClass('btn_use'); break;
			case States.Crop: { this.btn_crop.addClass('btn_use'); this.crop_container.addClass('act'); } break;
			case States.Blur: this.btn_blur.addClass('btn_use'); break;
			case States.Bright: this.btn_bright.addClass('btn_use'); break;
			case States.Ready: this.btn_scale.addClass('btn_use'); break;
		}
	}

	private ChangeToolbar() {
		this.toolbar.addClass('hide');
		this.tool_rotate.addClass('hide');
		this.tool_blur.addClass('hide');
		this.tool_bright.addClass('hide');

		switch (this.state) {
			case States.Rotate:	this.toolbar.removeClass('hide'); this.tool_rotate.removeClass('hide'); break;
			case States.Crop:	this.toolbar.removeClass('hide'); break;
			case States.Blur:	this.toolbar.removeClass('hide'); this.tool_blur.removeClass('hide'); break;
			case States.Bright:	this.toolbar.removeClass('hide'); this.tool_bright.removeClass('hide'); break;
			case States.Ready:	this.toolbar.addClass('hide'); break;
		}
	}

}







