import { InputState } from "./enums/InputState";
import { TurnEffect } from "./mechanics/Board";
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

        if (match.length == 0) {
            const shakeEffect: ShakeEffect = new ShakeEffect();
            shakeEffect.tileToShake = ctx.selectedTile;
            return shakeEffect;
        } else {
            const toRemove = (ctx.selectedTile instanceof SuperTile)
                ? [...match, ctx.selectedTile]
                : [...match];

            for (var tile of toRemove) {
                ctx.tilesToRemove.add(tile);
            }

            const destroyEffect: DestroyEffect = new DestroyEffect();
            destroyEffect.tilesToRemove = toRemove;
            return destroyEffect;
        };
    }
}