import { Tile } from "../../blast/Tile";
import { TileColor } from "../../blast/TileColor";
import { GameStateHandler } from "../GameStateHandler";
import { IGameStateContext } from "../IGameStateContext";

export class PlayingStateHandler extends GameStateHandler {
    public Enter(context: IGameStateContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public Exit(context: IGameStateContext): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

export class RemovingTilesStateHandler extends GameStateHandler {
    public async Enter(context: IGameStateContext): Promise<void> {
        if (context.tilesSelected.length === 0) {
            this.finish();
        } else {
            
        }
    }

    public Exit(context: IGameStateContext): Promise<void> {
        throw new Error("Method not implemented.");
    }
}