import { Tile } from "../../Tile";
import { TurnEffect } from "../TurnEffect";


export class DestroyEffect implements TurnEffect {
    public tilesToRemove: Array<Tile>;
}
