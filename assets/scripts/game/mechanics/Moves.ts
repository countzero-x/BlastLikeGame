import { GameEvent } from "../../GameEvent";

export class Moves {
    public readonly maxMoves: number;

    private _currentMoves: number;

    public onMovesChanged: GameEvent<number> = new GameEvent<number>();

    constructor(maxMoves: number) {
        this._currentMoves = maxMoves;
        this.maxMoves = maxMoves;
    }

    public get currentMoves(): number {
        return this._currentMoves;
    }

    public decrementMove(): void {
        if (this._currentMoves > 0) {
            this.currentMoves--;
        }
    }

    public hasMovesLeft(): boolean {
        return this._currentMoves > 0;
    }

    public reset(): void {
        this.currentMoves = this.maxMoves;
    }

    private set currentMoves(value: number) {
        this._currentMoves = value;
        this.onMovesChanged?.invoke(this.currentMoves);
    }
}