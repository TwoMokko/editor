"use strict";
const TO_RADIANS = Math.PI / 180;
var States;
(function (States) {
    States[States["None"] = 0] = "None";
    States[States["Ready"] = 1] = "Ready";
    States[States["Crop"] = 2] = "Crop";
    States[States["Rotate"] = 3] = "Rotate";
    States[States["Blur"] = 4] = "Blur";
})(States || (States = {}));
class Editor {
    canvas;
    context;
    orig;
    orig_ctx;
    image;
    image_ctx;
    canvas_container;
    btn_container;
    btn_rotate;
    btn_crop;
    btn_blur;
    btn_scale;
    btn_reset;
    state;
    scale;
    wh;
    width;
    height;
    angle;
    mouse_angle_from;
    mouse_angle;
    rotate_x;
    rotate_y;
    crop;
    crop_background;
    crop_container;
    crop_boxes;
    constructor() {
        this.state = States.None;
        this.canvas = $('canvas#test');
        this.context = this.canvas[0].getContext('2d');
        this.angle = 0;
        // this.scale_x			= 0;
        // this.scale_y			= 0;
        this.orig = document.createElement("canvas");
        this.orig_ctx = this.orig.getContext('2d');
        this.image = document.createElement("canvas");
        this.image_ctx = this.image.getContext('2d');
        /* Elements */
        this.btn_container = $('<div/>', { class: 'container' });
        this.btn_rotate = $('<div/>', { class: 'btn' }).text('Повернуть');
        this.btn_crop = $('<div/>', { class: 'btn' }).text('Обрезать');
        this.btn_blur = $('<div/>', { class: 'btn' }).text('Замазать');
        this.btn_scale = $('<div/>', { class: 'btn btn_use' }).text('Масштаб');
        this.btn_reset = $('<div/>', { class: 'btn' }).text('Сбросить ЭТО').css({ 'background-color': '#4CAF50' });
        this.canvas_container = $('div.canvas');
        this.crop_background = $('<div/>', { class: 'crop_background' }).appendTo(this.canvas_container);
        // this.crop_background.css({ 'width': this.wh, 'height': this.wh});
        this.crop_container = $('<div/>', { class: 'crop_container' }).appendTo(this.canvas_container);
        this.crop_boxes = {
            top: $('<div/>', { class: 'top' }).appendTo(this.crop_container),
            right: $('<div/>', { class: 'right' }).appendTo(this.crop_container),
            bottom: $('<div/>', { class: 'bottom' }).appendTo(this.crop_container),
            left: $('<div/>', { class: 'left' }).appendTo(this.crop_container),
            top_left: $('<div/>', { class: 'angle_nw' }).appendTo(this.crop_container),
            top_right: $('<div/>', { class: 'angle_ne' }).appendTo(this.crop_container),
            bot_right: $('<div/>', { class: 'angle_nw' }).appendTo(this.crop_container),
            bot_left: $('<div/>', { class: 'angle_ne' }).appendTo(this.crop_container),
        };
        /* Building DOM */
        $('body').prepend(this.btn_container.append(this.btn_rotate, this.btn_crop, this.btn_blur, this.btn_scale, this.btn_reset));
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
            this.Scale(0.25, this.wh / 2, this.wh / 2, this.canvas_container.width() / 2, this.canvas_container.height() / 2);
            this.state = States.Ready;
        };
        img.src = 'https://tests.local/Editor/2.jpg';
        this.btn_rotate.on('click', () => { if (this.state == States.None)
            return; this.state = States.Rotate; this.UseBtn(); });
        this.btn_crop.on('click', () => { if (this.state == States.None)
            return; this.state = States.Crop; this.UseBtn(); });
        this.btn_blur.on('click', () => { if (this.state == States.None)
            return; this.state = States.Blur; this.UseBtn(); });
        this.btn_scale.on('click', () => { if (this.state == States.None)
            return; this.state = States.Ready; this.UseBtn(); });
        this.btn_reset.on('click', () => { if (this.state != States.Ready)
            return;
        else {
            this.Scale(0.25, this.wh / 2, this.wh / 2, this.canvas_container.width() / 2, this.canvas_container.height() / 2);
            this.Draw();
        } });
        this.btn_reset.on('click', () => { if (this.state != States.Rotate)
            return;
        else {
            this.Rotate(0);
        } });
        this.btn_reset.on('click', () => {
            if (this.state != States.Crop)
                return;
            else {
                this.crop = [
                    (this.wh - this.width) / 2, (this.wh - this.height) / 2,
                    (this.wh + this.width) / 2, (this.wh + this.height) / 2
                ];
                this.DrawPolygon();
            }
        });
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
        this.canvas_container.on('wheel', (e) => {
            if (this.state != States.Ready)
                return;
            console.log('container', this.canvas_container.width(), this.canvas_container.height(), this.canvas_container.offset(), this.canvas_container.scrollLeft(), this.canvas_container.scrollTop());
            console.log('canvas', this.canvas.width(), this.canvas.height(), this.canvas.offset(), this.canvas.scrollLeft(), this.canvas.scrollTop());
            console.log(e.originalEvent.pageX, e.originalEvent.pageY);
            // let scrollLeft = 0;
            // scrollLeft += this.scale;
            // this.scale_x = e.offsetX + scrollLeft;
            // this.canvas_container.scrollLeft(this.scale_x - e.offsetX);
            const oe = e.originalEvent;
            const dx = oe.pageX - this.canvas_container.offset().left;
            const dy = oe.pageY - this.canvas_container.offset().top;
            const px = (dx + this.canvas_container.scrollLeft()) / this.scale;
            const py = (dy + this.canvas_container.scrollTop()) / this.scale;
            oe.deltaY < 0 ? this.Scale(this.scale * 1.1, px, py, dx, dy) : this.Scale(this.scale / 1.1, px, py, dx, dy);
            return false;
        });
        this.canvas_container.on('mousedown', (e) => {
            if (this.state == States.Rotate) {
                this.mouse_angle_from = this.angle;
                this.rotate_x = e.pageX - this.canvas[0].offsetLeft;
                this.rotate_y = e.pageY - this.canvas[0].offsetTop;
                this.canvas_container.on('mousemove.editor', this.Move.bind(this));
                this.canvas_container.on('mouseup.editor', () => {
                    this.canvas_container.off('mousemove.editor');
                    this.canvas_container.off('mouseup.editor');
                });
            }
            if (this.state == States.Ready) {
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
            if (this.state == States.Blur) {
                this.canvas_container.on('mousemove.editor', (e) => {
                    const mX = (e.pageX - this.canvas_container[0].offsetLeft + this.canvas_container.scrollLeft() - this.canvas[0].width / 2) / this.scale;
                    const mY = (e.pageY - this.canvas_container[0].offsetTop + this.canvas_container.scrollTop() - this.canvas[0].height / 2) / this.scale;
                    const rX = (mX * Math.cos(-this.angle * TO_RADIANS) - mY * Math.sin(-this.angle * TO_RADIANS) + this.width / 2);
                    const rY = (mX * Math.sin(-this.angle * TO_RADIANS) + mY * Math.cos(-this.angle * TO_RADIANS) + this.height / 2);
                    console.log((e.pageX - this.canvas_container[0].offsetLeft), e.pageY - this.canvas_container[0].offsetTop);
                    console.log(rX, rY);
                    if (e.ctrlKey)
                        this.UnBlur(rX, rY);
                    else
                        this.Blur(rX, rY);
                    this.Draw();
                });
                this.canvas_container.on('mouseup.editor', () => {
                    this.canvas_container.off('mousemove.editor');
                    this.canvas_container.off('mouseup.editor');
                });
            }
            if (this.state == States.Crop) {
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
        const CropMove = (a, b, e, box) => {
            if (this.state == States.Crop) {
                const _crop_x = this.crop[a ?? 0];
                const _crop_y = this.crop[b ?? 0];
                const _x = e.pageX;
                const _y = e.pageY;
                this.canvas_container.on('mousemove.editor', e => {
                    if (a !== null) {
                        this.crop[a] = _crop_x + Math.round((e.pageX - _x) / this.scale);
                        if (box.left !== null && this.crop[a] < box.left)
                            this.crop[a] = box.left;
                        if (box.right !== null && this.crop[a] > box.right)
                            this.crop[a] = box.right;
                    }
                    if (b !== null) {
                        this.crop[b] = _crop_y + Math.round((e.pageY - _y) / this.scale);
                        if (box.top !== null && this.crop[b] < box.top)
                            this.crop[b] = box.top;
                        if (box.bottom !== null && this.crop[b] > box.bottom)
                            this.crop[b] = box.bottom;
                    }
                    this.DrawPolygon();
                });
                this.canvas_container.on('mouseup.editor', () => { this.canvas_container.off('mousemove.editor'); this.canvas_container.off('mouseup.editor'); });
            }
            return false;
        };
        this.crop_boxes.top.on('mousedown', e => { return CropMove(null, 1, e, { top: 0, bottom: this.crop[3] }); });
        this.crop_boxes.bottom.on('mousedown', e => { return CropMove(null, 3, e, { top: this.crop[1], bottom: this.wh }); });
        this.crop_boxes.left.on('mousedown', e => { return CropMove(0, null, e, { left: 0, right: this.crop[2] }); });
        this.crop_boxes.right.on('mousedown', e => { return CropMove(2, null, e, { left: this.crop[0], right: this.wh }); });
        this.crop_boxes.top_left.on('mousedown', e => { return CropMove(0, 1, e, { left: 0, right: this.crop[2], top: 0, bottom: this.crop[3] }); });
        this.crop_boxes.top_right.on('mousedown', e => { return CropMove(2, 1, e, { left: this.crop[0], right: this.wh, top: 0, bottom: this.crop[3] }); });
        this.crop_boxes.bot_left.on('mousedown', e => { return CropMove(0, 3, e, { left: 0, right: this.crop[2], top: this.crop[1], bottom: this.wh }); });
        this.crop_boxes.bot_right.on('mousedown', e => { return CropMove(2, 3, e, { left: this.crop[0], right: this.wh, top: this.crop[1], bottom: this.wh }); });
    }
    Scale(scale, px, py, dx, dy) {
        let whs = Math.round(scale * this.wh);
        if (whs > 6000)
            return;
        if (whs < Math.max(this.canvas_container.width(), this.canvas_container.height()))
            return;
        this.scale = scale;
        this.canvas[0].width = whs;
        this.canvas[0].height = whs;
        this.crop_background.css({ 'width': whs, 'height': whs });
        this.crop_container.css({ 'width': whs, 'height': whs });
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
    Rotate(angle) { this.angle = angle; this.Draw(); }
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
    Draw() {
        this.context.clearRect(0, 0, this.wh, this.wh);
        this.context.save();
        this.context.translate(this.wh / 2, this.wh / 2);
        this.context.rotate(this.angle * TO_RADIANS);
        this.context.drawImage(this.image, -this.width / 2, -this.height / 2);
        this.context.restore();
        this.DrawPolygon();
    }
    Move(e) {
        let Ax = this.wh / 2 * this.scale - this.rotate_x;
        let Ay = this.wh / 2 * this.scale - this.rotate_y;
        let Bx = this.wh / 2 * this.scale - (e.pageX - this.canvas[0].offsetLeft);
        let By = this.wh / 2 * this.scale - (e.pageY - this.canvas[0].offsetTop);
        let a = Math.sqrt(Ax * Ax + Ay * Ay);
        let b = Math.sqrt(Bx * Bx + By * By);
        let one = Ax * Bx + Ay * By;
        let two = a * b;
        let three = Ax * By - Ay * Bx;
        let cos = one / two;
        this.mouse_angle = three > 0 ? Math.acos(cos) : -Math.acos(cos);
        // let angle = this.angle + e.pageX - this.mouse_x;
        this.Rotate(this.mouse_angle_from + this.mouse_angle / TO_RADIANS);
    }
    // private Search(x: number, y: number, angle: number): [number, number] {
    // 	const ca = Math.cos(angle);
    // 	const sa = Math.sin(angle);
    //
    // 	return [x * ca - y * sa, x * sa + y * ca];
    // }
    DrawPolygon() {
        let pol = [];
        const whs = Math.round(this.scale * this.wh);
        const left = Math.ceil(this.scale * this.crop[0]);
        const right = Math.floor(this.scale * this.crop[2]);
        const top = Math.ceil(this.scale * this.crop[1]);
        const bottom = Math.floor(this.scale * this.crop[3]);
        const space = 4;
        const push = (x, y) => { pol.push(`${x} ${y}`); };
        push(0, 0);
        push(0, '100%');
        push(left + 'px', '100%');
        push(left + 'px', top + 'px');
        push(right + 'px', top + 'px');
        push(right + 'px', bottom + 'px');
        push(left + 'px', bottom + 'px');
        push(left + 'px', '100%');
        push('100%', '100%');
        push('100%', '0');
        this.crop_background.css({ 'clip-path': `polygon(${pol.join(',')})` });
        this.crop_boxes.top.css({ 'top': (top - space) + 'px', 'left': (left + space) + 'px', 'right': (whs - right + space) + 'px' });
        this.crop_boxes.bottom.css({ 'top': (bottom - space) + 'px', 'left': (left + space) + 'px', 'right': (whs - right + space) + 'px' });
        this.crop_boxes.left.css({ 'top': (top + space) + 'px', 'left': (left - space) + 'px', 'bottom': (whs - bottom + space) + 'px' });
        this.crop_boxes.right.css({ 'top': (top + space) + 'px', 'right': (whs - right - space) + 'px', 'bottom': (whs - bottom + space) + 'px' });
        this.crop_boxes.top_left.css({ 'top': (top - space) + 'px', 'left': (left - space) + 'px' });
        this.crop_boxes.top_right.css({ 'top': (top - space) + 'px', 'right': (whs - right - space) + 'px' });
        this.crop_boxes.bot_left.css({ 'top': (bottom - space) + 'px', 'left': (left - space) + 'px' });
        this.crop_boxes.bot_right.css({ 'top': (bottom - space) + 'px', 'right': (whs - right - space) + 'px' });
    }
    Blur(x, y) {
        // this.image.css({'filter': 'blur(5px)'})
        let imageData = this.image_ctx.getImageData(x - 25, y - 25, 50, 50);
        // let red, green, blue, gray;
        // for (let i = 0; i < imageData.data.length; i += 4) {
        // 	const red = imageData.data[i];
        // 	const green = imageData.data[i + 1];
        // 	const blue = imageData.data[i + 2];
        // 	const gray = red * 0.3 + green * 0.59 + blue * 0.11;
        // 	imageData.data[i] = gray;
        // 	imageData.data[i + 1] = gray;
        // 	imageData.data[i + 2] = gray;
        // }
        Functions.blur(imageData, 50, 50, 2);
        this.image_ctx.putImageData(imageData, x - 25, y - 25);
    }
    UnBlur(x, y) {
        let imageData = this.orig_ctx.getImageData(x - 25, y - 25, 50, 50);
        this.image_ctx.putImageData(imageData, x - 25, y - 25);
    }
    UseBtn() {
        this.crop_container.removeClass('act');
        this.btn_container.children('.btn').removeClass('btn_use');
        switch (this.state) {
            case States.Rotate:
                this.btn_rotate.addClass('btn_use');
                break;
            case States.Crop:
                {
                    this.btn_crop.addClass('btn_use');
                    this.crop_container.addClass('act');
                }
                break;
            case States.Blur:
                this.btn_blur.addClass('btn_use');
                break;
            case States.Ready:
                this.btn_scale.addClass('btn_use');
                break;
        }
    }
}
var Functions;
(function (Functions) {
    const mul_table = [
        512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
        454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512,
        482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456,
        437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512,
        497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328,
        320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456,
        446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335,
        329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512,
        505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405,
        399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328,
        324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271,
        268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456,
        451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388,
        385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335,
        332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
        289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259
    ];
    const shg_table = [
        9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
        17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
        19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
        22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
        22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24
    ];
    function blur(imageData, width, height, radius) {
        if (isNaN(radius) || radius < 1)
            return;
        radius |= 0;
        const pixels = imageData.data;
        let x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, r_out_sum, g_out_sum, b_out_sum, r_in_sum, g_in_sum, b_in_sum, pr, pg, pb, rbs;
        let div = radius + radius + 1;
        let w4 = width << 2;
        let widthMinus1 = width - 1;
        let heightMinus1 = height - 1;
        let radiusPlus1 = radius + 1;
        let sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
        let stackStart = new BlurStack();
        let stack = stackStart;
        for (i = 1; i < div; i++) {
            stack = stack.next = new BlurStack();
            if (i == radiusPlus1)
                var stackEnd = stack;
        }
        stack.next = stackStart;
        let stackIn = null;
        let stackOut = null;
        yw = yi = 0;
        let mul_sum = mul_table[radius];
        let shg_sum = shg_table[radius];
        for (y = 0; y < height; y++) {
            r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            stack = stackStart;
            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack = stack.next;
            }
            for (i = 1; i < radiusPlus1; i++) {
                p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
                r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
                b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                stack = stack.next;
            }
            stackIn = stackStart;
            stackOut = stackEnd;
            for (x = 0; x < width; x++) {
                pixels[yi] = (r_sum * mul_sum) >> shg_sum;
                pixels[yi + 1] = (g_sum * mul_sum) >> shg_sum;
                pixels[yi + 2] = (b_sum * mul_sum) >> shg_sum;
                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
                r_in_sum += (stackIn.r = pixels[p]);
                g_in_sum += (stackIn.g = pixels[p + 1]);
                b_in_sum += (stackIn.b = pixels[p + 2]);
                r_sum += r_in_sum;
                g_sum += g_in_sum;
                b_sum += b_in_sum;
                stackIn = stackIn.next;
                r_out_sum += (pr = stackOut.r);
                g_out_sum += (pg = stackOut.g);
                b_out_sum += (pb = stackOut.b);
                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                stackOut = stackOut.next;
                yi += 4;
            }
            yw += width;
        }
        for (x = 0; x < width; x++) {
            g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
            yi = x << 2;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            stack = stackStart;
            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack = stack.next;
            }
            yp = width;
            for (i = 1; i <= radius; i++) {
                yi = (yp + x) << 2;
                r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
                b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                stack = stack.next;
                if (i < heightMinus1) {
                    yp += width;
                }
            }
            yi = x;
            stackIn = stackStart;
            stackOut = stackEnd;
            for (y = 0; y < height; y++) {
                p = yi << 2;
                pixels[p] = (r_sum * mul_sum) >> shg_sum;
                pixels[p + 1] = (g_sum * mul_sum) >> shg_sum;
                pixels[p + 2] = (b_sum * mul_sum) >> shg_sum;
                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;
                r_sum += (r_in_sum += (stackIn.r = pixels[p]));
                g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
                b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));
                stackIn = stackIn.next;
                r_out_sum += (pr = stackOut.r);
                g_out_sum += (pg = stackOut.g);
                b_out_sum += (pb = stackOut.b);
                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                stackOut = stackOut.next;
                yi += width;
            }
        }
    }
    Functions.blur = blur;
    function BlurStack() {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 0;
        this.next = null;
    }
})(Functions || (Functions = {}));
//# sourceMappingURL=editor.js.map