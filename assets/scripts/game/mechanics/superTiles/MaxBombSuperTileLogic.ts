import { SuperTileType } from "./SuperTileType";
import { Tile } from "../../Tile";
import { Board, TurnEffect } from "../Board";
import { SuperTile } from "./SuperTile";
import { SuperTileLogic } from "./SuperTileLogic";
import { TurnContext } from "../../TurnContext";
import { DestroyEffect } from "../effects/DestroyEffect";

export class MaxBombSuperTileLogic implements SuperTileLogic {
    public readonly type = SuperTileType.MAX_BOMB;

    public canProcess(ctx: TurnContext): boolean {
        return ctx.selectedTile instanceof SuperTile && ctx.selectedTile.type == this.type;
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
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                const tile = board.getTile(x, y);
                if (tile && !tile.isEmpty) {
                    tiles.push(tile);
                }
            }
        }
        return tiles;
    }
}
