import { Board } from "./Board";
import { TileColor } from "../enums/TileColor";
import { SuperTile } from "../views/SuperTile";
import { Tile } from "../views/Tile";

export class Matches {

    public hasAvailableMoves(board: Board): boolean {
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                const tile = board.getTile(x, y);

                if (!tile || tile.isEmpty) {
                    continue;
                }

                if (tile instanceof SuperTile) {
                    return true;
                }

                const group = this.findConnectedGroup(board, x, y);
                if (group.length >= 2) {
                    return true;
                }
            }
        }

        return false;
    }

    public findConnectedGroup(board: Board, x: number, y: number): Tile[] {
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
}
