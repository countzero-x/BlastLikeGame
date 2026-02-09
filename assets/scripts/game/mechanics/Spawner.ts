import { Board } from "../Board";
import { SuperTile } from "../SuperTile";
import { SuperTileType } from "../enums/SuperTileType";
import { Tile } from "../Tile";
import { TileColor } from "../enums/TileColor";

export class Spawner {

    public fillWithRegularTiles(board: Board) {
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                if (board.getTile(x, y) == null || board.getTile(x, y).isEmpty) {
                    const tile = this.createRandomRegularTile(x, y);
                    board.setTile(x, y, tile);
                }
            }
        }
    }

    public createRandomRegularTile(x: number, y: number): Tile {
        // todo: более гибко
        const color = Math.floor(Math.random() * 5);
        return new Tile(x, y, color);
    }

    public createSuperTile(x: number, y: number, type: SuperTileType): SuperTile {
        return new SuperTile(x, y, TileColor.SPECIAL, type);
    }

    public createRegularTile(x: number, y: number, color: TileColor): Tile {
        return new Tile(x, y, color);
    }
}
