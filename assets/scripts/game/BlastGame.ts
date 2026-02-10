import { GameEvent } from "../GameEvent";
import { GameState } from "./enums/GameState";
import { InputState } from "./enums/InputState";
import { SuperTileType } from "./enums/SuperTileType";
import { Board } from "./mechanics/Board";
import { Boosters } from "./mechanics/Boosters";
import { Gravity } from "./mechanics/Gravity";
import { Input } from "./mechanics/Input";
import { Matches } from "./mechanics/Matches";
import { Moves } from "./mechanics/Moves";
import { Score } from "./mechanics/Score";
import { Shuffle } from "./mechanics/Shuffle";
import { Spawner } from "./mechanics/Spawner";
import { SuperTile } from "./mechanics/superTiles/SuperTile";
import { SuperTiles } from "./mechanics/superTiles/SuperTiles";
import { Tile } from "./Tile";
import { TurnOutcome } from "./TurnOutcome";

export class BlastGame {
    private _inputState: InputState = InputState.NORMAL;
    private _state: GameState = GameState.IDLE;
    private _lastTurnOutcome: TurnOutcome | null = null;

    public readonly input: Input;
    public readonly board: Board;
    public readonly score: Score;
    public readonly moves: Moves;
    public readonly spawner: Spawner;
    public readonly shuffle: Shuffle;
    public readonly matches: Matches;
    public readonly gravity: Gravity;
    public readonly superTiles: SuperTiles;
    public readonly boosters: Boosters;

    public readonly onStateChanged = new GameEvent<GameState>();
    public readonly onInputStateChanged = new GameEvent<InputState>();
    public readonly onMoveCompleted = new GameEvent<TurnOutcome>();

    constructor(
        input: Input,
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
        this.input = input;
        this.board = board;
        this.score = score;
        this.moves = moves;
        this.spawner = spawner;
        this.shuffle = shuffle;
        this.matches = matches;
        this.gravity = gravity;
        this.superTiles = superTiles;
        this.boosters = boosters;

        this._lastTurnOutcome = this.getEmptyTurnOutcome();

        this.boosters.setContext({
            board: this.board,
            setInputState: this.setInputState.bind(this),
            getInputState: this.getInputState.bind(this),
            inputStateChanged: this.onInputStateChanged
        });
    }

    public get lastTurnOutcome(): TurnOutcome {
        return this._lastTurnOutcome;
    }

    public get state(): GameState {
        return this._state;
    }

    public getInputState(): InputState {
        return this._inputState;
    }

    public start() {
        this.input.onTileClicked.subscribe(this.makeMove, this);

        this.setInputState(InputState.NORMAL);
        const initialUpdate = this.updateBoard();

        this._lastTurnOutcome = {
            state: GameState.IDLE,
            inputState: InputState.NORMAL,
            selectedTile: null,
            movements: [],
            removedTiles: [],
            initialMatchCount: 0,
            consumedMove: false,
            superTile: null,
            newTiles: initialUpdate.newTiles || [],
            shuffleRequired: false
        };

        this.onMoveCompleted.invoke(this.lastTurnOutcome);

        if (this._state !== GameState.LOSE) {
            this.setState(GameState.IDLE);
        }
    }

    public finish() {
        this.input.onTileClicked.unsubscribe(this.makeMove, this);
        this.reset();
    }

    public makeMove(pos: { x: number, y: number }) {
        if (!this.input.isEnabled) {
            return;
        }

        const tile = this.board.getTile(pos.x, pos.y);
        if (!tile || tile.isEmpty) {
            return;
        }

        this.processTurn(tile);
    }

    private reset() {
        this.setInputState(InputState.NORMAL);
        this._lastTurnOutcome = null;
        this.score.reset();
        this.moves.reset();
        this.boosters.reset();
        this.board.clear();
    }

