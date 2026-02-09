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
import { SuperTile } from "./SuperTile";
import { SuperTiles } from "./SuperTiles";
import { SuperTileType } from "./SuperTileType";
import { Tile } from "./Tile";

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
    public _superTiles: SuperTiles

    public stateChanged: MyEvent<GameState> = new MyEvent<GameState>();

    public init() {
        this._board = new Board(GameConfig.DEFAULT_BOARD_WIDTH, GameConfig.DEFAULT_BOARD_HEIGHT);
        this._score = new Score(GameConfig.TARGET_SCORE, GameConfig.SCORE_FOR_TILE);
        this._moves = new Moves(GameConfig.MAX_MOVES);
        this._shuffle = new Shuffle(GameConfig.MAX_SHUFFLES);
        this._spawner = new Spawner();
        this._matches = new Matches();
        this._gravity = new Gravity();
        this._superTiles = new SuperTiles();
    }

    public start() {
        this.updateBoard();
    }

    public finish() {
        this.reset();
    }

    private reset() {
        this._score.reset();
        this._moves.reset();
        this._board.clear();
    }

    public makeMove(x: number, y: number) {
        if (this._state != GameState.IDLE) {
            return;
        }

        const tile = this._board.getTile(x, y);
        if (!tile || tile.isEmpty) {
            return;
        }

        this.updateTurn(tile);
    }

    private updateBoard() {
        this._shuffle.reset();

        this._gravity.applyGravity(this._board);
        this.setState(GameState.APPLYING_GRAVITY);

        this._spawner.fillWithRegularTiles(this._board);
        this.setState(GameState.SPAWNING_TILES);

        for (let attempt = 0; attempt < this._shuffle.attempts; attempt++) {
            if (!this._matches.hasAvailableMoves(this._board)) {
                this._shuffle.shuffle(this._board);
                this.setState(GameState.SHUFFLING);
            }
            else {
                break;
            }
        }

        if (!this._matches.hasAvailableMoves(this._board)) {
            this.setState(GameState.LOSE);
        }
        else {
            //todo: некорректно т.к. дальше может быть луз и т.д.
            this.setState(GameState.IDLE);
        }
    }

    private updateTurn(tile: Tile) {
        if (tile == null) {
            return;
        }

        const tilesRemoved = new Array<Tile>();
        tilesRemoved.push(tile);

        tilesRemoved.push(...this._matches.findConnectedGroup(this._board, tile.x, tile.y));
        const initialRemovedCount = tilesRemoved.length;

        if (tilesRemoved.length == 0) {
            return;
        }

        for (let i = 0; i < tilesRemoved.length; i++) {
            const tileRemoved = tilesRemoved[i];

            this._board.removeTile(tileRemoved);

            if (tileRemoved instanceof SuperTile) {
                tilesRemoved.push(...this._superTiles.activate(tileRemoved, this._board));
            }
        }

        // todo что сначала удалить или активировтаь
        // tileRemoved.activate(this._board);
        this.setState(GameState.REMOVING_TILES);

        const superTileType = this._superTiles.GetSuperTileType(initialRemovedCount);
        if (superTileType != SuperTileType.NONE) {
            const superTile = this._spawner.createSuperTile(tile.x, tile.y, superTileType);
            this._board.setTile(tile.x, tile.y, superTile);
        }

        this.updateBoard();

        const scoreGained = this._score.calculateScore(tilesRemoved.length);
        this._score.addScore(scoreGained);

        this._moves.decrementMove();

        if (this._score.hasReachedTarget()) {
            this.setState(GameState.WIN);
            return;
        }

        if (!this._moves.hasMovesLeft()) {
            this.setState(GameState.LOSE);
            return;
        }

        this.setState(GameState.IDLE);
    }

    private setState(state: GameState) {
        this._state = state;
        this.stateChanged.invoke(this._state);
    }
}