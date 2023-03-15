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
    container: JQuery;
    btn_rotate: JQuery;
    btn_crop: JQuery;
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
    constructor();
    Scale(scale: number): void;
    Rotate(angle: number): void;
    protected Draw(): void;
    private Move;
}
