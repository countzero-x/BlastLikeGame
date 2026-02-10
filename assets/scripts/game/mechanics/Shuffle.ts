import { Board, TurnEffect } from "./Board";
import { Tile } from "../Tile";
import { PreTurnProcessor } from "../TurnProcessor";
import { TurnContext } from "../TurnContext";
import { ShuffleEffect } from "./effects/ShuffleEffect";

export class Shuffle implements PreTurnProcessor {
    public readonly maxAttempts: number;

    private _attempts: number;

    public constructor(maxAttempts: number) {
        this.maxAttempts = maxAttempts;
        this._attempts = maxAttempts;
    }

    public get attempts(): number {
        return this._attempts;
    }

    public canProcess(ctx: TurnContext): boolean {
        return true;
    }

    public onPreTurn(ctx: TurnContext): TurnEffect | null {
        this.reset();

        let shuffled = false;
        while (this.shuffleAvaliable() && !ctx.matches.hasAvailableMatches(ctx.board)) {
            this.shuffle(ctx.board);
            shuffled = true;
        }

        if (shuffled && ctx.matches.hasAvailableMatches(ctx.board)) {
            const result: ShuffleEffect = new ShuffleEffect();
            result.tilesToShuffle = ctx.board.getAllTiles();
            return result;
        }
    }

    public shuffleAvaliable() {
        return this._attempts > 0;
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
        this._attempts = this.maxAttempts;
    }
}
