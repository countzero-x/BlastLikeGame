import { GameState } from "../fsm/GameState";
import { Board } from "./Board";
import { GameConfig } from "./GameConfig";
import { Gravity } from "./Gravity";
import { Matches } from "./Matches";
import { Moves } from "./Moves";
import { MyEvent } from "./MyEvent";
import { Score } from "./Score";
import { Shuffle } from "./Shuffle";
import { Spawner } from "./Spawner";
import { Tile } from "./Tile";
import { TileColor } from "./TileColor";

export class BlastGame {
    // todo не паблик
    public _state: GameState;
    public _board: Board;
    public _score: Score;
    public _moves: Moves;
    public _spawner: Spawner;
    public _shuffle: Shuffle;
    public _matches: Matches;
    public _gravity: Gravity;

    public stateChanged: MyEvent<GameState> = new MyEvent<GameState>();

    private selectedTile: Tile

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
        this.fillEmptySpaces();
        this.setState(GameState.IDLE);
    }

    public finish() {
        this.reset();
    }

    private reset() {
        this._score.reset();
        this._moves.reset();
    }

    private fillEmptySpaces() {
        this._spawner.generate(this._board);

        if (!this._matches.hasAvailableMoves(this._board)) {
            if (this._shuffle.shuffleAvaliable()) {
                this.setState(GameState.SHUFFLING);
                this._shuffle.shuffle(this._board);
            } else {
                // this.lose();
            }
        }
    }

    public makeMove(x: number, y: number) {
        if (this._state != GameState.IDLE) {
            return;
        }

        const tile = this._board.getTile(x, y);
        if (!tile || tile.isEmpty) {
            return;
        }

        this.selectedTile = tile;

        this.updateTurn();
    }

    private updateTurn() {
        for (let x = 0; x < this._board.width; x++) {
            for (let y = 0; y < this._board.height; y++) {
                console.log()
            }
        }

        let tilesRemoved = new Array<Tile>();

        if (this.selectedTile != null) {
            tilesRemoved = this._matches.findConnectedGroup(this._board, this.selectedTile.x, this.selectedTile.y);
            this.selectedTile = null;
        }

        if (tilesRemoved.length > 0) {
            this.setState(GameState.REMOVING_TILES);
            for (var tileRemoved of tilesRemoved) {
                this._board.removeTile(tileRemoved);
            }
        }

        this.setState(GameState.APPLYING_GRAVITY);
        this._gravity.applyGravity(this._board);

        const scoreGained = this._score.calculateScore(tilesRemoved.length);
        this._score.addScore(scoreGained);

        this._moves.decrementMove();

        this.setState(GameState.SPAWNING_TILES);
        this.fillEmptySpaces();

        if (this._score.hasReachedTarget()) {
            this.setState(GameState.WIN);
            return;
        }

        if (!this._moves.hasMovesLeft()) {
            this.setState(GameState.GAME_OVER);
            return;
        }

        this.setState(GameState.IDLE);
    }

    private setState(state: GameState) {
        this._state = state;
        this.stateChanged.invoke(this._state);
    }
}