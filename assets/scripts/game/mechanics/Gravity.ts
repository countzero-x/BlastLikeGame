import { Board } from "./Board";
import { TileColor } from "../enums/TileColor";
import { Tile } from "../views/Tile";

export class Gravity {
    public applyGravity(board: Board): void {
        for (let x = 0; x < board.width; x++) {
            const tiles: Tile[] = [];

            for (let y = 0; y < board.height; y++) {
                const tile = board.getTile(x, y);

                if (tile && !tile.isEmpty) {
                    tiles.push(tile);
                }
            }

            for (let i = 0; i < tiles.length; i++) {
                const tile = tiles[i];
                tile.y = i;
                board.setTile(x, i, tile);
            }

            for (let y = tiles.length; y < board.height; y++) {
                board.setTile(x, y, new Tile(x, y, TileColor.EMPTY));
            }
        }
    }
}