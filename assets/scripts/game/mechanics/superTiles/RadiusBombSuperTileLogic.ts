import { SuperTileType } from "./SuperTileType";
import { Tile } from "../../Tile";
import { Board } from "../Board";
import { TurnEffect } from "../TurnEffect";
import { SuperTile } from "./SuperTile";
import { SuperTileLogic } from "./SuperTileLogic";
import { TurnContext } from "../../TurnContext";
import { DestroyEffect } from "../effects/DestroyEffect";

export class RadiusBombSuperTileLogic implements SuperTileLogic {
    public readonly type = SuperTileType.RADIUS_BOMB;

    private readonly _bombRadius: number;

    constructor(bombRadius: number) {
        this._bombRadius = bombRadius;
    }

    public canProcess(ctx: TurnContext): boolean {
        return ctx.selectedTile instanceof SuperTile && ctx.selectedTile.type == this.type;
    }

    public canProcessTile(tile: Tile) {
        return tile instanceof SuperTile && tile.type == this.type;
    }

    public onTileClick(ctx: TurnContext): TurnEffect | null {
        const tiles = this.activate(ctx.selectedTile as SuperTile, ctx.board);

        for (var tile of tiles) {
            ctx.tilesToRemove.add(tile);
        }

        const result: DestroyEffect = new DestroyEffect();
        result.tilesToRemove = tiles;
        return result;
    }

    public activate(superTile: SuperTile, board: Board): Tile[] {
        const tiles: Tile[] = [];
        for (let dx = -this._bombRadius; dx <= this._bombRadius; dx++) {
            for (let dy = -this._bombRadius; dy <= this._bombRadius; dy++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this._bombRadius) {
                    const tile = board.getTile(superTile.x + dx, superTile.y + dy);
                    if (tile && !tile.isEmpty) {
                        tiles.push(tile);
                    }
                }
            }
        }
        return tiles;
    }
}
