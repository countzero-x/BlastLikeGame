import { Tile } from "../../Tile";
import { TurnEffect } from "../Board";

export class TileSpawnEffect implements TurnEffect {
    public tilesToSpawn: Array<Tile>;
}
