import MouseMoveEvent = JQuery.MouseMoveEvent;

const TO_RADIANS = Math.PI/180;

enum States {
	None,
	Ready,
	Crop,
	Rotate,
	Blur
}

class Editor {
	canvas						: JQuery<HTMLCanvasElement>;
	context						: CanvasRenderingContext2D;
	image						: JQuery<HTMLImageElement>;

	canvas_container			: JQuery;
	btn_container				: JQuery;
	btn_rotate					: JQuery;
	btn_crop					: JQuery;
	btn_blur					: JQuery;
	btn_scale					: JQuery;
	btn_reset					: JQuery;

	state						: number;
	scale						: number;
	wh							: number;
	width						: number;
	height						: number;
	carry_x						: number;
	carry_y						: number;
	angle						: number;
	mouse_angle_from			: number;
	mouse_angle					: number;
	rotate_x					: number;
	rotate_y					: number;

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
		this.carry_x			= 0;
		this.carry_y			= 0;
		// this.scale_x			= 0;
		// this.scale_y			= 0;
		this.image				= $('<img/>', {});

		/* Elements */
		this.btn_container 		= $('<div/>', { class: 'container' });
		this.btn_rotate 		= $('<div/>', { class: 'btn' }).text('Повернуть');
		this.btn_crop 			= $('<div/>', { class: 'btn' }).text('Обрезать');
		this.btn_blur 			= $('<div/>', { class: 'btn' }).text('Замазать');
		this.btn_scale 			= $('<div/>', { class: 'btn btn_use' }).text('Масштаб');
		this.btn_reset 			= $('<div/>', { class: 'btn' }).text('Сбросить ЭТО').css({ 'background-color' : '#4CAF50' });

		this.canvas_container	= $('div.canvas');
		this.crop_background 	= $('<div/>', { class: 'crop_background' }).appendTo(this.canvas_container);
		// this.crop_background.css({ 'width': this.wh, 'height': this.wh});

		this.crop_container 	= $('<div/>', { class: 'crop_container' }).appendTo(this.canvas_container);
		this.crop_boxes = {
			top 		: $('<div/>', { class: 'top' }).appendTo(this.crop_container),
			right 		: $('<div/>', { class: 'right' }).appendTo(this.crop_container),
			bottom 		: $('<div/>', { class: 'bottom' }).appendTo(this.crop_container),
			left 		: $('<div/>', { class: 'left' }).appendTo(this.crop_container),
			top_left 	: $('<div/>', { class: 'angle_nw' }).appendTo(this.crop_container),
			top_right 	: $('<div/>', { class: 'angle_ne' }).appendTo(this.crop_container),
			bot_right 	: $('<div/>', { class: 'angle_nw' }).appendTo(this.crop_container),
			bot_left 	: $('<div/>', { class: 'angle_ne' }).appendTo(this.crop_container),
		}

		/* Building DOM */
		$('body').prepend(
			this.btn_container.append(
				this.btn_rotate,
				this.btn_crop,
				this.btn_blur,
				this.btn_scale,
				this.btn_reset
			)
		);

		this.image[0].onload = () => {
			this.width = this.image[0].width;
			this.height = this.image[0].height;

			this.wh = Math.sqrt(this.width * this.width + this.height * this.height);

			this.crop = [
				(this.wh - this.width) / 2, (this.wh - this.height) / 2,
				(this.wh + this.width) / 2, (this.wh + this.height) / 2
			];

			this.Scale(0.25, this.wh/2, this.wh/2, this.canvas_container.width()/2, this.canvas_container.height()/2);
			this.state = States.Ready;
		}

		this.btn_rotate.on('click', () => { if (this.state == States.None) return; this.state = States.Rotate; this.UseBtn(); });
		this.btn_crop.on('click', () => { if (this.state == States.None) return; this.state = States.Crop; this.UseBtn(); });
		this.btn_blur.on('click', () => { if (this.state == States.None) return; this.state = States.Blur; this.UseBtn(); });
		this.btn_scale.on('click', () => { if (this.state == States.None) return; this.state = States.Ready; this.UseBtn(); });


