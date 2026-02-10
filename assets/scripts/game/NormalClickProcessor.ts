import { InputState } from "./enums/InputState";
import { TurnEffect } from "./mechanics/TurnEffect";
import { DestroyEffect } from "./mechanics/effects/DestroyEffect";
import { ShakeEffect } from "./mechanics/effects/ShakeEffect";
import { SuperTile } from "./mechanics/superTiles/SuperTile";
import { TurnContext } from "./TurnContext";
import { TurnClickProcessor } from "./TurnProcessor";

export class NormalClickProcessor implements TurnClickProcessor {
    public canProcess(ctx: TurnContext): boolean {
        return ctx.getInputState() == InputState.NORMAL;
    }

    public onTileClick(ctx: TurnContext): TurnEffect | null {
        const match = ctx.matches.getAvaliableMatch(ctx.board, ctx.selectedTile.x, ctx.selectedTile.y);
        ctx.initialRemovedCount = match.length;

        if (ctx.selectedTile instanceof SuperTile) {
            ctx.tilesToRemove.add(ctx.selectedTile);
            const destroyEffect: DestroyEffect = new DestroyEffect();
            destroyEffect.tilesToRemove = [ctx.selectedTile];
            return destroyEffect;
        }
        else if (match.length == 0) {
            const shakeEffect: ShakeEffect = new ShakeEffect();
            shakeEffect.tileToShake = ctx.selectedTile;
            return shakeEffect;
        } else {
            for (const tile of match) {
                ctx.tilesToRemove.add(tile);
            }

            const destroyEffect: DestroyEffect = new DestroyEffect();
            destroyEffect.tilesToRemove = [...match];
            return destroyEffect;
        };
    }
}