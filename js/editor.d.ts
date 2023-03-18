/// <reference types="jquery" />
/// <reference types="jquery" />
/// <reference types="jqueryui" />
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
    state: number;
    scale: number;
    wh: number;
    width: number;
    height: number;
    angle: number;
    mouse_angle_from: number;
    mouse_angle: number;
    mouse_x: number;
    mouse_y: number;
    crop: [number, number, number, number];
    polygon: JQuery;
    pull_container: JQuery;
    crop_top: JQuery;
    crop_right: JQuery;
    crop_bottom: JQuery;
    crop_left: JQuery;
    crop_top_left: JQuery;
    crop_top_right: JQuery;
    crop_bot_right: JQuery;
    crop_bot_left: JQuery;
    crop_y: number;
    constructor();
    Scale(scale: number): void;
    Rotate(angle: number): void;
    protected Draw(): void;
    private Move;
    private DrawPolygon;
    private DrawPull;
    private MoveCrop;
    private UseBtn;
}
