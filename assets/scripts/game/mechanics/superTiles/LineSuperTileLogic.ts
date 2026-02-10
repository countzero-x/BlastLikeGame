import { SuperTileType } from "./SuperTileType";
import { Tile } from "../../Tile";
import { Board, TurnEffect } from "../Board";
import { SuperTile } from "./SuperTile";
import { SuperTileLogic } from "./SuperTileLogic";
import { TurnContext } from "../../TurnContext";
import { DestroyEffect } from "../effects/DestroyEffect";

export class LineSuperTileLogic implements SuperTileLogic {
    public readonly type: SuperTileType;

    constructor(isHorizontal: boolean) {
        this.type = isHorizontal ? SuperTileType.HORIZONTAL : SuperTileType.VERTICAL;
    }

    public canProcess(ctx: TurnContext): boolean {
        return this.canProcessTile(ctx.selectedTile);
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
        const range = this.type == SuperTileType.HORIZONTAL ? board.width : board.height;

        for (let i = 0; i < range; i++) {
            const coord1 = this.type == SuperTileType.HORIZONTAL ? i : superTile.x;
            const coord2 = this.type == SuperTileType.HORIZONTAL ? superTile.y : i;

            const tile = board.getTile(coord1, coord2);

            if (tile && !tile.isEmpty) {
                tiles.push(tile);
            }
        }
        return tiles;
    }
}
