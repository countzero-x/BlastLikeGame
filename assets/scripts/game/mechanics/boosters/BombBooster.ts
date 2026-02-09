import { BoosterType } from "../../enums/BoosterType";
import { InputState } from "../../enums/InputState";
import { Tile } from "../../Tile";
import { Board } from "../Board";
import { IBooster, BoosterContext } from "./IBooster";


export class BombBooster implements IBooster {
    public readonly type = BoosterType.BOMB;
    public readonly initialInputState = InputState.BOMB;

    private readonly _maxCount: number;
    private readonly _radius: number;
    private _count: number;

    constructor(count: number, radius: number) {
        this._maxCount = count;
        this._radius = radius;
        this._count = count;
    }

    count(): number {
        return this._count;
    }

    canUse(): boolean {
        return this._count > 0;
    }

    onClick(ctx: BoosterContext, tile: Tile): Tile[] {
        if (!this.canUse()) return [];

        const tiles = this.getBombAffectedTiles(tile, ctx.board);
        this._count--;
        // после использования возвращаемся к NORMAL
        ctx.setInputState(InputState.NORMAL);
        return tiles;
    }

    reset(): void {
        this._count = this._maxCount;
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
                if (tile?.isEmpty === false) {
                    tiles.push(tile);
                }
            }
        }

        return tiles;
    }
}
