import { BlastGame } from "./BlastGame";
import { TurnContext } from "./TurnContext";
import { TurnEffect } from "./mechanics/TurnEffect";

export type TurnProcessor = {
    canProcess(ctx: TurnContext): boolean;
}

export type PreGameProcessor = {
    onPreGame(game: BlastGame): TurnEffect | null;
}

export type PostGameProcessor = {
    onPostGame(game: BlastGame): TurnEffect | null;
}

export type PreTurnProcessor = TurnProcessor & {
    onPreTurn(ctx: TurnContext): TurnEffect | null;
}

export type PostTurnProcessor = TurnProcessor & {
    onPostTurn(ctx: TurnContext): TurnEffect | null;
}

export type TurnClickProcessor = TurnProcessor & {
    onTileClick(ctx: TurnContext): TurnEffect | null;
}

export type BoosterSelectedProcessor = TurnProcessor & {
    onBoosterSelected(): TurnEffect | null;
}

export type BoosterUsedProcessor = TurnProcessor & {
    onBoosterUsed(): TurnEffect | null;
}

export type BoosterDeselectedProcessor = TurnProcessor & {
    onBoosterDeselected(): TurnEffect | null;
}

export type TileDeletedProcessor = TurnProcessor & {
    onTileRemoved(ctx: TurnContext): TurnEffect | null;
}