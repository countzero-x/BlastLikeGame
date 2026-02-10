import { Tile } from "../../Tile";
import { TurnEffect } from "../TurnEffect";
import { SuperTile } from "../superTiles/SuperTile";


export class SuperTileSpawnEffect implements TurnEffect {
    public superTile: SuperTile;
}
