import { SuperTileType } from "./SuperTileType";
import { Tile } from "./Tile";
import { TileColor } from "./TileColor";

export class SuperTile extends Tile {
    type: SuperTileType;

    public constructor(x: number, y: number, color: TileColor, type: SuperTileType) {
        super(x, y, color);
        this.type = type;
    }
}
