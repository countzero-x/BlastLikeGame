import { Board } from "./Board";
import { SuperTile } from "./SuperTile";
import { Tile } from "./Tile";
import { TileColor } from "./TileColor";

export class Matches {
    public hasAvailableMoves(board: Board): boolean {
        let possibleMoves = 0;

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
                    possibleMoves++;
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

        const visited: boolean[][] = [];
        for (let i = 0; i < board.width; i++) {
            visited[i] = new Array(board.height).fill(false);
        }

        const group: Tile[] = [];
        const targetColor = startTile.color;
        this.floodFill(board, x, y, targetColor, visited, group);

        return group.length >= 2 ? group : [];
    }

    private floodFill(board: Board, x: number, y: number, targetColor: TileColor, visited: boolean[][], group: Tile[]): void {
        if (x < 0 || x >= board.width || y < 0 || y >= board.height) {
            return;
        }

        if (visited[x][y]) {
            return;
        }

        const tile = board.getTile(x, y);
        if (!tile || tile.isEmpty || tile.color !== targetColor) {
            return;
        }

        visited[x][y] = true;
        group.push(tile);

        this.floodFill(board, x + 1, y, targetColor, visited, group);
        this.floodFill(board, x - 1, y, targetColor, visited, group);
        this.floodFill(board, x, y + 1, targetColor, visited, group);
        this.floodFill(board, x, y - 1, targetColor, visited, group);
    }
}
