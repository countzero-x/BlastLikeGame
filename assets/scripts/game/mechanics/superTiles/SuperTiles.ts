import { Board } from "../Board";
import { SuperTileType } from "../../enums/SuperTileType";
import { Tile } from "../../Tile";
import { SuperTile } from "./SuperTile";
import { SuperTileFactory } from "./SuperTileFactory";
import { SuperTileLogic } from "./SuperTileLogic";

export class SuperTiles {
    private readonly _logics = new Map<SuperTileType, SuperTileLogic>();
    private readonly _typeFactory = new SuperTileFactory();

    public register(logic: SuperTileLogic, threshold: number): void {
        this._logics.set(logic.type, logic);
        this._typeFactory.register(logic.type, threshold);
    }

    public GetSuperTileType(tilesRemoved: number): SuperTileType {
        return this._typeFactory.getType(tilesRemoved);
    }

    public activate(superTile: SuperTile, board: Board): Tile[] {
        const logic = this._logics.get(superTile.type);
        return logic ? logic.activate(superTile, board) : [];
    }
}

