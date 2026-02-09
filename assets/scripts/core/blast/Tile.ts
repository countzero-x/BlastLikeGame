import { Board } from "./Board";
import { TileColor } from "./TileColor";

export class Tile {
    x: number;
    y: number;
    color: TileColor;

    constructor(x: number, y: number, color: TileColor) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    get isEmpty(): boolean {
        return this.color === TileColor.EMPTY;
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
}