import { GameState } from "./enums/GameState";
import { InputState } from "./enums/InputState";
import { TileMove } from "./mechanics/Gravity";
import { SuperTile } from "./mechanics/superTiles/SuperTile";
import { Tile } from "./Tile";


export interface TurnOutcome {
    movements: Array<TileMove>;
    selectedTile: Tile | null;
    removedTiles: Array<Tile>;
    initialMatchCount: number;
    consumedMove: boolean;
    superTile: SuperTile | null;
    newTiles: Array<Tile>;
    shuffleRequired: boolean;
    state: GameState;
    inputState: InputState;
}
