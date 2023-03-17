const TO_RADIANS = Math.PI/180;

enum States {
	None,
	Ready,
	Crop,
	Rotate
}

class Editor {
	canvas				: JQuery<HTMLCanvasElement>;
	context				: CanvasRenderingContext2D;
	image				: JQuery<HTMLImageElement>;

	btn_container		: JQuery;
	btn_rotate			: JQuery;
	btn_crop			: JQuery;
	btn_ok				: JQuery;

	state				: number;
	scale				: number;
	wh					: number;
	width				: number;
	height				: number;
	angle				: number;
	mouse_angle_from	: number;
	mouse_angle			: number;
	mouse_x				: number;
	mouse_y				: number;

	crop				: [number, number, number, number];

	polygon				:JQuery;

	constructor() {
		this.state		= States.None;
		this.canvas		= $('canvas#test');
		this.context 	= this.canvas[0].getContext('2d');
		this.angle		= 0;
		this.image		= $('<img/>', {});

		/* Elements */
		this.btn_container 	= $('<div/>', { class: 'container' });
		this.btn_rotate = $('<div/>', { class: 'btn' }).text('Повернуть');
		this.btn_crop 	= $('<div/>', { class: 'btn' }).text('Обрезать');
		this.btn_ok 	= $('<div/>', { class: 'btn btn_use' }).text('ОК');

		/* Building DOM */
		$('body').prepend(
			this.btn_container.append(
				this.btn_rotate,
				this.btn_crop,
				this.btn_ok
			)
		);

		this.image[0].onload = () => {
			this.width = this.image[0].width;
			this.height = this.image[0].height;

			console.log('Loaded image box: ', this.width, this.height);
			this.wh = Math.sqrt(this.width * this.width + this.height * this.height);

			this.crop = [
				(this.wh - this.width) / 2, (this.wh - this.height) / 2,
				(this.wh + this.width) / 2, (this.wh + this.height) / 2
			];

			this.Scale(0.25);
			this.state = States.Ready;
		}

		this.btn_rotate.on('click', () => { if (this.state == States.None) return; this.state = States.Rotate; this.UseBtn(); });
		this.btn_crop.on('click', () => { if (this.state == States.None) return; this.state = States.Crop; this.UseBtn(); });
		this.btn_ok.on('click', () => { if (this.state == States.None) return; this.state = States.Ready; this.UseBtn(); });

		this.canvas.on('wheel', (e) => {
			if (this.state != States.Ready) return;
			(e.originalEvent as WheelEvent).deltaY < 0 ? this.Scale(this.scale * 1.1) : this.Scale( this.scale / 1.1);
		});

		this.canvas.on('mousedown', (e) => {
			if (this.state == States.Rotate)
			{
				this.mouse_angle_from = this.angle;
				this.mouse_x = e.pageX - this.canvas[0].offsetLeft;
				this.mouse_y = e.pageY - this.canvas[0].offsetTop;
				this.canvas.on('mousemove.editor', this.Move.bind(this));

				this.canvas.on('mouseup.editor', () => {
					this.canvas.off('mousemove.editor');
					this.canvas.off('mouseup.editor');
				});
			}
		});

		$(document).on('keyup', (e) => { if (this.state != States.Ready) return; if (e.key == "Escape") this.Rotate(0); });

		this.image[0].src = 'css/pic/2.jpg';


		this.polygon = $('<div/>', { class: 'crop' });
		this.polygon.css({ 'width': this.wh, 'height': this.wh});
		// this.DrawPolygon();

		$('.canvas').append(this.polygon);
	}

	public Scale(scale: number)
	{
		this.scale = scale;

		this.canvas[0].width = this.wh * this.scale;
		this.canvas[0].height = this.wh * this.scale;

		this.polygon.css({ 'width': this.wh * this.scale, 'height': this.wh * this.scale });
		this.context.scale(this.scale, this.scale);

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
		this.context.drawImage(this.image[0], - this.width / 2, - this.height / 2);
		this.context.restore();

		this.DrawPolygon();
	}

	private Move(e)
	{
		let Ax = this.canvas[0].width / 2 - this.mouse_x;
		let Ay = this.canvas[0].height / 2 - this.mouse_y;
		let Bx = this.canvas[0].width / 2 - (e.pageX - this.canvas[0].offsetLeft);
		let By = this.canvas[0].height / 2 - (e.pageY - this.canvas[0].offsetTop);

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

	private DrawPolygon() {

		let pol = [];
		const push = (x: string|number, y: string|number) => { pol.push(`${x} ${y}`); };
		push(0,0);
		push(0,'100%');
		push(Math.round(this.scale * this.crop[0]) + 'px','100%');
		push(Math.round(this.scale * this.crop[0]) + 'px', Math.round(this.scale * this.crop[1]) + 'px');
		push(Math.round(this.scale * this.crop[2]) + 'px', Math.round(this.scale * this.crop[1]) + 'px');
		push(Math.round(this.scale * this.crop[2]) + 'px', Math.round(this.scale * this.crop[3]) + 'px');
		push(Math.round(this.scale * this.crop[0]) + 'px', Math.round(this.scale * this.crop[3]) + 'px');
		push(Math.round(this.scale * this.crop[0]) + 'px','100%');
		push('100%','100%');
		push('100%','0');
		this.polygon.css({ 'clip-path' : `polygon(${pol.join(',')})` });

		// this.polygon.css({ 'clip-path' : 'polygon(0 0, 0 100%, 20% 100%, 20% 20%, 80% 20%, 80% 80%, 20% 80%, 20% 100%, 100% 100%, 100% 0)' });
	}

 	private UseBtn() {
		this.btn_container.children('.btn').removeClass('btn_use');
		switch (this.state) {
			case States.Rotate: this.btn_rotate.addClass('btn_use'); break;
			case States.Crop: this.btn_crop.addClass('btn_use'); break;
			case States.Ready: this.btn_ok.addClass('btn_use'); break;
		}
	}

}







