import { Board } from "../Board";
import { TurnEffect } from "../TurnEffect";
import { SuperTileType } from "./SuperTileType";
import { Tile } from "../../Tile";
import { SuperTile } from "./SuperTile";
import { SuperTileFactory } from "./SuperTileFactory";
import { SuperTileLogic } from "./SuperTileLogic";
import { TurnClickProcessor } from "../../TurnProcessor";
import { TurnContext } from "../../TurnContext";
import { SuperTileSpawnEffect } from "../effects/SuperTileSpawnEffect";
import { DestroyEffect } from "../effects/DestroyEffect";

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
            const toRemove = this.applyChainReaction(ctx.selectedTile, ctx.board);

            toRemove.forEach(tile => ctx.tilesToRemove.add(tile));

            const effect = new DestroyEffect();
            effect.tilesToRemove = toRemove;
            return effect;
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

    private applyChainReaction(tile: Tile, board: Board): Tile[] {
        const resultTiles = new Set<Tile>();
        const processed = new Set<Tile>();
        const queue: Tile[] = [tile];

        while (queue.length > 0) {
            const currentTile = queue.shift()!;

            if (processed.has(currentTile)) {
                continue;
            }

            processed.add(currentTile);

            if (currentTile instanceof SuperTile) {
                const tilesToRemove = this.activate(currentTile, board);
                resultTiles.add(currentTile);

                for (const tileToRemove of tilesToRemove) {
                    resultTiles.add(tileToRemove);

                    if (tileToRemove instanceof SuperTile && !processed.has(tileToRemove)) {
                        queue.push(tileToRemove);
                    }
                }
            }
        }

        return Array.from(resultTiles);
    }
}

