"use strict";
const TO_RADIANS = Math.PI / 180;
var States;
(function (States) {
    States[States["None"] = 0] = "None";
    States[States["Ready"] = 1] = "Ready";
    States[States["Crop"] = 2] = "Crop";
    States[States["Rotate"] = 3] = "Rotate";
    States[States["Blur"] = 4] = "Blur";
    States[States["Bright"] = 5] = "Bright";
})(States || (States = {}));
class ManageButton {
    static active = null;
    activated;
    editor;
    btn;
    tool;
    btn_class;
    btn_title;
    tool_class;
    state;
    constructor(btn_class, btn_title, tool_class, state, editor) {
        this.activated = false;
        this.editor = editor;
        this.btn_class = btn_class;
        this.btn_title = btn_title;
        this.tool_class = tool_class;
        this.state = state;
    }
    Init() {
        this.btn = $('<div/>', { class: this.btn_class + ' btn', 'title': this.btn_title, click: () => { this.activated ? this.Deactivate() : this.Activate(); } });
        this.tool = $('<div/>', { class: this.tool_class + ' hide' });
        this.editor.btn_container.append(this.btn);
        this.editor.toolbar.prepend(this.tool);
        this.CreateToolElem();
        this.AddToolElem();
        this.editor.btn_reset.on('click', () => {
            if (this.editor.state != this.state)
                return;
            else
                this.Reset();
        });
    }
    Activate() {
        if (this.activated || this.editor.state == States.None)
            return;
        this.activated = true;
        if (ManageButton.active)
            ManageButton.active.Deactivate();
        ManageButton.active = this;
        this.btn.addClass('btn_use');
        this.editor.toolbar.removeClass('hide');
        this.tool.removeClass('hide');
        this.editor.state = this.state;
        this.OnActivate();
    }
    Deactivate() {
        if (!this.activated)
            return;
        this.activated = false;
        this.btn.removeClass('btn_use');
        this.tool.addClass('hide');
        this.editor.state = States.Ready;
        this.OnDeactivate();
    }
    OnActivate() { }
    OnDeactivate() { }
    CreateToolElem() { }
    AddToolElem() { }
    Reset() { }
}
class Rotate_b extends ManageButton {
    clockwise;
    counter_clockwise;
    upside;
    constructor(editor) {
        super('rotate', 'Поворот', 'tool_rotate', States.Rotate, editor);
        this.Init();
    }
    Reset() { this.editor.Rotate(0); }
    CreateToolElem() {
        this.clockwise = $('<div/>', { class: 'clockwise' }).attr('title', '90° по часовой');
        this.counter_clockwise = $('<div/>', { class: 'counter_clockwise' }).attr('title', '90° против часовой');
        this.upside = $('<div/>', { class: 'upside' }).attr('title', '180°');
        this.clockwise.on('click', () => { this.editor.Rotate(this.editor.angle + 90); });
        this.counter_clockwise.on('click', () => { this.editor.Rotate(this.editor.angle - 90); });
        this.upside.on('click', () => { this.editor.Rotate(this.editor.angle + 180); });
    }
    AddToolElem() {
        this.tool.append(this.clockwise, this.counter_clockwise, this.upside);
    }
    OnActivate() { this.editor.ShowLines(); /* this.editor.state = States.Rotate; */ }
    OnDeactivate() { this.editor.HideLines(); }
}
class Crop_b extends ManageButton {
    constructor(editor) {
        super('crop', 'Обрезка', 'tool_crop', States.Crop, editor);
        this.Init();
    }
    Reset() {
        this.editor.crop = [
            (this.editor.wh - this.editor.width) / 2, (this.editor.wh - this.editor.height) / 2,
            (this.editor.wh + this.editor.width) / 2, (this.editor.wh + this.editor.height) / 2
        ];
        this.editor.setNeedCropUpdate();
    }
    CreateToolElem() {
    }
    AddToolElem() {
        this.tool.append();
    }
    OnActivate() { /* this.editor.state = States.Crop; */ this.editor.crop_container.addClass('act'); }
    OnDeactivate() { this.editor.crop_container.removeClass('act'); }
}
class Blur_b extends ManageButton {
    brush1;
    brush2;
    brush3;
    brush4;
    constructor(editor) {
        super('blur', 'Размытие', 'tool_blur', States.Blur, editor);
        this.Init();
    }
    Reset() {
        let imageData = this.editor.orig_ctx.getImageData(0, 0, this.editor.width, this.editor.height);
        this.editor.buffer_ctx.putImageData(imageData, 0, 0);
        this.editor.setNeedUpdateBright();
    }
    CreateToolElem() {
        this.brush1 = $('<div/>', { class: 'brush1' }).on('click', () => { this.editor.blur_size = 10; this.tool.children('div').removeClass('act_brush'); this.brush1.addClass('act_brush'); });
        this.brush2 = $('<div/>', { class: 'brush2' }).on('click', () => { this.editor.blur_size = 20; this.tool.children('div').removeClass('act_brush'); this.brush2.addClass('act_brush'); });
        this.brush3 = $('<div/>', { class: 'brush3' }).on('click', () => { this.editor.blur_size = 30; this.tool.children('div').removeClass('act_brush'); this.brush3.addClass('act_brush'); });
        this.brush4 = $('<div/>', { class: 'brush4' }).on('click', () => { this.editor.blur_size = 40; this.tool.children('div').removeClass('act_brush'); this.brush4.addClass('act_brush'); });
    }
    AddToolElem() {
        this.tool.append(this.brush1, this.brush2, this.brush3, this.brush4);
    }
    OnActivate() { /* this.editor.state = States.Blur; */ this.editor.blur_size = 40; this.tool.children('div').removeClass('act_brush'); this.brush4.addClass('act_brush'); }
    OnDeactivate() { }
}
class Bright_b extends ManageButton {
    touch;
    constructor(editor) {
        super('bright', 'Яркость', 'tool_bright', States.Bright, editor);
        this.Init();
    }
    Reset() {
        this.editor.Bright(0);
        this.editor.setNeedUpdate();
        this.touch.css({ 'left': 142 });
    }
    CreateToolElem() { this.touch = $('<div/>', { class: 'touch' }); }
    AddToolElem() {
        this.tool.append(this.touch);
    }
    OnActivate() { }
    OnDeactivate() { }
}
class MouseActionDMU {
    name;
    target;
    constructor(name, target) {
        this.name = name;
        this.target = target;
        this.init();
    }
    init() {
        this.target.on(`mousedown.${this.name}`, (e) => {
            if (!this.onDown(e)) {
                this.done();
                return;
            }
            $(document).on(`mousemove.${this.name}`, (e) => { this.onMove(e); });
            $(document).on(`mouseup.${this.name}`, (e) => {
                this.onUp(e);
                this.done();
            });
        });
    }
    done() {
        // this.target.off(`mousedown.${this.name}`);
        $(document).off(`mousemove.${this.name}`);
        $(document).off(`mouseup.${this.name}`);
    }
    onDown(e) { return false; }
    onMove(e) { }
    onUp(e) { }
}
class Ready extends MouseActionDMU {
    editor;
    _top;
    _left;
    _x;
    _y;
    constructor(target, editor) {
        super('ready', target);
        this.editor = editor;
    }
    onDown(e) {
        if (this.editor.state != States.Ready)
            return false;
        this._top = this.editor.canvas_container.scrollTop();
        this._left = this.editor.canvas_container.scrollLeft();
        this._x = e.pageX;
        this._y = e.pageY;
        return true;
    }
    onMove(e) {
        this.editor.canvas_container.scrollLeft(this._left - (e.pageX - this._x));
        this.editor.canvas_container.scrollTop(this._top - (e.pageY - this._y));
    }
    onUp(e) { }
}
class ChangeBrightness extends MouseActionDMU {
    editor;
    left;
    e_x;
    constructor(target, editor) {
        super('brightness', target);
        this.editor = editor;
    }
    onDown(e) {
        if (this.editor.state != States.Bright)
            return false;
        this.left = this.editor.left;
        this.e_x = e.pageX;
        return true;
    }
    onMove(e) {
        let percent = e.pageX - this.e_x;
        this.left = this.editor.left + percent;
        this.editor.bright_b.touch.css({ 'left': this.left });
        const br = (510.0 / 300.0) * (this.left + 8) - 255;
        this.editor.Bright(br);
    }
    onUp(e) { this.editor.left = this.left; }
}
class Rotate extends MouseActionDMU {
    editor;
    angle_from;
    rotate_x;
    rotate_y;
    constructor(target, editor) {
        super('rotate', target);
        this.editor = editor;
    }
    onDown(e) {
        if (this.editor.state != States.Rotate)
            return false;
        this.angle_from = this.editor.angle;
        let px, py, dx, dy;
        [px, py, dx, dy] = this.editor.canvasToImg(e.pageX, e.pageY);
        this.rotate_x = px;
        this.rotate_y = py;
        return true;
    }
    onMove(e) {
        let px, py, dx, dy;
        [px, py, dx, dy] = this.editor.canvasToImg(e.pageX, e.pageY);
        const whs = this.editor.wh / 2;
        let Ax = whs - this.rotate_x;
        let Ay = whs - this.rotate_y;
        let Bx = whs - px;
        let By = whs - py;
        let a = Math.sqrt(Ax * Ax + Ay * Ay);
        let b = Math.sqrt(Bx * Bx + By * By);
        let one = Ax * Bx + Ay * By;
        let two = a * b;
        let three = Ax * By - Ay * Bx;
        let cos = one / two;
        const angle = three > 0 ? Math.acos(cos) : -Math.acos(cos);
        // let angle = this.angle + e.pageX - this.mouse_x;
        this.editor.Rotate(this.angle_from + angle / TO_RADIANS);
    }
    onUp(e) { }
}
class Crop extends MouseActionDMU {
    editor;
    _crop_l;
    _crop_t;
    _crop_r;
    _crop_b;
    _x;
    _y;
    constructor(target, editor) {
        super('crop', target);
        this.editor = editor;
    }
    onDown(e) {
        if (this.editor.state != States.Crop)
            return false;
        this._crop_l = this.editor.crop[0];
        this._crop_t = this.editor.crop[1];
        this._crop_r = this.editor.crop[2];
        this._crop_b = this.editor.crop[3];
        this._x = e.pageX;
        this._y = e.pageY;
        return true;
    }
    onMove(e) {
        this.editor.crop[0] = this._crop_l + (e.pageX - this._x) / this.editor.scale;
        this.editor.crop[1] = this._crop_t + (e.pageY - this._y) / this.editor.scale;
        this.editor.crop[2] = this._crop_r + (e.pageX - this._x) / this.editor.scale;
        this.editor.crop[3] = this._crop_b + (e.pageY - this._y) / this.editor.scale;
        this.editor.setNeedCropUpdate();
    }
    onUp(e) { }
}
class Blur extends MouseActionDMU {
    editor;
    constructor(target, editor) {
        super('blur', target);
        this.editor = editor;
    }
    onDown(e) {
        if (this.editor.state != States.Blur)
            return false;
        return true;
    }
    onMove(e) {
        const mX = (e.pageX - this.editor.canvas_container[0].offsetLeft + this.editor.canvas_container.scrollLeft() - this.editor.canvas[0].width / 2) / this.editor.scale;
        const mY = (e.pageY - this.editor.canvas_container[0].offsetTop + this.editor.canvas_container.scrollTop() - this.editor.canvas[0].height / 2) / this.editor.scale;
        const rX = (mX * Math.cos(-this.editor.angle * TO_RADIANS) - mY * Math.sin(-this.editor.angle * TO_RADIANS) + this.editor.width / 2);
        const rY = (mX * Math.sin(-this.editor.angle * TO_RADIANS) + mY * Math.cos(-this.editor.angle * TO_RADIANS) + this.editor.height / 2);
        if (e.ctrlKey)
            this.editor.UnBlur(rX, rY, this.editor.blur_size);
        else
            this.editor.Blur(rX, rY, this.editor.blur_size);
        this.editor.setNeedUpdateBright();
    }
    onUp(e) { }
}
class Editor {
    canvas;
    context;
    /* Оригинал загруженного изображения */
    orig;
    orig_ctx;
    /* Заблёренный оригинал */
    buffer;
    buffer_ctx;
    /* Подготовленное к отображению изображение : тут поменяна яркость, контрастность и т.п. */
    image;
    image_ctx;
    drawInterval = null;
    needUpdateBright = false;
    needUpdate = true;
    needCropUpdate = true;
    canvas_container;
    top_container;
    btn_container;
    toolbar;
    btn_reset;
    end_container;
    reset_all;
    save_img;
    exit;
    rotate_b;
    crop_b;
    blur_b;
    bright_b;
    isShowLines;
    state;
    scale;
    wh;
    width;
    height;
    angle;
    brightness;
    left;
    blur_size;
    crop;
    crop_background;
    crop_container;
    crop_boxes;
    constructor() {
        this.state = States.None;
        this.canvas = $('canvas#test');
        this.context = this.canvas[0].getContext('2d');
        this.angle = 0;
        this.blur_size = 0;
        this.brightness = 0;
        this.orig = document.createElement("canvas");
        this.orig_ctx = this.orig.getContext('2d');
        this.buffer = document.createElement("canvas");
        this.buffer_ctx = this.buffer.getContext('2d');
        this.image = document.createElement("canvas");
        this.image_ctx = this.image.getContext('2d');
        this.left = 142;
        this.isShowLines = false;
        /* Elements */
        this.top_container = $('<div/>', { class: 'top_container' });
        this.btn_container = $('<div/>', { class: 'btn_container' });
        this.btn_reset = $('<div/>', { class: 'reset' }).text('Сбросить');
        this.toolbar = $('<div/>', { class: 'toolbar' }).addClass('hide');
        this.end_container = $('<div/>', { class: 'end_container' });
        this.reset_all = $('<div/>', { class: 'reset_all' }).attr('title', 'Сбросить всё');
        this.save_img = $('<div/>', { class: 'save_img' }).attr('title', 'Сохранить');
        this.exit = $('<div/>', { class: 'exit' }).attr('title', 'Выход');
        this.canvas_container = $('div.canvas');
        this.crop_background = $('<div/>', { class: 'crop_background' }).appendTo(this.canvas_container);
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
        this.rotate_b = new Rotate_b(this);
        this.crop_b = new Crop_b(this);
        this.blur_b = new Blur_b(this);
        this.bright_b = new Bright_b(this);
        /* Building DOM */
        $('body').prepend(this.top_container.append(this.btn_container.append(
        // this.rotate_b.btn,
        // this.crop_b.btn,
        // this.blur_b.btn,
        // this.bright_b.btn
        ), this.toolbar.append(
        // this.rotate_b.tool,
        // this.crop_b.tool,
        // this.blur_b.tool,
        // this.bright_b.tool,
        this.btn_reset), this.end_container.append(this.reset_all, this.save_img, this.exit)));
        /* Onload image */
        const img = document.createElement('img');
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            this.width = img.width;
            this.height = img.height;
            this.orig.width = this.width;
            this.orig.height = this.height;
            this.orig_ctx.drawImage(img, 0, 0);
            this.buffer.width = this.width;
            this.buffer.height = this.height;
            this.buffer_ctx.drawImage(img, 0, 0);
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
            this.drawInterval = setInterval(() => {
                if (this.needUpdateBright)
                    this.ChangeBright();
                if (this.needUpdate)
                    this.Draw();
                if (this.needCropUpdate)
                    this.DrawPolygon();
            }, 40);
        };
        img.src = 'https://tests.local/Editor/2.jpg';
        /* Events */
        new Ready(this.canvas_container, this);
        new ChangeBrightness(this.bright_b.touch, this);
        new Rotate(this.canvas_container, this);
        new Crop(this.canvas_container, this);
        new Blur(this.canvas_container, this);
        this.reset_all.on('click', () => {
            this.state = States.Ready;
            // this.ChangeToolbar();
            this.Scale(0.25, this.wh / 2, this.wh / 2, this.canvas_container.width() / 2, this.canvas_container.height() / 2);
            this.angle = 0;
            this.brightness = 0;
            this.bright_b.touch.css({ 'left': 142 });
            this.crop = [
                (this.wh - this.width) / 2, (this.wh - this.height) / 2,
                (this.wh + this.width) / 2, (this.wh + this.height) / 2
            ];
            this.setNeedUpdateBright();
            this.setNeedCropUpdate();
            // this.UseBtn();
        });
        this.save_img.on('click', () => {
            this.SaveImg();
            console.log('1');
        });
        this.exit.on('click', () => { });
        this.canvas_container.on('wheel', (e) => {
            const oe = e.originalEvent;
            let px, py, dx, dy;
            [px, py, dx, dy] = this.canvasToImg(oe.pageX, oe.pageY);
            if (e.ctrlKey) {
                oe.deltaY < 0 ? this.Scale(this.scale * 1.1, px, py, dx, dy) : this.Scale(this.scale / 1.1, px, py, dx, dy);
                return false;
            }
            if (e.shiftKey) {
                const _left = this.canvas_container.scrollLeft();
                oe.deltaY < 0 ? this.canvas_container.scrollLeft(_left - 20) : this.canvas_container.scrollLeft(_left + 20);
                return false;
            }
            else {
                const _top = this.canvas_container.scrollTop();
                oe.deltaY < 0 ? this.canvas_container.scrollTop(_top - 20) : this.canvas_container.scrollTop(_top + 20);
                return false;
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
                    this.setNeedCropUpdate();
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
    ShowLines() { this.isShowLines = true; this.setNeedUpdate(); }
    HideLines() { this.isShowLines = false; this.setNeedUpdate(); }
    canvasToImg(x, y) {
        const dx = x - this.canvas_container.offset().left;
        const dy = y - this.canvas_container.offset().top;
        const px = (dx + this.canvas_container.scrollLeft()) / this.scale;
        const py = (dy + this.canvas_container.scrollTop()) / this.scale;
        return [px, py, dx, dy];
    }
    setNeedUpdateBright() { this.needUpdateBright = true; this.needUpdate = true; }
    setNeedUpdate() { this.needUpdate = true; }
    setNeedCropUpdate() { this.needCropUpdate = true; }
    /* Methods */
    Scale(scale, px, py, dx, dy) {
        let whs = Math.round(scale * this.wh);
        if (whs > 6000)
            return;
        if (whs < Math.max(this.canvas_container.width(), this.canvas_container.height()))
            return;
        this.scale = scale;
        this.canvas[0].width = whs;
        this.canvas[0].height = whs;
        this.context.scale(this.scale, this.scale);
        const scroll_x = px * this.scale - dx;
        const scroll_y = py * this.scale - dy;
        this.canvas_container.scrollLeft(scroll_x);
        this.canvas_container.scrollTop(scroll_y);
        this.Draw();
        this.DrawPolygon();
    }
    Rotate(angle) { this.angle = angle; this.setNeedUpdate(); }
    Bright(bright) { this.brightness = bright; this.setNeedUpdateBright(); }
    Draw() {
        this.needUpdate = false;
        this.context.clearRect(0, 0, this.wh, this.wh);
        this.context.save();
        this.context.translate(this.wh / 2, this.wh / 2);
        this.context.rotate(this.angle * TO_RADIANS);
        this.context.drawImage(this.image, -this.width / 2, -this.height / 2);
        this.context.restore();
        if (this.isShowLines)
            this.DrawLines();
    }
    SaveImg() {
        this.orig.width = this.wh;
        this.orig.height = this.wh;
        this.orig_ctx.clearRect(0, 0, this.wh, this.wh);
        this.orig_ctx.scale(1, 1);
        this.orig_ctx.save();
        this.orig_ctx.translate(this.wh / 2, this.wh / 2);
        this.orig_ctx.rotate(this.angle * TO_RADIANS);
        this.orig_ctx.drawImage(this.image, -this.width / 2, -this.height / 2);
        this.orig_ctx.restore();
        let img_save = this.orig_ctx.getImageData(this.crop[0], this.crop[1], this.crop[2] - this.crop[0], this.crop[3] - this.crop[1]);
        this.orig.width = this.crop[2] - this.crop[0];
        this.orig.height = this.crop[3] - this.crop[1];
        this.orig_ctx.clearRect(0, 0, 100000, 100000);
        this.orig_ctx.putImageData(img_save, 0, 0);
        const img = $('<img/>', { width: this.crop[2] - this.crop[0], height: this.crop[3] - this.crop[1] }).appendTo($('body'));
        img[0].src = this.orig.toDataURL();
    }
    DrawLines() {
        this.context.lineWidth = 1 / this.scale;
        const count = 6;
        const color = '#00000060';
        for (let i = 0; i < count + 1; i++) {
            this.context.beginPath();
            this.context.strokeStyle = color;
            this.context.moveTo(i * (this.crop[2] - this.crop[0]) / count + this.crop[0], this.crop[1]);
            this.context.lineTo(i * (this.crop[2] - this.crop[0]) / count + this.crop[0], this.crop[3]);
            this.context.stroke();
            this.context.closePath();
        }
        for (let i = 0; i < count + 1; i++) {
            this.context.beginPath();
            this.context.strokeStyle = color;
            this.context.moveTo(this.crop[0], i * (this.crop[3] - this.crop[1]) / count + this.crop[1]);
            this.context.lineTo(this.crop[2], i * (this.crop[3] - this.crop[1]) / count + this.crop[1]);
            this.context.stroke();
            this.context.closePath();
        }
    }
    DrawPolygon() {
        this.needCropUpdate = false;
        const whs = Math.round(this.scale * this.wh);
        const left = Math.ceil(this.scale * this.crop[0]);
        const right = Math.floor(this.scale * this.crop[2]);
        const top = Math.ceil(this.scale * this.crop[1]);
        const bottom = Math.floor(this.scale * this.crop[3]);
        const space = 4;
        let pol = [];
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
        this.crop_background.css({ 'width': whs, 'height': whs });
        this.crop_container.css({ 'width': whs, 'height': whs });
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
    Blur(x, y, wh) {
        let imageData = this.buffer_ctx.getImageData(x - wh / 2, y - wh / 2, wh, wh);
        Functions.blur(imageData, wh, wh, 2);
        this.buffer_ctx.putImageData(imageData, x - wh / 2, y - wh / 2);
    }
    UnBlur(x, y, wh) {
        let imageData = this.orig_ctx.getImageData(x - wh / 2, y - wh / 2, wh, wh);
        this.buffer_ctx.putImageData(imageData, x - wh / 2, y - wh / 2);
    }
    ChangeBright() {
        this.needUpdateBright = false;
        const imageData = this.buffer_ctx.getImageData(0, 0, this.width, this.height);
        if (this.brightness != 0) {
            for (let i = 0; i < imageData.data.length; i += 4) {
                const red = imageData.data[i];
                const green = imageData.data[i + 1];
                const blue = imageData.data[i + 2];
                let HSB = this.RGBtoHSB(red, green, blue);
                let RGB = this.HSBtoRGB(HSB[0], HSB[1], HSB[2] + this.brightness, red, green, blue);
                imageData.data[i] = RGB[0];
                imageData.data[i + 1] = RGB[1];
                imageData.data[i + 2] = RGB[2];
            }
        }
        this.image_ctx.putImageData(imageData, 0, 0);
    }
    RGBtoHSB(r, g, b) {
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0; // achromatic
        }
        else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return [h, s, l];
    }
    HSBtoRGB(h, s, l, r, g, b) {
        if (s == 0) {
            r = g = b = l; // achromatic
        }
        else {
            function hue2rgb(p, q, t) {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [r, g, b];
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
    function RGBtoHSB(r, g, b) {
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0; // achromatic
        }
        else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return [h, s, l];
    }
    function HSBtoRGB(h, s, l, r, g, b) {
        if (s == 0) {
            r = g = b = l; // achromatic
        }
        else {
            function hue2rgb(p, q, t) {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [r, g, b];
    }
})(Functions || (Functions = {}));
//# sourceMappingURL=editor.js.map