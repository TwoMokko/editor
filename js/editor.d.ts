/// <reference types="jquery" />
/// <reference types="jquery" />
/// <reference types="jqueryui" />
declare const TO_RADIANS: number;
declare class Editor {
    canvas: JQuery<HTMLCanvasElement>;
    context: CanvasRenderingContext2D;
    image: JQuery<HTMLImageElement>;
    scale: number;
    wh: number;
    width: number;
    height: number;
    angle: number;
    mouse_x: number;
    mouse_y: number;
    constructor();
    Scale(scale: number): void;
    Rotate(angle: number): void;
    protected Draw(): void;
    private Move;
}
