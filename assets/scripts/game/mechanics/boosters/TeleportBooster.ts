import { BoosterType } from "../../enums/BoosterType";
import { InputState } from "../../enums/InputState";
import { Tile } from "../../Tile";
import { IBooster, BoosterContext } from "./IBooster";


export class TeleportBooster implements IBooster {
    public readonly type = BoosterType.TELEPORT;
    public readonly initialInputState = InputState.TELEPORT_PHASE_ONE;

    private readonly _maxCount: number;
    private _count: number;

    private _firstTile: Tile;

    constructor(count: number) {
        this._maxCount = count;
        this._count = count;
    }

    count(): number {
        return this._count;
    }

    canUse(): boolean {
        return this._count > 0;
    }

    onClick(ctx: BoosterContext, tile: Tile): Tile[] {
        if (!this.canUse()) {
            return []
        };

        if (!this._firstTile) {
            this._firstTile = tile;
            ctx.setInputState(InputState.TELEPORT_PHASE_TWO);
            return [];
        }

        ctx.board.swapTiles(this._firstTile, tile);
        this._firstTile = null;
        this._count--;
        ctx.setInputState(InputState.NORMAL);
        return [];
    }

    reset(): void {
        this._count = this._maxCount;
        this._firstTile = null;
    }
}
