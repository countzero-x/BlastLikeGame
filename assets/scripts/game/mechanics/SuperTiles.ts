import { Board } from "./Board";
import { SuperTileType } from "../enums/SuperTileType";
import { SuperTile } from "../views/SuperTile";
import { Tile } from "../views/Tile";

export class SuperTiles {

    private _countForLine: number;
    private _countForLineRadiusBomb: number;
    private _countForMaxBomb: number;
    private _bombRadius: number;

    public constructor(countForLine: number, countForLineRadiusBomb: number, countForMaxBomb: number, bombRadius: number) {
        this._countForLine = countForLine;
        this._countForLineRadiusBomb = countForLineRadiusBomb;
        this._countForMaxBomb = countForMaxBomb;
        this._bombRadius = bombRadius;
    }

    public GetSuperTileType(tilesRemoved: number): SuperTileType {
        if (tilesRemoved >= this._countForMaxBomb) {
            return SuperTileType.MAX_BOMB;
        } else if (tilesRemoved >= this._countForLineRadiusBomb) {
            return SuperTileType.RADIUS_BOMB;
        } else if (tilesRemoved >= this._countForLine) {
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
                return this.activateRadius(superTile, board);
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

    private activateRadius(superTile: SuperTile, board: Board): Tile[] {
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
