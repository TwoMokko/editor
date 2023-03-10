"use strict";
const TO_RADIANS = Math.PI / 180;
class Editor {
    canvas;
    context;
    image;
    // x					: number;
    // y					: number;
    // angle				: number;
    $btn;
    constructor() {
        this.canvas = document.getElementById('test');
        this.context = this.canvas.getContext('2d');
        this.image = document.getElementById("img");
        // this.x 			= x;
        // this.y 			= y;
        // this.angle 		= angle;
        this.$btn = $('#btn');
        this.context.drawImage(this.image, 0, 0);
        // this.$btn.on('click', this.Rotate.bind(this));
    }
    Rotate(angle) {
        this.context.clearRect(0, 0, this.image.width, this.image.height);
        this.context.save();
        this.context.translate(this.image.width / 2, this.image.height / 2);
        this.context.rotate(angle * TO_RADIANS);
        this.context.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
        this.context.restore();
    }
}
//# sourceMappingURL=editor.js.map