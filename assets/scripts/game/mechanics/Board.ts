import { Tile } from "../Tile";

export class Board {
    public tiles: Map<number, Tile>;
    readonly width: number;
    readonly height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.tiles = new Map();
    }

    public getTile(x: number, y: number): Tile | undefined {
        if (!this.isValidPosition(x, y)) {
            return undefined;
        }
        return this.tiles.get(this.getKey(x, y));
    }

    public setTile(x: number, y: number, tile: Tile): void {
        this.validatePosition(x, y);
        this.tiles.set(this.getKey(x, y), tile);
    }

    public swapTiles(tileA: Tile, tileB: Tile): void {
        const posA = { x: tileA.x, y: tileA.y };
        const posB = { x: tileB.x, y: tileB.y };

        this.validatePosition(posA.x, posA.y);
        this.validatePosition(posB.x, posB.y);

        tileA.setPosition(posB.x, posB.y);
        tileB.setPosition(posA.x, posA.y);

        this.tiles.set(this.getKey(posB.x, posB.y), tileA);
        this.tiles.set(this.getKey(posA.x, posA.y), tileB);
    }

    public removeTiles(tiles: Array<Tile>): void {
        for (var tile of tiles) {
            this.removeTileByPosition(tile.x, tile.y);
        }
    }

    public removeTile(tile: Tile): void {
        this.removeTileByPosition(tile.x, tile.y);
    }

    public removeTileByPosition(x: number, y: number): void {
        if (!this.isValidPosition(x, y)) {
            return;
        }
        this.tiles.delete(this.getKey(x, y));
    }

    public hasTile(x: number, y: number): boolean {
        if (!this.isValidPosition(x, y)) {
            return false;
        }
        return this.tiles.has(this.getKey(x, y));
    }

    public isEmpty(x: number, y: number): boolean {
        const tile = this.getTile(x, y);
        return !tile || tile.isEmpty;
    }

    public isValidPosition(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    public getAllTiles(): Tile[] {
        return Array.from(this.tiles.values());
    }

    public clear(): void {
        this.tiles.clear();
    }

    private getKey(x: number, y: number): number {
        return y * this.width + x;
    }

    private validatePosition(x: number, y: number): void {
        if (!this.isValidPosition(x, y)) {
            throw new Error(`Position out of bounds: (${x}, ${y}). Valid range: 0-${this.width - 1}, 0-${this.height - 1}`);
        }
    }
}
