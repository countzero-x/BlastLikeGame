import { Tile } from "../../Tile";
import { TurnEffect } from "../Board";
import { SuperTile } from "../superTiles/SuperTile";


export class SuperTileSpawnEffect implements TurnEffect {
    public superTile: SuperTile;
}
