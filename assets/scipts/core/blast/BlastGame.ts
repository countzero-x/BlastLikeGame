import { GameState } from "../fsm/GameState";
import { Board } from "./Board";
import { GameConfig } from "./GameConfig";
import { Gravity } from "./Gravity";
import { Matches } from "./Matches";
import { Moves } from "./Moves";
import { Score } from "./Score";
import { Shuffle } from "./Shuffle";
import { Spawner } from "./Spawner";

export class BlastGame {
    private state: GameState;
    private _board: Board;
    private _score: Score;
    private _moves: Moves;
    private _spawner: Spawner;
    private _shuffle: Shuffle;
    private _matches: Matches;
    private _gravity: Gravity;

    public init() {
        this._board = new Board(GameConfig.DEFAULT_BOARD_WIDTH, GameConfig.DEFAULT_BOARD_HEIGHT);
        this._score = new Score(GameConfig.TARGET_SCORE, GameConfig.SCORE_FOR_TILE);
        this._moves = new Moves(GameConfig.MAX_MOVES);
        this._shuffle = new Shuffle(GameConfig.MAX_SHUFFLES);
        this._spawner = new Spawner();
        this._matches = new Matches();
        this._gravity = new Gravity();
    }

    public start() {
        this.reset();
        this.fillEmptySpaces();
    }

    public finish() {
        this.reset();
    }

    private reset() {
        this._score.reset();
        this._moves.reset();
        this.state = GameState.SPAWNING_TILES;
    }

    private fillEmptySpaces() {
        this._spawner.generate(this._board);

        if (!this._matches.hasAvailableMoves(this._board)) {
            if (this._shuffle.shuffleAvaliable()) {
                this.state = GameState.SHUFFLING;
                this._shuffle.shuffle(this._board);
            } else {
                this.lose();
            }
        }
    }

    public makeMove(x: number, y: number) {
        if (this.state != GameState.IDLE) {
            return;
        }

        const tile = this._board.getTile(x, y);
        if (!tile || tile.isEmpty) {
            return;
        }

        let tilesRemoved = this._matches.findConnectedGroup(this._board, x, y);

        if (tilesRemoved.length === 0) {
            return {
                success: false,
                tilesRemoved: [],
                scoreGained: 0
            };
        }

        for (var tileRemoved of tilesRemoved) {
            this._board.removeTile(tileRemoved);
        }

        this._gravity.applyGravity(this._board);
        const scoreGained = this._score.calculateScore(tilesRemoved.length);
        this._score.addScore(scoreGained);
        this._moves.decrementMove();

        this.checkGameConditions();

        this.fillEmptySpaces();
    }

    private checkGameConditions() {
        if (this._score.hasReachedTarget()) {
            this.win();
            return;
        }

        if (!this._moves.hasMovesLeft()) {
            this.lose();
            return;
        }
    }

    private win() {
        this.state = GameState.WIN;
    }

    private lose() {
        this.state = GameState.GAME_OVER;
    }
}