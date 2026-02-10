import { GameEvent } from "../../GameEvent";
import { GameState } from "../enums/GameState";
import { TurnContext } from "../TurnContext";
import { PostTurnProcessor } from "../TurnProcessor";
import { TurnEffect } from "./TurnEffect";
import { WinEffect } from "./effects/WinEffect";

export class Score implements PostTurnProcessor {
    public readonly targetScore: number;
    public readonly scorePerTile: number;

    private _currentScore: number;

    public onScoreChanged: GameEvent<number> = new GameEvent<number>();

    constructor(targetScore: number, scorePerTile: number) {
        this._currentScore = 0;
        this.targetScore = targetScore;
        this.scorePerTile = scorePerTile;
    }

    public canProcess(ctx: TurnContext): boolean {
        return true;
    }

    public onPostTurn(ctx: TurnContext): TurnEffect | null {
        this.addScore(this.calculateScore(ctx.tilesToRemove.size));

        if (this.hasReachedTarget()) {
            ctx.setState(GameState.WIN);
            return new WinEffect();
        }

        return null;
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
        this.onScoreChanged?.invoke(this.currentScore);
    }
}