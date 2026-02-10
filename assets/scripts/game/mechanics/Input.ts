import { GameEvent } from "../../GameEvent";

export class Input {
    private _enabled: boolean = true;

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
