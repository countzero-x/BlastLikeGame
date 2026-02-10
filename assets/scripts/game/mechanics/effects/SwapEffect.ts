import { Tile } from "../../Tile";
import { TurnEffect } from "../Board";

export class SwapEffect implements TurnEffect {
    left: Tile;
    right: Tile;
}