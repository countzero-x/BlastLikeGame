import { GameEvent } from "../../GameEvent";
import { BoosterType } from "../enums/BoosterType";
import { GameState } from "../enums/GameState";
import { InputState } from "../enums/InputState";
import { Tile } from "../Tile";
import { TurnEffect } from "./TurnEffect";


export interface GameMediator {
    readonly onStateChanged: GameEvent<GameState>;
    readonly onInputStateChanged: GameEvent<InputState>;
    readonly onTurnFinished: GameEvent<Array<TurnEffect>>;
    readonly onGameStarted: GameEvent<Array<TurnEffect>>;
    readonly onGameFinished: GameEvent<Array<TurnEffect>>;

    readonly onBoosterSelected: GameEvent<Array<TurnEffect>>;
    readonly onBoosterDeselected: GameEvent<Array<TurnEffect>>;
    readonly onBoosterTypeChanged: GameEvent<BoosterType>;
    readonly onBoosterCountChanged: GameEvent<{ type: BoosterType, count: number }>;

    startGame(): void;
    finishGame(): void;

    enableInput(): void;
    disableInput(): void;

    click(x: number, y: number): void;
    getBoardWidth(): number;
    getBoardHeight(): number;
    getTile(x: number, y: number): Tile;

    getCurrentScore(): number;
    getTargetScore(): number;

    getMovesCount(): number;

    canSelectBooster(type: BoosterType): boolean;
    selectBooster(type: BoosterType): void;
    deselectBooster(type: BoosterType): void;
    getBoosterCount(type: BoosterType): number;
    getSelectedBoosterType(): BoosterType;
}