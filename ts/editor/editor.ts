const TO_RADIANS = Math.PI/180;


class Editor {
	canvas				: JQuery<HTMLCanvasElement>;
	context				: CanvasRenderingContext2D;
	image				: JQuery<HTMLImageElement>;
	scale				: number;
	wh					: number;
	width				: number;
	height				: number;
	angle				: number;
	mouse_x				: number;
	mouse_y				: number;

	constructor() {
		this.canvas		= $('canvas#test');
		this.context 	= this.canvas[0].getContext('2d');
		this.image		= $('<img/>', {});
		this.angle		= 0;

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

			this.canvas.on('wheel', (e) => {
				(e.originalEvent as WheelEvent).deltaY < 0 ? this.Scale(this.scale * 1.1) : this.Scale( this.scale / 1.1);
			});

			this.canvas.on('mousedown', (e) => {
				this.mouse_x = e.pageX;
				// this.mouse_y = e.pageY;
				this.canvas.on('mousemove.editor', this.Move.bind(this));

				this.canvas.on('mouseup.editor', () => {
					this.canvas.off('mousemove.editor');
					this.canvas.off('mouseup.editor');
				});
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
		let angle = this.angle + e.pageX - this.mouse_x;
		this.Rotate(angle);
		this.mouse_x = e.pageX;
		// this.mouse_y = e.pageY;
	}

	// private Search(x: number, y: number, angle: number): [number, number] {
	// 	const ca = Math.cos(angle);
	// 	const sa = Math.sin(angle);
	//
	// 	return [x * ca - y * sa, x * sa + y * ca];
	// }

}







