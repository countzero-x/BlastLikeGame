import { Tile } from "../../Tile";
import { TurnContext } from "../../TurnContext";
import { TurnClickProcessor } from "../../TurnProcessor";
import { Board } from "../Board";
import { DestroyEffect } from "../effects/DestroyEffect";
import { SuperTileSpawnEffect } from "../effects/SuperTileSpawnEffect";
import { TurnEffect } from "../TurnEffect";
import { SuperTile } from "./SuperTile";
import { SuperTileFactory } from "./SuperTileFactory";
import { SuperTileLogic } from "./SuperTileLogic";
import { SuperTileType } from "./SuperTileType";

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
        const superTiles = Array.from(ctx.tilesToRemove).filter(tile => tile instanceof SuperTile);

        if (superTiles.length > 0) {
            this.applyChainReaction(ctx.tilesToRemove, ctx.board);

            const effect: DestroyEffect = new DestroyEffect();
            effect.tilesToRemove = Array.from(ctx.tilesToRemove);
            return effect;
        }

        if (ctx.selectedTile && !(ctx.selectedTile instanceof SuperTile)) {
            const superType = this.getSuperTileType(ctx.initialRemovedCount);
            if (superType != SuperTileType.NONE) {
                ctx.tilesToRemove.delete(ctx.board.getTile(ctx.selectedTile.x, ctx.selectedTile.y));
                const superTile = ctx.spawner.createSuperTile(ctx.selectedTile.x, ctx.selectedTile.y, superType);
                ctx.board.setTile(ctx.selectedTile.x, ctx.selectedTile.y, superTile);

                const effect: SuperTileSpawnEffect = new SuperTileSpawnEffect();
                effect.superTile = superTile;
                return effect;
            }
        }

        return null;
    }

    public getSuperTileType(tilesRemoved: number): SuperTileType {
        return this._typeFactory.getType(tilesRemoved);
    }

    public activate(superTile: SuperTile, board: Board): Tile[] {
        const logic = this._logics.get(superTile.type);
        return logic ? logic.activate(superTile, board) : [];
    }

    private applyChainReaction(tilesToRemove: Set<Tile>, board: Board): void {
        const processed = new Set<Tile>();

        const queue: SuperTile[] = Array.from(tilesToRemove)
            .filter(tile => tile instanceof SuperTile) as SuperTile[];

        while (queue.length > 0) {
            const currentSuperTile = queue.shift()!;

            if (processed.has(currentSuperTile)) {
                continue;
            }

            processed.add(currentSuperTile);

            const affectedTiles = this.activate(currentSuperTile, board);

            for (const tile of affectedTiles) {
                if (!tilesToRemove.has(tile)) {
                    tilesToRemove.add(tile);

                    if (tile instanceof SuperTile && !processed.has(tile)) {
                        queue.push(tile);
                    }
                }
            }
        }
    }
}
