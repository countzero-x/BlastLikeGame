import { Tile } from "../../Tile";
import { TurnEffect } from "../TurnEffect";

export class SwapEffect implements TurnEffect {
    left: Tile;
    right: Tile;
}