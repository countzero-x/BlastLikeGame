import { GameEvent } from "../GameEvent";
import { GameState } from "./enums/GameState";
import { InputState } from "./enums/InputState";
import { SuperTileType } from "./enums/SuperTileType";
import { Board } from "./mechanics/Board";
import { Boosters } from "./mechanics/Boosters";
import { BoosterContext } from "./mechanics/boosters/IBooster";
import { Gravity } from "./mechanics/Gravity";
import { Matches } from "./mechanics/Matches";
import { Moves } from "./mechanics/Moves";
import { Score } from "./mechanics/Score";
import { Shuffle } from "./mechanics/Shuffle";
import { Spawner } from "./mechanics/Spawner";
import { SuperTiles } from "./mechanics/superTiles/SuperTiles";
import { SuperTile } from "./mechanics/superTiles/SuperTile";
import { Tile } from "./Tile";

type TurnOutcome = {
    removedCount: number;
    initialMatchCount: number;
    consumedMove: boolean;
};

export class BlastGame {
    public inputState: InputState = InputState.NORMAL;
    public state: GameState = GameState.IDLE;

    public readonly board: Board;
    public readonly score: Score;
    public readonly moves: Moves;
    public readonly spawner: Spawner;
    public readonly shuffle: Shuffle;
    public readonly matches: Matches;
    public readonly gravity: Gravity;
    public readonly superTiles: SuperTiles;
    public readonly boosters: Boosters;

    public readonly stateChanged = new GameEvent<GameState>();

    constructor(
        board: Board,
        score: Score,
        moves: Moves,
        spawner: Spawner,
        shuffle: Shuffle,
        matches: Matches,
        gravity: Gravity,
        superTiles: SuperTiles,
        boosters: Boosters,
    ) {
        this.board = board;
        this.score = score;
        this.moves = moves;
        this.spawner = spawner;
        this.shuffle = shuffle;
        this.matches = matches;
        this.gravity = gravity;
        this.superTiles = superTiles;
        this.boosters = boosters;

        this.boosters.setContext({
            board: this.board,
            setInputState: this.setInputState.bind(this),
        });
    }

    public getState() {
        return this.state;
    }

    public getInputState() {
        return this.inputState;
    }

    public start() {
        this.inputState = InputState.NORMAL;
        this.shuffleBoard();
        if (this.state !== GameState.LOSE) this.setState(GameState.IDLE);
    }

    public finish() {
        this.reset();
    }

    public makeMove(x: number, y: number) {
        if (this.state !== GameState.IDLE) {
            return;
        }

        const tile = this.board.getTile(x, y);
        if (!tile || tile.isEmpty) {
            return;
        }

        this.processTurn(tile);
    }

    private reset() {
        this.inputState = InputState.NORMAL;
        this.score.reset();
        this.moves.reset();
        this.boosters.reset();
        this.board.clear();
    }

    private processTurn(clicked: Tile) {
        const outcome =
            this.inputState == InputState.NORMAL
                ? this.applyNormalClick(clicked)
                : this.applyBoosterClick(clicked);

        this.shuffleBoard();
        this.setState(GameState.REMOVING_TILES);

        if (outcome.removedCount > 0) {
            this.score.addScore(this.score.calculateScore(outcome.removedCount));
            if (outcome.consumedMove) this.moves.decrementMove();
        }

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

    private applyNormalClick(clicked: Tile): TurnOutcome {
        const match = this.matches.getAvaliableMatch(this.board, clicked.x, clicked.y);
        const initialMatchCount = match.length;

        const toRemove = (clicked instanceof SuperTile)
            ? [...match, clicked]
            : [...match];

        const removedCount = this.removeWithSuperCascade(toRemove);

        this.trySpawnSuperTile(clicked.x, clicked.y, initialMatchCount);

        return { removedCount, initialMatchCount, consumedMove: removedCount > 0 };
    }

    private applyBoosterClick(clicked: Tile): TurnOutcome {
        const toRemove = this.boosters.processClick(clicked);
        const removedCount = this.removeWithSuperCascade(toRemove);

        return { removedCount, initialMatchCount: 0, consumedMove: false };
    }

    private removeWithSuperCascade(initial: Tile[]): number {
        const queue: Tile[] = [...initial];
        const removed = new Set<Tile>();

        while (queue.length > 0) {
            const tile = queue.shift()!;
            if (!tile || removed.has(tile)) {
                continue
            };

            removed.add(tile);
            this.board.removeTile(tile);

            if (tile instanceof SuperTile) {
                const extra = this.superTiles.activate(tile, this.board);
                for (const e of extra) {
                    queue.push(e);
                }
            }
        }

        return removed.size;
    }

    private trySpawnSuperTile(x: number, y: number, initialRemovedCount: number) {
        const superType = this.superTiles.GetSuperTileType(initialRemovedCount);
        if (superType == SuperTileType.NONE) {
            return;
        }

        const superTile = this.spawner.createSuperTile(x, y, superType);
        this.board.setTile(x, y, superTile);
    }

    private shuffleBoard() {
        this.shuffle.reset();

        this.gravity.applyGravity(this.board);
        this.setState(GameState.APPLYING_GRAVITY);

        this.spawner.fillWithRegularTiles(this.board);
        this.setState(GameState.SPAWNING_TILES);

        for (let attempt = 0; attempt < this.shuffle.attempts; attempt++) {
            if (this.matches.hasAvailableMatches(this.board)) {
                return;
            };
            this.shuffle.shuffle(this.board);
            this.setState(GameState.SHUFFLING);
        }

        if (!this.matches.hasAvailableMatches(this.board)) {
            this.setState(GameState.LOSE);
        }
    }

    private setState(state: GameState) {
        this.state = state;
        this.stateChanged.invoke(this.state);
    }

    private setInputState(state: InputState) {
        this.inputState = state;
    }
}
