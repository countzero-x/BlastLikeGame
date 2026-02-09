import { SuperTileType } from "../../enums/SuperTileType";
import { Tile } from "../../Tile";
import { Board } from "../Board";
import { SuperTile } from "./SuperTile";
import { SuperTileLogic } from "./SuperTileLogic";

export class RadiusBombSuperTileLogic implements SuperTileLogic {
    public readonly type = SuperTileType.RADIUS_BOMB;

    private readonly _bombRadius: number;

    constructor(bombRadius: number) {
        this._bombRadius = bombRadius;
    }

    public activate(superTile: SuperTile, board: Board): Tile[] {
        const tiles: Tile[] = [];
        for (let dx = -this._bombRadius; dx <= this._bombRadius; dx++) {
            for (let dy = -this._bombRadius; dy <= this._bombRadius; dy++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this._bombRadius) {
                    const tile = board.getTile(superTile.x + dx, superTile.y + dy);
                    if (tile && !tile.isEmpty) {
                        tiles.push(tile);
                    }
                }
            }
        }
        return tiles;
    }
}
