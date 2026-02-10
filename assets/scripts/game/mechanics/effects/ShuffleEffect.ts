import { Tile } from "../../Tile";
import { TurnEffect } from "../TurnEffect";

export class ShuffleEffect implements TurnEffect {
    public tilesToShuffle: Array<Tile>;
}