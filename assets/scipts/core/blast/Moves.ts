
export class Moves {
    public readonly maxMoves: number;

    private _currentMoves: number;

    public get currentMoves(): number {
        return this.currentMoves;
    }

    constructor(maxMoves: number) {
        this._currentMoves = maxMoves;
        this.maxMoves = maxMoves;
    }

    public decrementMove(): void {
        if (this._currentMoves > 0) {
            this._currentMoves--;
        }
    }

    public hasMovesLeft(): boolean {
        return this._currentMoves > 0;
    }

    public reset(): void {
        this._currentMoves = this.maxMoves;
    }
}