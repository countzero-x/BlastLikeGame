import { BlastGame } from "./BlastGame";
import { TurnContext } from "./TurnContext";
import { TurnEffect } from "./mechanics/TurnEffect";

export interface TurnProcessor {
    canProcess(ctx: TurnContext): boolean;
}

export interface PreGameProcessor {
    onPreGame(game: BlastGame): TurnEffect | null;
}

export interface PostGameProcessor {
    onPostGame(game: BlastGame): TurnEffect | null;
}

export interface PreTurnProcessor extends TurnProcessor {
    onPreTurn(ctx: TurnContext): TurnEffect | null;
}

export interface PostTurnProcessor extends TurnProcessor {
    onPostTurn(ctx: TurnContext): TurnEffect | null;
}

export interface TurnClickProcessor extends TurnProcessor {
    onTileClick(ctx: TurnContext): TurnEffect | null;
}

export interface BoosterSelectedProcessor extends TurnProcessor {
    onBoosterSelected(): TurnEffect | null;
}

export interface BoosterUsedProcessor extends TurnProcessor {
    onBoosterUsed(): TurnEffect | null;
}

export interface BoosterDeselectedProcessor extends TurnProcessor {
    onBoosterDeselected(): TurnEffect | null;
}

export interface TileDeletedProcessor extends TurnProcessor {
    onTileRemoved(ctx: TurnContext): TurnEffect | null;
}