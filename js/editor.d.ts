/// <reference types="jquery" />
/// <reference types="jquery" />
/// <reference types="jqueryui" />
declare const TO_RADIANS: number;
declare class Editor {
    btn: JQuery;
    canvas: JQuery<HTMLCanvasElement>;
    context: CanvasRenderingContext2D;
    image: JQuery<HTMLImageElement>;
    scale: number;
    wh: number;
    width: number;
    height: number;
    angle: number;
    constructor();
    Scale(scale: number): void;
    Rotate(angle: number): void;
    protected draw(): void;
    private Search;
}
