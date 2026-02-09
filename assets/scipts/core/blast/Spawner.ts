import { Board } from "./Board";
import { Tile } from "./Tile";
import { TileColor } from "./TileColor";


export class Spawner {
    private _board: Board;

    public constructor(board: Board) {
        this._board = board;
    }

    public generate(): Tile[] {
        const newTiles: Tile[] = [];

        for (let x = 0; x < this._board.width; x++) {
            const emptyPositions: number[] = [];

            for (let y = this._board.height - 1; y >= 0; y--) {
                const tile = this._board.getTile(x, y);
                if (tile && tile.isEmpty) {
                    emptyPositions.push(y);
                    const newTile = this.createRandomTile(x, y);
                    newTiles.push(newTile);
                }
            }
        }

        return newTiles;
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
