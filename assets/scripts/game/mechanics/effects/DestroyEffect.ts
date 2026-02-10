import { Tile } from "../../Tile";
import { TurnEffect } from "../Board";


export class DestroyEffect implements TurnEffect {
    public tilesToRemove: Array<Tile>;
}
