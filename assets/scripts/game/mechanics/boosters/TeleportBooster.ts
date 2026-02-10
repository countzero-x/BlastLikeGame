import { GameEvent } from "../../../GameEvent";
import { BoosterType } from "../../enums/BoosterType";
import { InputState } from "../../enums/InputState";
import { Tile } from "../../Tile";
import { TurnContext } from "../../TurnContext";
import { TurnEffect } from "../Board";
import { SwapEffect } from "../effects/SwapEffect";
import { Booster } from "./IBooster";

export class TeleportBooster implements Booster {
    public readonly type = BoosterType.TELEPORT;
    public readonly initialInputState = InputState.TELEPORT_PHASE_ONE;
    public readonly onCountChanged = new GameEvent<number>();

    private readonly _maxCount: number;
    private _count: number;

    private _firstTile: Tile;

    public constructor(count: number) {
        this._maxCount = count;
        this._count = count;
    }

    public canProcess(ctx: TurnContext): boolean {
        return this.canUse();
    }

    public onTileClick(ctx: TurnContext): TurnEffect {
        if (!this.canUse()) {
            return []
        };

        if (!this._firstTile) {
            this._firstTile = ctx.selectedTile;
            ctx.inputState = InputState.TELEPORT_PHASE_TWO;
            return null;
        }

        ctx.board.swapTiles(this._firstTile, ctx.selectedTile);

        const effect: SwapEffect = new SwapEffect();
        effect.left = this._firstTile;
        effect.right = ctx.selectedTile;

        this._firstTile = null;
        this.setCount(this._count - 1);
        ctx.inputState = InputState.NORMAL;

        return effect;
    }

    public getCount(): number {
        return this._count;
    }

    public canUse(): boolean {
        return this._count > 0;
    }

    public reset(): void {
        this.setCount(this._maxCount);
        this._firstTile = null;
    }

    private setCount(value: number) {
        this._count = value;
        this.onCountChanged.invoke(this._count);
    }
}
