import { SuperTileType } from "../../enums/SuperTileType";
import { Tile } from "../../Tile";
import { Board } from "../Board";
import { SuperTile } from "./SuperTile";
import { SuperTileLogic } from "./SuperTileLogic";

export class MaxBombSuperTileLogic implements SuperTileLogic {
    public readonly type = SuperTileType.MAX_BOMB;

    public activate(superTile: SuperTile, board: Board): Tile[] {
        const tiles: Tile[] = [];
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                const tile = board.getTile(x, y);
                if (tile && !tile.isEmpty) {
                    tiles.push(tile);
                }
            }
        }
        return tiles;
    }
}
