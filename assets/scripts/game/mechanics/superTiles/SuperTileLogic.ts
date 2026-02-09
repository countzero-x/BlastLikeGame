import { SuperTileType } from "../../enums/SuperTileType";
import { Tile } from "../../Tile";
import { Board } from "../Board";
import { SuperTile } from "./SuperTile";


export interface SuperTileLogic {
    readonly type: SuperTileType;
    activate(superTile: SuperTile, board: Board): Tile[];
}
