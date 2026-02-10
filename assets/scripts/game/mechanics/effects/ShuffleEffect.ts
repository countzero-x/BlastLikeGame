import { Tile } from "../../Tile";
import { TurnEffect } from "../Board";

export class ShuffleEffect implements TurnEffect {
    public tilesToShuffle: Array<Tile>;
}