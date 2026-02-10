import { Tile } from "../../Tile";
import { TurnEffect } from "../TurnEffect";


export class ShakeEffect implements TurnEffect {
    public tileToShake: Tile;
}
