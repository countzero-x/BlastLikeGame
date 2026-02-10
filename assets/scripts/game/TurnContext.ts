import { GameState } from "./enums/GameState";
import { InputState } from "./enums/InputState";
import { Board, TurnEffect } from "./mechanics/Board";
import { Matches } from "./mechanics/Matches";
import { Spawner } from "./mechanics/Spawner";
import { Tile } from "./Tile";

export interface TurnContext {
    state: GameState;
    inputState: InputState;
    selectedTile: Tile,
    spawner: Spawner;
    board: Board;
    matches: Matches;
    initialRemovedCount: number;
    tilesToRemove: Set<Tile>;
    tilesToCreate: Set<Tile>;
}
