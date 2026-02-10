import { GameEvent } from "../../GameEvent";
import { GameState } from "../enums/GameState";
import { TurnContext } from "../TurnContext";
import { PostTurnProcessor } from "../TurnProcessor";
import { TurnEffect } from "./Board";
import { LoseEffect } from "./effects/LoseEffect";

export class Moves implements PostTurnProcessor {
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

    public canProcess(ctx: TurnContext): boolean {
        return true;
    }

    public onPostTurn(ctx: TurnContext): TurnEffect | null {
        if (ctx.initialRemovedCount > 0) {
            this.decrementMove();
        }

        if (!this.hasMovesLeft()) {
            ctx.setState(GameState.WIN);
            return new LoseEffect();
        }

        return null;
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