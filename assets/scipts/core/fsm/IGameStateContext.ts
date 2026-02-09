import { Board } from "../blast/Board";
import { Score } from "../blast/Score";
import { Tile } from "../blast/Tile";

export interface IGameStateContext {
    board: Board,
    tilesSelected: Tile[]
}
