/// <reference types="jquery" />
/// <reference types="jquery" />
/// <reference types="jqueryui" />
declare namespace Functions {
    function blur(imageData: any, width: any, height: any, radius: any): void;
}
import MouseMoveEvent = JQuery.MouseMoveEvent;
declare const TO_RADIANS: number;
declare enum States {
    None = 0,
    Ready = 1,
    Crop = 2,
    Rotate = 3,
    Blur = 4,
    Bright = 5
}
declare class Editor {
    canvas: JQuery<HTMLCanvasElement>;
    context: CanvasRenderingContext2D;
    orig: HTMLCanvasElement;
    orig_ctx: CanvasRenderingContext2D;
    image: HTMLCanvasElement;
    image_ctx: CanvasRenderingContext2D;
    buffer: ImageData;
    canvas_container: JQuery;
    top_container: JQuery;
    btn_container: JQuery;
    btn_rotate: JQuery;
    btn_crop: JQuery;
    btn_blur: JQuery;
    btn_bright: JQuery;
    btn_scale: JQuery;
    btn_reset: JQuery;
    toolbar: JQuery;
    tool_rotate: JQuery;
    tool_blur: JQuery;
    brush1: JQuery;
    brush2: JQuery;
    brush3: JQuery;
    brush4: JQuery;
    tool_bright: JQuery;
    touch: JQuery;
    state: number;
    scale: number;
    wh: number;
    width: number;
    height: number;
    angle: number;
    mouse_angle_from: number;
    mouse_angle: number;
    rotate_x: number;
    rotate_y: number;
    left: number;
    bright_percent: number;
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
    Scale(scale: number, px: number, py: number, dx: number, dy: number): void;
    Rotate(angle: number): void;
    protected Draw(): void;
    private Move;
    private DrawPolygon;
    private Blur;
    private UnBlur;
    private ChangeBright;
    private RGBtoHSB;
    private HSBtoRGB;
    private UseBtn;
    private ChangeToolbar;
}
