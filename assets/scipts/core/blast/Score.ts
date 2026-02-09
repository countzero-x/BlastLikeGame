import { GameConfig } from "./GameConfig";


export class Score {
    public readonly targetScore: number;
    public readonly scoreForTile: number;

    private _currentScore: number;

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
        this._currentScore += points;
    }

    public hasReachedTarget(): boolean {
        return this._currentScore >= this.targetScore;
    }

    public reset(): void {
        this._currentScore = 0;
    }
}