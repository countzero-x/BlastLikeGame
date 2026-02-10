import { GameEvent } from "../../GameEvent";

export class Input {
    private _enabled: boolean = true;

    public readonly tileClicked = new GameEvent<{ x: number, y: number }>();

    public invokeTileClick(pos: { x: number, y: number }) {
        this.tileClicked.invoke(pos);
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
