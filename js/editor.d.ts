/// <reference types="jquery" />
/// <reference types="jquery" />
/// <reference types="jqueryui" />
import MouseMoveEvent = JQuery.MouseMoveEvent;
declare const TO_RADIANS: number;
declare enum States {
    None = 0,
    Ready = 1,
    Crop = 2,
    Rotate = 3
}
declare class Editor {
    canvas: JQuery<HTMLCanvasElement>;
    context: CanvasRenderingContext2D;
    image: JQuery<HTMLImageElement>;
    btn_container: JQuery;
    btn_rotate: JQuery;
    btn_crop: JQuery;
    btn_scale: JQuery;
    btn_reset: JQuery;
    state: number;
    scale: number;
    scale_x: number;
    scale_y: number;
    wh: number;
    width: number;
    height: number;
    carry_x: number;
    carry_y: number;
    angle: number;
    mouse_angle_from: number;
    mouse_angle: number;
    rotate_x: number;
    rotate_y: number;
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
    Scale(scale: number): void;
    Rotate(angle: number): void;
    protected Draw(): void;
    private Move;
    private DrawPolygon;
    private UseBtn;
}