    private processTurn(clicked: Tile): void {
        const outcome =
            this.getInputState() == InputState.NORMAL
                ? this.applyNormalClick(clicked)
                : this.applyBoosterClick(clicked);

        const boardOutcome = this.updateBoard();
        this.setState(GameState.REMOVING_TILES);

        if (outcome.removedTiles && outcome.removedTiles.length > 0) {
            this.score.addScore(this.score.calculateScore(outcome.removedTiles.length));
            if (outcome.consumedMove) this.moves.decrementMove();
        }

        let resultState = GameState.IDLE;

        if (this.score.hasReachedTarget()) {
            resultState = GameState.WIN;
        }

        if (!this.moves.hasMovesLeft()) {
            resultState = GameState.LOSE;
        }

        const turnOutcome: TurnOutcome = {
            state: resultState,
            inputState: this.getInputState(),
            selectedTile: clicked,
            movements: boardOutcome.movements || [],
            removedTiles: outcome.removedTiles || [],
            initialMatchCount: outcome.initialMatchCount || 0,
            consumedMove: outcome.consumedMove || false,
            superTile: outcome.superTile || null,
            newTiles: boardOutcome.newTiles || [],
            shuffleRequired: outcome.shuffleRequired
        };
        this._lastTurnOutcome = turnOutcome;

        this.onMoveCompleted.invoke(this._lastTurnOutcome);
    }

    private applyNormalClick(clicked: Tile): Partial<TurnOutcome> {
        const match = this.matches.getAvaliableMatch(this.board, clicked.x, clicked.y);
        const initialMatchCount = match.length;

        const toRemove = (clicked instanceof SuperTile)
            ? [...match, clicked]
            : [...match];

        const removedTiles = this.removeTiles(toRemove);

        const superTile = this.trySpawnSuperTile(clicked.x, clicked.y, initialMatchCount);

        return {
            removedTiles: Array.from(removedTiles),
            initialMatchCount,
            consumedMove: removedTiles.size > 0,
            superTile: superTile
        };
    }

    private applyBoosterClick(clicked: Tile): Partial<TurnOutcome> {
        const toRemove = this.boosters.processClick(clicked);
        const removedTiles = this.removeTiles(toRemove);

        return {
            removedTiles: Array.from(removedTiles),
            initialMatchCount: 0,
            consumedMove: false
        };
    }

    private removeTiles(initial: Tile[]): Set<Tile> {
        const queue: Tile[] = [...initial];
        const removed = new Set<Tile>();

        while (queue.length > 0) {
            const tile = queue.shift()!;
            if (!tile || removed.has(tile)) {
                continue;
            }

            removed.add(tile);
            this.board.removeTile(tile);

            if (tile instanceof SuperTile) {
                const extra = this.superTiles.activate(tile, this.board);
                for (const e of extra) {
                    queue.push(e);
                }
            }
        }

        return removed;
    }

    private trySpawnSuperTile(x: number, y: number, initialRemovedCount: number): SuperTile | null {
        const superType = this.superTiles.GetSuperTileType(initialRemovedCount);
        if (superType == SuperTileType.NONE) {
            return null;
        }

        const superTile = this.spawner.createSuperTile(x, y, superType);
        this.board.setTile(x, y, superTile);
        return superTile;
    }

    private updateBoard(): Partial<TurnOutcome> {
        this.shuffle.reset();

        const movements = this.gravity.applyGravity(this.board);
        this.setState(GameState.APPLYING_GRAVITY);

        const newTiles = this.spawner.fillWithRegularTiles(this.board);
        this.setState(GameState.SPAWNING_TILES);

        let shuffled = false;
        for (let attempt = 0; attempt < this.shuffle.attempts; attempt++) {
            if (this.matches.hasAvailableMatches(this.board)) {
                return { movements, newTiles: newTiles || [] };
            }
            this.shuffle.shuffle(this.board);
            this.setState(GameState.SHUFFLING);
            shuffled = true;
        }

        if (!this.matches.hasAvailableMatches(this.board)) {
            this.setState(GameState.LOSE);
        }

        return { movements, newTiles: newTiles, shuffleRequired: shuffled };
    }

    private setState(state: GameState) {
        this._state = state;
        this.onStateChanged.invoke(this.state);
    }

    private setInputState(state: InputState) {
        this._inputState = state;
        this.onInputStateChanged.invoke(this.getInputState());
    }

    private getEmptyTurnOutcome(): TurnOutcome {
        return {
            state: GameState.IDLE,
            inputState: InputState.NORMAL,
            selectedTile: null,
            movements: [],
            removedTiles: [],
            initialMatchCount: 0,
            consumedMove: false,
            superTile: null,
            shuffleRequired: false,
            newTiles: []
        };
    }
}
