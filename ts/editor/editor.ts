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

	container			: JQuery;
	btn_rotate			: JQuery;
	btn_crop			: JQuery;

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

	constructor() {
		this.state		= States.None;
		this.canvas		= $('canvas#test');
		this.context 	= this.canvas[0].getContext('2d');
		this.angle		= 0;
		this.image		= $('<img/>', {});

		/* Elements */
		this.container 	= $('<div/>', { class: 'container' });
		this.btn_rotate = $('<div/>', { class: 'btn' }).text('Повернуть');
		this.btn_crop 	= $('<div/>', { class: 'btn' }).text('Обрезать');

		/* Building DOM */
		$('body').prepend(
			this.container.append(
				this.btn_rotate,
				this.btn_crop
			)
		);

		this.image[0].onload = () => {
			this.width = this.image[0].width;
			this.height = this.image[0].height;
			this.wh = Math.sqrt(this.width * this.width + this.height * this.height);

			// this.scale = 0.25;
			// this.canvas.width(this.wh * this.scale);
			// this.canvas.height(this.wh * this.scale);
			// this.context.scale(this.scale, this.scale);
			// this.context.drawImage(this.image[0], (this.wh - this.image.width()) / 2, (this.wh - this.image.height()) / 2);

			this.Scale(0.25);

			this.state = States.Ready;

			this.btn_rotate.on('click', () => { this.state = States.Rotate; })
			this.btn_crop.on('click', () => { this.state = States.Crop; })

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
		}

		$(document).on('keyup', (e) => { if (e.key == "Escape") this.Rotate(0); });

		this.image[0].src = 'css/pic/2.jpg';
	}

	public Scale(scale: number)
	{
		this.scale = scale;

		this.canvas[0].width = this.wh * this.scale;
		this.canvas[0].height = this.wh * this.scale;

		this.context.scale(this.scale, this.scale);
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
	}

	private Move(e)
	{
		console.log(this.canvas[0].width, this.canvas[0].height, this.mouse_x, this.mouse_y, e.pageX, e.pageY);
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
		console.log(Ax, Ay, Bx, By, cos, this.mouse_angle/TO_RADIANS);
		// let angle = this.angle + e.pageX - this.mouse_x;
		this.Rotate(this.mouse_angle_from + this.mouse_angle/TO_RADIANS);
	}

	// private Search(x: number, y: number, angle: number): [number, number] {
	// 	const ca = Math.cos(angle);
	// 	const sa = Math.sin(angle);
	//
	// 	return [x * ca - y * sa, x * sa + y * ca];
	// }

}







