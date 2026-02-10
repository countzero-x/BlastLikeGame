import { GameEvent } from "../../../GameEvent";
import { BoosterType } from "../../enums/BoosterType";
import { InputState } from "../../enums/InputState";
import { Tile } from "../../Tile";
import { Board } from "../Board";
import { IBooster, BoosterContext } from "./IBooster";


export class BombBooster implements IBooster {
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

    public getCount(): number {
        return this._count;
    }

    public canUse(): boolean {
        return this._count > 0;
    }

    public onClick(ctx: BoosterContext, tile: Tile): Tile[] {
        if (!this.canUse()) return [];

        const tiles = this.getBombAffectedTiles(tile, ctx.board);
        this.setCount(this._maxCount - 1);
        ctx.setInputState(InputState.NORMAL);
        return tiles;
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
