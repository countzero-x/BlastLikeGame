import { Tile } from "../../blast/Tile";
import { TileColor } from "../../blast/TileColor";
import { GameStateHandler } from "../GameStateHandler";
import { IGameStateContext } from "../IGameStateContext";

export class SpawningTileStateHandler extends GameStateHandler {
    async Enter(context: IGameStateContext): Promise<void> {
        for (let x = 0; x < context.board.width; x++) {
            for (let y = 0; y < context.board.height; y++) {
                context.board.setTile(this.createRandomTile(x, y));
            }
        }
        
        this.finish();
    }

    async Exit(): Promise<void> { }

    // todo: вынести в какую нить фабрику
    public createRandomTile(x: number, y: number): Tile {
        const color = Math.floor(Math.random() * 5);
        return new Tile(x, y, color);
    }

    public createTile(x: number, y: number, color: TileColor): Tile {
        return new Tile(x, y, color);
    }
}