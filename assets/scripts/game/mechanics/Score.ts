import { GameEvent } from "../../GameEvent";

export class Score {
    public readonly targetScore: number;
    public readonly scorePerTile: number;

    private _currentScore: number;

    public scoreChanged: GameEvent<number> = new GameEvent<number>();

    constructor(targetScore: number, scorePerTile: number) {
        this._currentScore = 0;
        this.targetScore = targetScore;
        this.scorePerTile = scorePerTile;
    }

    public get currentScore(): number {
        return this._currentScore;
    }

    public calculateScore(tilesCount: number): number {
        return tilesCount * tilesCount * this.scorePerTile;
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