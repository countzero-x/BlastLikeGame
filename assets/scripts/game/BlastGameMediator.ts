import { GameEvent } from "../GameEvent";
import { BlastGame } from "./BlastGame";
import { BoosterType } from "./enums/BoosterType";
import { GameState } from "./enums/GameState";
import { InputState } from "./enums/InputState";
import { GameMediator } from "./mechanics/GameMediator";
import { TurnEffect } from "./mechanics/TurnEffect";
import { Tile } from "./Tile";


export class BlastGameMediator implements GameMediator {
    public readonly onStateChanged = new GameEvent<GameState>();
    public readonly onInputStateChanged = new GameEvent<InputState>();
    public readonly onTurnFinished = new GameEvent<TurnEffect[]>();
    public readonly onGameStarted = new GameEvent<TurnEffect[]>();
    public readonly onGameFinished = new GameEvent<TurnEffect[]>();
    public readonly onSelectedTypeChanged = new GameEvent<BoosterType>();
    public readonly onBoosterCountChanged = new GameEvent<{ type: BoosterType; count: number; }>();

    private _game: BlastGame;

    public constructor(game: BlastGame) {
        this._game = game;

        this._game.onStateChanged.subscribe(x => this.onStateChanged.invoke(x), this);
        this._game.onInputStateChanged.subscribe(x => this.onInputStateChanged.invoke(x), this);
        this._game.onTurnFinished.subscribe(x => this.onTurnFinished.invoke(x), this);
        this._game.onGameStarted.subscribe(x => this.onGameStarted.invoke(x), this);
        this._game.onGameFinished.subscribe(x => this.onGameFinished.invoke(x), this);
        
        this._game.boosters.onSelectedTypeChanged.subscribe(x => {
            const booster = this._game.boosters.getBooster(x);
            this.onBoosterCountChanged.invoke({
                type: x,
                count: booster?.getCount() ?? 0
            });
        }, this);

        // todo: не ожидаю что появятся новые бустеры после создания медиатора
        for (var booster of this._game.boosters.boosters) {
            booster.onCountChanged.subscribe((c) => this.onBoosterCountChanged.invoke({ type: booster.type, count: c }), this);
        }
    }

    startGame(): void {
        this._game.start();
    }

    finishGame(): void {
        this._game.finish();
    }

    enableInput(): void {
        this._game.input.enable();
    }

    disableInput(): void {
        this._game.input.disable();
    }

    click(x: number, y: number): void {
        this._game.processTurn(x, y);
    }

    getBoardWidth(): number {
        return this._game.board.width;
    }

    getBoardHeight(): number {
        return this._game.board.height;
    }

    getTile(x: number, y: number): Tile {
        return this._game.board.getTile(x, y);
    }

    getCurrentScore(): number {
        return this._game.score.currentScore;
    }

    getTargetScore(): number {
        return this._game.score.targetScore;
    }

    getMovesCount(): number {
        return this._game.moves.currentMoves;
    }

    canSelectBooster(type: BoosterType): boolean {
        return this._game.boosters.canApply(type);
    }

    selectBooster(type: BoosterType): void {
        this._game.boosters.apply(type);
    }

    deselectBooster(type: BoosterType): void {
        this._game.boosters.apply(BoosterType.NONE);
    }

    getBoosterCount(type: BoosterType): number {
        return this._game.boosters.getBooster(type).getCount();
    }

    getSelectedBoosterType(): BoosterType {
        return this._game.boosters.selectedType;
    }
}
