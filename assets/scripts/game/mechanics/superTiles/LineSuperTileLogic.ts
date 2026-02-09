import { SuperTileType } from "../../enums/SuperTileType";
import { Tile } from "../../Tile";
import { Board } from "../Board";
import { SuperTile } from "./SuperTile";
import { SuperTileLogic } from "./SuperTileLogic";

export class LineSuperTileLogic implements SuperTileLogic {
    public readonly type: SuperTileType;

    constructor(isHorizontal: boolean) {
        this.type = isHorizontal ? SuperTileType.HORIZONTAL : SuperTileType.VERTICAL;
    }

    public activate(superTile: SuperTile, board: Board): Tile[] {
        const tiles: Tile[] = [];
        const range = this.type == SuperTileType.HORIZONTAL ? board.width : board.height;

        for (let i = 0; i < range; i++) {
            const coord1 = this.type == SuperTileType.HORIZONTAL ? i : superTile.x;
            const coord2 = this.type == SuperTileType.HORIZONTAL ? superTile.y : i;

            const tile = board.getTile(coord1, coord2);

            if (tile && !tile.isEmpty) {
                tiles.push(tile);
            }
        }
        return tiles;
    }
}
