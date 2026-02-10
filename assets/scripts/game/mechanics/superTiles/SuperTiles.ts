import { Board } from "../Board";
import { TurnEffect } from "../TurnEffect";
import { SuperTileType } from "./SuperTileType";
import { Tile } from "../../Tile";
import { SuperTile } from "./SuperTile";
import { SuperTileFactory } from "./SuperTileFactory";
import { SuperTileLogic } from "./SuperTileLogic";
import { PostTurnProcessor, TurnClickProcessor } from "../../TurnProcessor";
import { TurnContext } from "../../TurnContext";
import { SuperTileSpawnEffect } from "../effects/SuperTileSpawnEffect";

export class SuperTiles implements TurnClickProcessor {

    private readonly _logics = new Map<SuperTileType, SuperTileLogic>();
    private readonly _typeFactory = new SuperTileFactory();

    public register(logic: SuperTileLogic, threshold: number): void {
        this._logics.set(logic.type, logic);
        this._typeFactory.register(logic.type, threshold);
    }

    public canProcess(ctx: TurnContext): boolean {
        return true;
    }

    public onTileClick(ctx: TurnContext): TurnEffect | null {
        if (ctx.selectedTile instanceof SuperTile) {
            for (var logic of Array.from(this._logics.values())) {
                if (logic.canProcess(ctx)) {
                    return logic.onTileClick(ctx);
                }
            }
        }
        else {
            const superType = this.getSuperTileType(ctx.initialRemovedCount);
            if (superType == SuperTileType.NONE) {
                return null;
            }

            ctx.tilesToRemove.delete(ctx.board.getTile(ctx.selectedTile.x, ctx.selectedTile.y));
            const superTile = ctx.spawner.createSuperTile(ctx.selectedTile.x, ctx.selectedTile.y, superType);
            ctx.board.setTile(ctx.selectedTile.x, ctx.selectedTile.y, superTile);

            const effect: SuperTileSpawnEffect = new SuperTileSpawnEffect();
            effect.superTile = superTile;
            return effect;
        }
    }

    public getSuperTileType(tilesRemoved: number): SuperTileType {
        return this._typeFactory.getType(tilesRemoved);
    }

    public activate(superTile: SuperTile, board: Board): Tile[] {
        const logic = this._logics.get(superTile.type);
        return logic ? logic.activate(superTile, board) : [];
    }
}

