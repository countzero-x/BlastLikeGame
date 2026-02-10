import { GameEvent } from "../../../GameEvent";
import { BoosterType } from "../../enums/BoosterType";
import { InputState } from "../../enums/InputState";
import { Tile } from "../../Tile";
import { TurnContext } from "../../TurnContext";
import { Board, TurnEffect } from "../Board";
import { DestroyEffect } from "../effects/DestroyEffect";
import { Booster } from "./Booster";

export class BombBooster implements Booster {
    public readonly type = BoosterType.BOMB;
    public readonly initialInputState = InputState.BOMB;
    public readonly onCountChanged = new GameEvent<number>();

    private readonly _maxCount: number;
    private readonly _radius: number;
    private _count: number;

    public constructor(count: number, radius: number) {
        this._maxCount = count;
        this._radius = radius;
        this._count = count;
    }

    public canProcess(ctx: TurnContext): boolean {
        return this.canUse();
    }

    public onTileClick(ctx: TurnContext): TurnEffect {
        if (!this.canUse()) {
            return [];
        }

        const tiles = this.getBombAffectedTiles(ctx.selectedTile, ctx.board);
        for (var tile of tiles) {
            ctx.tilesToRemove.add(tile);
        }

        this.setCount(this._count - 1);
        ctx.setInputState(InputState.NORMAL);

        const result: DestroyEffect = new DestroyEffect();
        result.tilesToRemove = tiles;
        return result;
    }

    public getCount(): number {
        return this._count;
    }

    public canUse(): boolean {
        return this._count > 0;
    }

    public reset(): void {
        this.setCount(this._maxCount);
    }

    private getBombAffectedTiles(selectedTile: Tile, board: Board): Tile[] {
        const tiles: Tile[] = [];
        const radiusSq = this._radius * this._radius;

        for (let dx = -this._radius; dx <= this._radius; dx++) {
            for (let dy = -this._radius; dy <= this._radius; dy++) {
                const distanceSq = dx * dx + dy * dy;
                if (distanceSq > radiusSq) {
                    continue;
                }

                const tile = board.getTile(selectedTile.x + dx, selectedTile.y + dy);
                if (tile?.isEmpty == false) {
                    tiles.push(tile);
                }
            }
        }

        return tiles;
    }

    private setCount(value: number) {
        this._count = value;
        this.onCountChanged.invoke(this._count);
    }
}
