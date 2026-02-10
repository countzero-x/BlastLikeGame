import { Board } from "./Board";
import { SuperTileType } from "../enums/SuperTileType";
import { TileColor } from "../enums/TileColor";
import { Tile } from "../Tile";
import { SuperTile } from "./superTiles/SuperTile";

export class Spawner {

    private avaliableColors = Array<TileColor>();

    public register(color: TileColor) {
        this.avaliableColors.push(color);
    }

    public fillWithRegularTiles(board: Board): Array<Tile> {
        const tilesUpdated = new Array<Tile>();

        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                if (board.getTile(x, y) == null || board.getTile(x, y).isEmpty) {
                    const tile = this.createRandomRegularTile(x, y);
                    board.setTile(x, y, tile);
                    tilesUpdated.push(tile);
                }
            }
        }

        return tilesUpdated;
    }

    public createRandomRegularTile(x: number, y: number): Tile {
        const color = Math.floor(Math.random() * this.avaliableColors.length);
        return new Tile(x, y, color);
    }

    public createSuperTile(x: number, y: number, type: SuperTileType): SuperTile {
        return new SuperTile(x, y, TileColor.SPECIAL, type);
    }

    public createRegularTile(x: number, y: number, color: TileColor): Tile {
        return new Tile(x, y, color);
    }
}