		this.btn_reset.on('click', () => { if (this.state != States.Ready) return; else {this.Scale(0.25, this.wh/2, this.wh/2, this.canvas_container.width()/2, this.canvas_container.height()/2); this.carry_x = 0; this.carry_y = 0; this.Draw();} });
		this.btn_reset.on('click', () => { if (this.state != States.Rotate) return; else {this.Rotate(0);} });
		this.btn_reset.on('click', () => {
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
		// $(document).on('keyup', (e) => { if (this.state != States.Ready) return; if (e.key == "Escape") { this.Scale(0.25); this.x = 0; this.y = 0; this.Draw(); } });
		// $(document).on('keyup', (e) => { if (this.state != States.Rotate) return; if (e.key == "Escape") this.Rotate(0); });
		// $(document).on('keyup', (e) => {
		// 		if (this.state != States.Crop) return; if (e.key == "Escape") {
		//
		// 			this.crop = [
		// 				(this.wh - this.width) / 2, (this.wh - this.height) / 2,
		// 				(this.wh + this.width) / 2, (this.wh + this.height) / 2
		// 			]; }
		//
		// 		this.DrawPolygon();
		// 	}
		// );

		this.image[0].src = 'css/pic/2.jpg';

		this.canvas_container.on('wheel', (e) => {
			if (this.state != States.Ready) return;

			console.log('container', this.canvas_container.width(), this.canvas_container.height(), this.canvas_container.offset(), this.canvas_container.scrollLeft(), this.canvas_container.scrollTop());
			console.log('canvas', this.canvas.width(), this.canvas.height(), this.canvas.offset(), this.canvas.scrollLeft(), this.canvas.scrollTop());
			console.log((e.originalEvent as WheelEvent).pageX, (e.originalEvent as WheelEvent).pageY);

			// let scrollLeft = 0;
			// scrollLeft += this.scale;
			// this.scale_x = e.offsetX + scrollLeft;
			// this.canvas_container.scrollLeft(this.scale_x - e.offsetX);

			const oe = (e.originalEvent as WheelEvent);

			const dx = oe.pageX - this.canvas_container.offset().left;
			const dy = oe.pageY - this.canvas_container.offset().top;
			const px = (dx + this.canvas_container.scrollLeft()) / this.scale;
			const py = (dy + this.canvas_container.scrollTop()) / this.scale;
			oe.deltaY < 0 ? this.Scale(this.scale * 1.1, px, py, dx, dy) : this.Scale( this.scale / 1.1, px, py, dx, dy);
			return false;
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
				console.log(e.offsetX, e.offsetY);
				this.Blur(e.offsetX, e.offsetY);
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

		this.crop_boxes.top.on('mousedown', e => { return CropMove(null, 1, e, {top: 0, bottom: this.crop[3]}); });
		this.crop_boxes.bottom.on('mousedown', e => { return CropMove(null, 3, e, {top: this.crop[1], bottom: this.wh}); });
		this.crop_boxes.left.on('mousedown', e => { return CropMove(0, null, e, {left: 0, right: this.crop[2]}); });
		this.crop_boxes.right.on('mousedown', e => { return CropMove(2, null, e, {left: this.crop[0], right: this.wh}); });
		this.crop_boxes.top_left.on('mousedown', e => { return CropMove(0, 1, e, {left: 0, right: this.crop[2], top: 0, bottom: this.crop[3]}); });
		this.crop_boxes.top_right.on('mousedown', e => { return CropMove(2, 1, e, {left: this.crop[0], right: this.wh, top: 0, bottom: this.crop[3]}); });
		this.crop_boxes.bot_left.on('mousedown', e => { return CropMove(0, 3, e, {left: 0, right: this.crop[2], top: this.crop[1], bottom: this.wh}); });
		this.crop_boxes.bot_right.on('mousedown', e => { return CropMove(2, 3, e, {left: this.crop[0], right: this.wh, top: this.crop[1], bottom: this.wh}); });
	}

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
		this.context.translate(this.wh / 2 + this.carry_x, this.wh / 2 + this.carry_y);
		this.context.rotate(this.angle * TO_RADIANS);
		this.context.drawImage(this.image[0], - this.width / 2, - this.height / 2);
		this.context.restore();

		this.DrawPolygon();
	}

	private Move(e)
	{
		let Ax = (this.wh / 2 + this.carry_x) * this.scale - this.rotate_x;
		let Ay = (this.wh / 2 + this.carry_y) * this.scale - this.rotate_y;
		let Bx = (this.wh / 2 + this.carry_x) * this.scale - (e.pageX - this.canvas[0].offsetLeft);
		let By = (this.wh / 2 + this.carry_y) * this.scale - (e.pageY - this.canvas[0].offsetTop);

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

		const whs = Math.round(this.scale * this.wh);
		const left = Math.round(this.scale * this.crop[0]);
		const right = Math.round(this.scale * this.crop[2]);
		const top = Math.round(this.scale * this.crop[1]);
		const bottom = Math.round(this.scale * this.crop[3]);
		const space = 4;

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

	private Blur(x, y) {
		// this.image.css({'filter': 'blur(5px)'})

		let imageData = this.context.getImageData(x, y, 50, 50);
		// let red, green, blue, gray;

		for (let i = 0; i < imageData.data.length; i += 4) {
			// red = imageData.data[i];
			// green = imageData.data[i + 1];
			// blue = imageData.data[i + 2];
			// gray = red * 0.3 + green * 0.59 + blue * 0.11;
			imageData.data[i] = 255;
			imageData.data[i + 1] = 200;
			imageData.data[i + 2] = 146;
		}

		this.context.putImageData(imageData, x - 25, y - 25);
	}

 	private UseBtn() {
		this.crop_container.removeClass('act');
		this.btn_container.children('.btn').removeClass('btn_use');
		switch (this.state) {
			case States.Rotate: this.btn_rotate.addClass('btn_use'); break;
			case States.Crop: { this.btn_crop.addClass('btn_use'); this.crop_container.addClass('act'); } break;
			case States.Blur: this.btn_blur.addClass('btn_use'); break;
			case States.Ready: this.btn_scale.addClass('btn_use'); break;
		}
	}

}







