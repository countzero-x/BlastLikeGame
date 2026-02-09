import { Board } from "./Board";
import { GameConfig } from "./GameConfig";
import { Moves } from "./Moves";
import { Score } from "./Score";
import { Spawner } from "./Spawner";

export class BlastGame {
    private _board: Board;
    private _score: Score;
    private _moves: Moves;
    private _spawner: Spawner;

    public init() {
        this._board = new Board(GameConfig.DEFAULT_BOARD_WIDTH, GameConfig.DEFAULT_BOARD_HEIGHT);
        this._score = new Score(GameConfig.TARGET_SCORE, GameConfig.SCORE_FOR_TILE);
        this._moves = new Moves(GameConfig.MAX_MOVES);
        this._spawner = new Spawner(this._board);
    }

    public start() {
        this._score.reset();
        this._moves.reset();
        this._spawner.generate();
    }

    public finish() {

    }
}
