import { GameEvent } from "../GameEvent";
import { GameState } from "./enums/GameState";
import { InputState } from "./enums/InputState";
import { Board, TurnEffect } from "./mechanics/Board";
import { Boosters } from "./mechanics/Boosters";
import { Gravity } from "./mechanics/Gravity";
import { Input } from "./mechanics/Input";
import { Matches } from "./mechanics/Matches";
import { Moves } from "./mechanics/Moves";
import { Score } from "./mechanics/Score";
import { Shuffle } from "./mechanics/Shuffle";
import { Spawner } from "./mechanics/Spawner";
import { SuperTiles } from "./mechanics/superTiles/SuperTiles";
import { Tile } from "./Tile";
import { TurnContext } from "./TurnContext";
import { PostGameProcessor, PostTurnProcessor, PreGameProcessor, PreTurnProcessor, TileDeletedProcessor, TurnClickProcessor } from "./TurnProcessor";

export class BlastGame {
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
    public readonly onTurnFinished = new GameEvent<Array<TurnEffect>>();
    public readonly onGameStarted = new GameEvent<Array<TurnEffect>>();
    public readonly onGameFinished = new GameEvent<Array<TurnEffect>>();

    private _state: GameState = GameState.IDLE;
    private _inputState: InputState = InputState.NORMAL;
    private _lastTurnContext: TurnContext;

    private _preGameProcessors: Array<PreGameProcessor>;
    private _postGameProcessors: Array<PostGameProcessor>
    private _preTurnProcessors: Array<PreTurnProcessor>;
    private _clickProcessors: Array<TurnClickProcessor>;
    private _postTurnProcessors: Array<PostTurnProcessor>;
    private _tileRemovedProcessors: Array<TileDeletedProcessor>;

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
        preGameProcessors: Array<PreGameProcessor>,
        postGameProcessors: Array<PostGameProcessor>,
        preProcessors: Array<PreTurnProcessor>,
        clickProcessors: Array<TurnClickProcessor>,
        postProcessors: Array<PostTurnProcessor>,
        tileRemovedProcessors: Array<TileDeletedProcessor>,
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

        this._lastTurnContext = this.createTurnCtx();

        this.boosters.setContext({
            board: this.board,
            setInputState: this.setInputState.bind(this),
            getInputState: this.getInputState.bind(this),
            inputStateChanged: this.onInputStateChanged
        });

        this._preGameProcessors = preGameProcessors;
        this._postGameProcessors = postGameProcessors;
        this._preTurnProcessors = preProcessors;
        this._clickProcessors = clickProcessors;
        this._postTurnProcessors = postProcessors;
        this._tileRemovedProcessors = tileRemovedProcessors;
    }

    public get lastTurnContext(): TurnContext {
        return this._lastTurnContext;
    }

    public get state(): GameState {
        return this._state;
    }

    public getInputState(): InputState {
        return this._inputState;
    }

    public start() {

        const effects = new Array<TurnEffect>();
        for (var preGameProc of this._preGameProcessors) {
            effects.push(preGameProc.onPreGame(this));
        }
        this.onGameStarted.invoke(effects);

        this.input.onTileClicked.subscribe(this.processTurn, this);
    }

    public finish() {
        this.input.onTileClicked.unsubscribe(this.processTurn, this);

        const effects = new Array<TurnEffect>();
        for (var postGameProc of this._postGameProcessors) {
            effects.push(postGameProc.onPostGame(this));
        }
        this.onGameFinished.invoke(effects);

        this.reset();
    }

    public processTurn(pos: { x: number, y: number }): Array<TurnEffect> {
        if (!this.input.isEnabled) {
            return;
        }
        
        this._lastTurnContext = this.createTurnCtx();

        const tile = this.board.getTile(pos.x, pos.y);
        if (!tile || tile.isEmpty) {
            return;
        }

        this._lastTurnContext.selectedTile = tile;

        const effects = new Array<TurnEffect>();
        for (var preTurnProc of this._preTurnProcessors) {
            if (preTurnProc.canProcess(this._lastTurnContext)) {
                effects.push(preTurnProc.onPreTurn(this._lastTurnContext));
            }
        }

        for (var clickProcessor of this._clickProcessors) {
            if (clickProcessor.canProcess(this._lastTurnContext)) {
                effects.push(clickProcessor.onTileClick(this._lastTurnContext));
            }
        }

        for (var deletedTile of Array.from(this._lastTurnContext.tilesToRemove)) {
            this.board.removeTile(deletedTile);
        }

        // for (var tileDeteledProcessor of this._tileRemovedProcessors) {
        //     if (tileDeteledProcessor.canProcess(this._lastTurnContext)) {
        //         effects.push(tileDeteledProcessor.onTileRemoved(this._lastTurnContext));
        //     }
        // }

        for (var postProcessor of this._postTurnProcessors) {
            if (postProcessor.canProcess(this._lastTurnContext)) {
                effects.push(postProcessor.onPostTurn(this._lastTurnContext));
            }
        }

        this.onTurnFinished.invoke(effects);
    }

    private reset() {
        this.setInputState(InputState.NORMAL);
        this._lastTurnContext = null;
        this.score.reset();
        this.moves.reset();
        this.boosters.reset();
        this.board.clear();
    }

    private setState(state: GameState) {
        this._state = state;
        this.onStateChanged.invoke(this.state);
    }

    private setInputState(state: InputState) {
        this._inputState = state;
        this.onInputStateChanged.invoke(this.getInputState());
    }

    private createTurnCtx(): TurnContext {
        return {
            state: this._state,
            inputState: this._inputState,
            selectedTile: null,
            spawner: this.spawner,
            board: this.board,
            matches: this.matches,
            initialRemovedCount: 0,
            tilesToRemove: new Set<Tile>(),
            tilesToCreate: new Set<Tile>()
        };
    }
}
