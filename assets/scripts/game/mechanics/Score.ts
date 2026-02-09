import { MyEvent } from "../../MyEvent";

export class Score {
    public readonly targetScore: number;
    public readonly scoreForTile: number;

    private _currentScore: number;

    public scoreChanged: MyEvent<number> = new MyEvent<number>();

    constructor(targetScore: number, scoreForTile: number) {
        this._currentScore = 0;
        this.targetScore = targetScore;
        this.scoreForTile = scoreForTile;
    }

    public get currentScore(): number {
        return this._currentScore;
    }

    public calculateScore(tilesCount: number): number {
        return tilesCount * tilesCount * this.scoreForTile;
    }

    public addScore(points: number): void {
        this.currentScore += points;
    }

    public hasReachedTarget(): boolean {
        return this._currentScore >= this.targetScore;
    }

    public reset(): void {
        this.currentScore = 0;
    }

    private set currentScore(value: number) {
        this._currentScore = value;
        this.scoreChanged?.invoke(this.currentScore);
    }
}