import { Board } from "./Board";
import { Tile } from "./Tile";


export class Shuffle {
    private readonly _maxAttempts: number;

    private attempts: number;

    public constructor(maxAttempts: number) {
        this._maxAttempts = maxAttempts;
        this.attempts = maxAttempts;
    }

    public shuffleAvaliable() {
        return this.attempts > 0;
    }

    public shuffle(board: Board) {
        const allTiles: Tile[] = [];
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                const tile = board.getTile(x, y);
                if (tile && !tile.isEmpty) {
                    allTiles.push(tile);
                }
            }
        }

        for (let i = allTiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
        }

        let index = 0;
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                if (index < allTiles.length) {
                    const tile = allTiles[index];
                    tile.setPosition(x, y);
                    board.setTile(x, y, tile);
                    index++;
                }
            }
        }
    }

    public reset() {
        this.attempts = this._maxAttempts;
    }
}
