import { Board } from "./Board";
import { SuperTile } from "../views/SuperTile";
import { Tile } from "../views/Tile";

export class Matches {
    public hasAvailableMatches(board: Board): boolean {
        if (this.hasSuperTile(board)) {
            return true;
        }

        const visited: Set<number> = new Set();

        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                const index = y * board.width + x;

                if (visited.has(index)) {
                    continue;
                }

                const tile = board.getTile(x, y);
                if (!tile || tile.isEmpty) {
                    continue;
                }

                const group = this.getAvaliableMatch(board, x, y);

                if (group.length >= 2) {
                    return true;
                }

                group.forEach(t => {
                    const tileIndex = t.y * board.width + t.x;
                    visited.add(tileIndex);
                });
            }
        }

        return false;
    }

    public getAvaliableMatch(board: Board, x: number, y: number): Tile[] {
        const startTile = board.getTile(x, y);
        if (!startTile || startTile.isEmpty) {
            return [];
        }

        const visited: boolean[][] = Array.from({ length: board.width },
            () => new Array(board.height).fill(false));

        const group: Tile[] = [];
        const queue: [number, number][] = [[x, y]];
        const targetColor = startTile.color;
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        while (queue.length > 0) {
            const [cx, cy] = queue.shift()!;

            if (cx < 0 || cx >= board.width || cy < 0 || cy >= board.height) {
                continue;
            }
            if (visited[cx][cy]) {
                continue;
            }

            const tile = board.getTile(cx, cy);
            if (!tile || tile.isEmpty || tile.color !== targetColor) {
                continue;
            }

            visited[cx][cy] = true;
            group.push(tile);

            for (const [dx, dy] of directions) {
                queue.push([cx + dx, cy + dy]);
            }
        }

        return group.length >= 2 ? group : [];
    }

    private hasSuperTile(board: Board): boolean {
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                const tile = board.getTile(x, y);
                if (tile instanceof SuperTile) {
                    return true;
                }
            }
        }
        return false;
    }
}
