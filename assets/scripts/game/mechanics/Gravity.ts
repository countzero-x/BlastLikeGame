import { TileColor } from "../enums/TileColor";
import { Tile } from "../Tile";
import { TurnContext } from "../TurnContext";
import { PostTurnProcessor, TurnClickProcessor } from "../TurnProcessor";
import { Board } from "./Board";
import { TurnEffect } from "./TurnEffect";
import { GravityEffect } from "./effects/GravityEffect";

export interface TileMove {
    x: number;
    fromY: number;
    toY: number;
    tile: Tile;
}

export class Gravity implements PostTurnProcessor {

    public canProcess(ctx: TurnContext): boolean {
        return true;
    }

    public onPostTurn(ctx: TurnContext): TurnEffect | null {
        const moves = this.applyGravity(ctx.board);

        const result: GravityEffect = new GravityEffect();
        result.moves = moves;
        return result;
    }

    public applyGravity(board: Board): Array<TileMove> {
        const moveHistory = [];

        for (let x = 0; x < board.width; x++) {
            const tiles: Tile[] = [];

            for (let y = 0; y < board.height; y++) {
                const tile = board.getTile(x, y);

                if (tile && !tile.isEmpty) {
                    tiles.push(tile);
                }
            }

            for (let i = 0; i < tiles.length; i++) {
                const tile = tiles[i];
                const oldY = tile.y;
                const newY = i;

                if (oldY !== newY) {
                    moveHistory.push({
                        x: x,
                        fromY: oldY,
                        toY: newY,
                        tile: tile
                    });
                }

                tile.y = newY;
                board.setTile(x, newY, tile);
            }

            for (let y = tiles.length; y < board.height; y++) {
                board.setTile(x, y, new Tile(x, y, TileColor.EMPTY));
            }
        }

        return moveHistory;
    }
}
