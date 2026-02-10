import { Tile } from "../../Tile";
import { TurnEffect } from "../TurnEffect";


export class TeleportSelectEffect implements TurnEffect {
    public selectedTile: Tile;
}
