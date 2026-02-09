import { Board } from "./Board";
import { Tile } from "./Tile";
import { TileColor } from "./TileColor";


export class Spawner {

    public generate(board: Board) {
        board.clear();
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                const tile = this.createRandomTile(x, y);
                board.setTile(x, y, tile);
            }
        }
    }

    public createRandomTile(x: number, y: number): Tile {
        // todo: более гибко
        const color = Math.floor(Math.random() * 5);
        return new Tile(x, y, color);
    }

    public createTile(x: number, y: number, color: TileColor): Tile {
        return new Tile(x, y, color);
    }
}
