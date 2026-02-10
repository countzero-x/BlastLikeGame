import { Tile } from "../../Tile";
import { TurnEffect } from "../TurnEffect";

export class TeleportDeselectEffect implements TurnEffect {
    public deselectedTile: Tile;
}