import { Board } from "./mechanics/Board";
import { Boosters } from "./mechanics/Boosters";
import { GameState } from "./enums/GameState";
import { Gravity } from "./mechanics/Gravity";
import { InputState } from "./enums/InputState";
import { Matches } from "./mechanics/Matches";
import { Moves } from "./mechanics/Moves";
import { GameEvent } from "../GameEvent";
import { Score } from "./mechanics/Score";
import { Shuffle } from "./mechanics/Shuffle";
import { Spawner } from "./mechanics/Spawner";
import { SuperTiles } from "./mechanics/SuperTiles";
import { SuperTileType } from "./enums/SuperTileType";
import { SuperTile } from "./views/SuperTile";
import { Tile } from "./views/Tile";

export class BlastGame {
    // todo не паблик
    public inputState: InputState;
    public state: GameState;

    public board: Board;
    public score: Score;
    public moves: Moves;
    public spawner: Spawner;
    public shuffle: Shuffle;
    public matches: Matches;
    public gravity: Gravity;
    public superTiles: SuperTiles;
    public boosters: Boosters;

    public stateChanged: GameEvent<GameState> = new GameEvent<GameState>();

    public start() {
        this.inputState = InputState.NORMAL;
        this.updateBoard();

        if (this.state != GameState.LOSE) {
            this.setState(GameState.IDLE);
        }
    }

    public finish() {
        this.reset();
    }

    private reset() {
        this.inputState = InputState.NORMAL;

        this.score.reset();
        this.moves.reset();
        this.boosters.reset();
        this.board.clear();
    }

    public makeMove(x: number, y: number) {
        if (this.state != GameState.IDLE) {
            return;
        }

        const tile = this.board.getTile(x, y);
        if (!tile || tile.isEmpty) {
            return;
        }

        this.updateTurn(tile);
    }

    private updateBoard() {
        this.shuffle.reset();

        this.gravity.applyGravity(this.board);
        this.setState(GameState.APPLYING_GRAVITY);

        this.spawner.fillWithRegularTiles(this.board);
        this.setState(GameState.SPAWNING_TILES);

        for (let attempt = 0; attempt < this.shuffle.attempts; attempt++) {
            if (!this.matches.hasAvailableMatches(this.board)) {
                this.shuffle.shuffle(this.board);
                this.setState(GameState.SHUFFLING);
            }
            else {
                break;
            }
        }

        if (!this.matches.hasAvailableMatches(this.board)) {
            this.setState(GameState.LOSE);
        }
    }

    private updateTurn(tile: Tile) {
        if (tile == null) {
            return;
        }

        const tilesRemoved = new Array<Tile>();

        if (this.inputState == InputState.NORMAL) {
            tilesRemoved.push(...this.matches.getAvaliableMatch(this.board, tile.x, tile.y));
            const initialRemovedCount = tilesRemoved.length;

            if (tile instanceof SuperTile) {
                tilesRemoved.push(tile);
            }

            for (let i = 0; i < tilesRemoved.length; i++) {
                const tileRemoved = tilesRemoved[i];

                this.board.removeTile(tileRemoved);

                if (tileRemoved instanceof SuperTile) {
                    tilesRemoved.push(...this.superTiles.activate(tileRemoved, this.board));
                }
            }

            const superTileType = this.superTiles.GetSuperTileType(initialRemovedCount);
            if (superTileType != SuperTileType.NONE) {
                const superTile = this.spawner.createSuperTile(tile.x, tile.y, superTileType);
                this.board.setTile(tile.x, tile.y, superTile);
            }

            if (tilesRemoved.length > 0) {
                const scoreGained = this.score.calculateScore(tilesRemoved.length);
                this.score.addScore(scoreGained);
                this.moves.decrementMove();
            }
        }
        else {
            tilesRemoved.push(...this.boosters.processClick(this, tile));

            for (let i = 0; i < tilesRemoved.length; i++) {
                const tileRemoved = tilesRemoved[i];

                this.board.removeTile(tileRemoved);

                if (tileRemoved instanceof SuperTile) {
                    tilesRemoved.push(...this.superTiles.activate(tileRemoved, this.board));
                }
            }

            if (tilesRemoved.length > 0) {
                const scoreGained = this.score.calculateScore(tilesRemoved.length);
                this.score.addScore(scoreGained);
            }
        }

        this.updateBoard();
        this.setState(GameState.REMOVING_TILES);

        if (this.score.hasReachedTarget()) {
            this.setState(GameState.WIN);
            return;
        }

        if (!this.moves.hasMovesLeft()) {
            this.setState(GameState.LOSE);
            return;
        }

        this.setState(GameState.IDLE);
    }

    private setState(state: GameState) {
        this.state = state;
        this.stateChanged.invoke(this.state);
    }
}