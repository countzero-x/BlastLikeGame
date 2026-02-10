import { Board } from "./Board";
import { TurnEffect } from "./TurnEffect";
import { SuperTileType } from "./superTiles/SuperTileType";
import { TileColor } from "../enums/TileColor";
import { Tile } from "../Tile";
import { SuperTile } from "./superTiles/SuperTile";
import { PostGameProcessor, PostTurnProcessor, PreGameProcessor, PreTurnProcessor } from "../TurnProcessor";
import { TurnContext } from "../TurnContext";
import { TileSpawnEffect } from "./effects/TileSpawnEffect";
import { BlastGame } from "../BlastGame";

export class Spawner implements PostTurnProcessor, PreGameProcessor, PostGameProcessor {

    private avaliableColors = Array<TileColor>();

    public canProcess(ctx: TurnContext): boolean {
        return true;
    }

    public onPreGame(game: BlastGame): TurnEffect | null {
        const toSpawn = this.fillWithRegularTiles(game.board);

        for (var tile of toSpawn) {
            game.board.setTile(tile.x, tile.y, tile);
        }

        const spawnEffect = new TileSpawnEffect();
        spawnEffect.tilesToSpawn = toSpawn;
        return spawnEffect;
    }

    public onPostGame(game: BlastGame): TurnEffect | null {
        game.board.clear();

        return null;
    }

    public onPostTurn(ctx: TurnContext): TurnEffect | null {
        const toSpawn = this.fillWithRegularTiles(ctx.board);

        for (var tile of toSpawn) {
            ctx.board.setTile(tile.x, tile.y, tile);
        }

        const spawnEffect = new TileSpawnEffect();
        spawnEffect.tilesToSpawn = toSpawn;
        return spawnEffect;
    }

    public register(color: TileColor) {
        this.avaliableColors.push(color);
    }

    public fillWithRegularTiles(board: Board): Array<Tile> {
        const tilesUpdated = new Array<Tile>();

        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                if (board.getTile(x, y) == null || board.getTile(x, y).isEmpty) {
                    const tile = this.createRandomRegularTile(x, y);
                    board.setTile(x, y, tile);
                    tilesUpdated.push(tile);
                }
            }
        }

        return tilesUpdated;
    }

    public createRandomRegularTile(x: number, y: number): Tile {
        const color = Math.floor(Math.random() * this.avaliableColors.length);
        return new Tile(x, y, color);
    }

    public createSuperTile(x: number, y: number, type: SuperTileType): SuperTile {
        return new SuperTile(x, y, TileColor.SPECIAL, type);
    }

    public createRegularTile(x: number, y: number, color: TileColor): Tile {
        return new Tile(x, y, color);
    }
}
