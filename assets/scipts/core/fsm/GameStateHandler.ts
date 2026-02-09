import { GameEvent } from "../GameEvent";
import { GameState } from "./GameState";
import { GameStatesHandler } from "./GameStatesHandler";
import { IGameStateContext } from "./IGameStateContext";

export abstract class GameStateHandler {
    protected _statesHandler: GameStatesHandler;
    private _state: GameState

    public finished: GameEvent<void> = new GameEvent<void>();

    public get state(): GameState {
        return this._state;
    }

    public constructor(stateMachine: GameStatesHandler) {
        this._statesHandler = stateMachine;
    }

    public abstract Enter(context: IGameStateContext): Promise<void>;
    public abstract Exit(context: IGameStateContext): Promise<void>;

    protected finish() {
        this.finished.invoke();
    }
}