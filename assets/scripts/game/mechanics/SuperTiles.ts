import { Board } from "./Board";
import { GameConfig } from "../GameConfig";
import { SuperTileType } from "../enums/SuperTileType";
import { SuperTile } from "../views/SuperTile";
import { Tile } from "../views/Tile";

export class SuperTiles {

    public GetSuperTileType(tilesRemoved: number): SuperTileType {
        if (tilesRemoved >= GameConfig.SUPERTILE_REMOVED_COUNT_FOR_MAX_BOMB) {
            return SuperTileType.MAX_BOMB;
        } else if (tilesRemoved >= GameConfig.SUPERTILE_REMOVED_COUNT_FOR_RADIUS_BOMB) {
            return SuperTileType.RADIUS_BOMB;
        } else if (tilesRemoved >= GameConfig.SUPERTILE_REMOVED_COUNT_FOR_LINE) {
            return Math.random() > 0.5 ? SuperTileType.HORIZONTAL : SuperTileType.VERTICAL;
        } else {
            return SuperTileType.NONE;
        }
    }

    public activate(superTile: SuperTile, board: Board): Tile[] {
        switch (superTile.type) {
            case SuperTileType.HORIZONTAL:
                return this.activateRow(superTile, board);
            case SuperTileType.VERTICAL:
                return this.activateColumn(superTile, board);
            case SuperTileType.RADIUS_BOMB:
                return this.activateRadius(superTile, board, GameConfig.SUPERTILE_RADIUS_BOMB);
            case SuperTileType.MAX_BOMB:
                return this.activateFullBoard(superTile, board);
            default:
                return [];
        }
    }

    private activateRow(superTile: SuperTile, board: Board): Tile[] {
        const tiles: Tile[] = [];
        for (let x = 0; x < board.width; x++) {
            const tile = board.getTile(x, superTile.y);
            if (tile && !tile.isEmpty) {
                tiles.push(tile);
            }
        }
        return tiles;
    }

    private activateColumn(superTile: SuperTile, board: Board): Tile[] {
        const tiles: Tile[] = [];
        for (let y = 0; y < board.height; y++) {
            const tile = board.getTile(superTile.x, y);
            if (tile && !tile.isEmpty) {
                tiles.push(tile);
            }
        }
        return tiles;
    }

    private activateRadius(superTile: SuperTile, board: Board, radius: number): Tile[] {
        const tiles: Tile[] = [];
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= radius) {
                    const tile = board.getTile(superTile.x + dx, superTile.y + dy);
                    if (tile && !tile.isEmpty) {
                        tiles.push(tile);
                    }
                }
            }
        }
        return tiles;
    }

    private activateFullBoard(superTile: SuperTile, board: Board): Tile[] {
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
