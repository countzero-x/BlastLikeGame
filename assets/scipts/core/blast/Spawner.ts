import { Board } from "./Board";
import { Tile } from "./Tile";
import { TileColor } from "./TileColor";


export class Spawner {

    public generate(board: Board) {
        for (let x = 0; x < board.width; x++) {
            const emptyPositions: number[] = [];

            for (let y = board.height - 1; y >= 0; y--) {
                const tile = board.getTile(x, y);
                if (tile && tile.isEmpty) {
                    emptyPositions.push(y);
                    const newTile = this.createRandomTile(x, y);
                    board.setTile(x, y, newTile)
                }
            }
        }
    }

    public createRandomTile(x: number, y: number): Tile {
        // todo: более гибко
        const color = Math.floor(Math.random() * Object.keys(TileColor).length);
        return new Tile(x, y, color);
    }

    public createTile(x: number, y: number, color: TileColor): Tile {
        return new Tile(x, y, color);
    }
}
