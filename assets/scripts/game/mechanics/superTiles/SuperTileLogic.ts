import { SuperTileType } from "./SuperTileType";
import { Tile } from "../../Tile";
import { Board } from "../Board";
import { SuperTile } from "./SuperTile";
import { TurnClickProcessor } from "../../TurnProcessor";

export interface SuperTileLogic extends TurnClickProcessor {
    readonly type: SuperTileType;
    activate(superTile: SuperTile, board: Board): Tile[];
}
