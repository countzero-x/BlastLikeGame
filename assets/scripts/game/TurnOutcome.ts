import { GameState } from "./enums/GameState";
import { TileMove } from "./mechanics/Gravity";
import { SuperTile } from "./mechanics/superTiles/SuperTile";
import { Tile } from "./Tile";


export interface TurnOutcome {
    movements: Array<TileMove>;
    removedTiles: Array<Tile>;
    initialMatchCount: number;
    consumedMove: boolean;
    superTile: SuperTile | null;
    newTiles: Array<Tile>;
    shuffleRequired: boolean;
    state: GameState;
}
