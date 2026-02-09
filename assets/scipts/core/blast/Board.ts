import { Tile } from "./Tile";

export class Board {
    private tiles: Map<string, Tile>;
    readonly width: number;
    readonly height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.tiles = new Map();
    }

    // todo: втф
    private getKey(x: number, y: number): string {
        return `${x},${y}`;
    }

    getTile(x: number, y: number): Tile | null {
        if (!this.isValidPosition(x, y)) {
            return null;
        }
        return this.tiles.get(this.getKey(x, y)) || null;
    }

    setTile(x: number, y: number, tile: Tile): void {
        tile.setPosition(x, y);
        if (this.isValidPosition(tile.x, tile.y)) {
            this.tiles.set(this.getKey(tile.x, tile.y), tile);
        }
    }

    public removeTile(tile: Tile): void {
        this.removeTileByPosition(tile.x, tile.y);
    }

    removeTileByPosition(x: number, y: number): void {
        this.tiles.delete(this.getKey(x, y));
    }

    isValidPosition(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    isEmpty(x: number, y: number): boolean {
        const tile = this.getTile(x, y);
        return !tile || tile.isEmpty;
    }

    getAllTiles(): Tile[] {
        return Array.from(this.tiles.values());
    }

    clear(): void {
        this.tiles.clear();
    }
}
