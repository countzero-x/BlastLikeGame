import { Tile } from "../../Tile";
import { TurnEffect } from "../Board";


export class ShakeEffect implements TurnEffect {
    public tileToShake: Tile;
}
