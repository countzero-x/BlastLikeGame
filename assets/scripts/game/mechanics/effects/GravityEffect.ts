import { TurnEffect } from "../Board";
import { TileMove } from "../Gravity";


export class GravityEffect implements TurnEffect {
    public moves: TileMove[];
}