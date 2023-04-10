/// <reference types="jquery" />
/// <reference types="jquery" />
/// <reference types="jqueryui" />
declare namespace Functions {
    function blur(imageData: any, width: any, height: any, radius: any): void;
}
declare const TO_RADIANS: number;
declare enum States {
    None = 0,
    Ready = 1,
    Crop = 2,
    Rotate = 3,
    Blur = 4,
    Bright = 5
}
declare class MouseActionDMU {
    protected name: string;
    protected target: JQuery;
    constructor(name: string, target: JQuery);
    protected init(): void;
    protected done(): void;
    protected onDown(e: any): boolean;
    protected onMove(e: any): void;
    protected onUp(e: any): void;
}
declare class Ready extends MouseActionDMU {
    protected editor: Editor;
    _top: number;
    _left: number;
    _x: number;
    _y: number;
    constructor(target: JQuery, editor: Editor);
    protected onDown(e: any): boolean;
    protected onMove(e: any): void;
    protected onUp(e: any): void;
}
declare class ChangeBrightness extends MouseActionDMU {
    protected editor: Editor;
    protected left: number;
    protected e_x: number;
    constructor(target: JQuery, editor: Editor);
    protected onDown(e: any): boolean;
    protected onMove(e: any): void;
    protected onUp(e: any): void;
}
declare class Rotate extends MouseActionDMU {
    protected editor: Editor;
    protected angle_from: number;
    protected rotate_x: number;
    protected rotate_y: number;
    constructor(target: JQuery, editor: Editor);
    protected onDown(e: any): boolean;
    protected onMove(e: any): void;
    protected onUp(e: any): void;
}
declare class Crop extends MouseActionDMU {
    protected editor: Editor;
    protected _crop_l: number;
    protected _crop_t: number;
    protected _crop_r: number;
    protected _crop_b: number;
    protected _x: number;
    protected _y: number;
    constructor(target: JQuery, editor: Editor);
    protected onDown(e: any): boolean;
    protected onMove(e: any): void;
    protected onUp(e: any): void;
}
declare class Blur extends MouseActionDMU {
    protected editor: Editor;
    constructor(target: JQuery, editor: Editor);
    protected onDown(e: any): boolean;
    protected onMove(e: any): void;
    protected onUp(e: any): void;
}
declare class Editor {
    canvas: JQuery<HTMLCanvasElement>;
    context: CanvasRenderingContext2D;
    orig: HTMLCanvasElement;
    orig_ctx: CanvasRenderingContext2D;
    buffer: HTMLCanvasElement;
    buffer_ctx: CanvasRenderingContext2D;
    image: HTMLCanvasElement;
    image_ctx: CanvasRenderingContext2D;
    drawInterval: number;
    needUpdateBright: boolean;
    needUpdate: boolean;
    needCropUpdate: boolean;
    canvas_container: JQuery;
    top_container: JQuery;
    btn_container: JQuery;
    btn_rotate: JQuery;
    btn_crop: JQuery;
    btn_blur: JQuery;
    btn_bright: JQuery;
    btn_reset: JQuery;
    toolbar: JQuery;
    tool_rotate: JQuery;
    clockwise: JQuery;
    counter_clockwise: JQuery;
    upside: JQuery;
    tool_blur: JQuery;
    brush1: JQuery;
    brush2: JQuery;
    brush3: JQuery;
    brush4: JQuery;
    tool_bright: JQuery;
    touch: JQuery;
    end_container: JQuery;
    reset_all: JQuery;
    save_img: JQuery;
    exit: JQuery;
    isShowLines: boolean;
    state: number;
    scale: number;
    wh: number;
    width: number;
    height: number;
    angle: number;
    brightness: number;
    left: number;
    blur_size: number;
    crop: [number, number, number, number];
    crop_background: JQuery;
    crop_container: JQuery;
    crop_boxes: {
        top: JQuery;
        right: JQuery;
        bottom: JQuery;
        left: JQuery;
        top_left: JQuery;
        top_right: JQuery;
        bot_right: JQuery;
        bot_left: JQuery;
    };
    constructor();
    showLines(): void;
    hideLines(): void;
    canvasToImg(x: number, y: number): [number, number, number, number];
    setNeedUpdateBright(): void;
    setNeedUpdate(): void;
    setNeedCropUpdate(): void;
    Scale(scale: number, px: number, py: number, dx: number, dy: number): void;
    Rotate(angle: number): void;
    Bright(bright: number): void;
    protected Draw(): void;
    private DrawLines;
    private DrawPolygon;
    Blur(x: any, y: any, wh: any): void;
    UnBlur(x: any, y: any, wh: any): void;
    private ChangeBright;
    private RGBtoHSB;
    private HSBtoRGB;
    private UseBtn;
    private ChangeToolbar;
}
