import { GameEvent } from "../../GameEvent";
import { GameState } from "../enums/GameState";
import { TurnContext } from "../TurnContext";

export class Input {

    public canProcess(ctx: TurnContext): boolean {
        return ctx.getState() == GameState.GAME;
    }

    private _enabled: boolean = true;

    public readonly onTileClicked = new GameEvent<{ x: number, y: number }>();

    public invokeTileClick(pos: { x: number, y: number }) {
        this.onTileClicked.invoke(pos);
    }

    public get isEnabled(): boolean {
        return this._enabled;
    }

    public enable(): void {
        this._enabled = true;
    }

    public disable(): void {
        this._enabled = false;
    }
}
