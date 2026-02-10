import { GameEvent } from "../../GameEvent";
import { BlastGame } from "../BlastGame";
import { BoosterType } from "../enums/BoosterType";
import { InputState } from "../enums/InputState";
import { TurnContext } from "../TurnContext";
import { TurnClickProcessor } from "../TurnProcessor";
import { TurnEffect } from "./TurnEffect";
import { Booster } from "./boosters/Booster";

export class Boosters implements TurnClickProcessor {
    private _game: BlastGame;

    private readonly _boosters = new Map<BoosterType, Booster>();

    private _selectedType: BoosterType = BoosterType.NONE;

    public readonly onSelectedTypeChanged = new GameEvent<BoosterType>();

    public init(game: BlastGame) {
        this._game = game;
        this._game.onInputStateChanged.subscribe(this.handleInputStateChanged, this);
    }

    public get selectedType(): BoosterType {
        return this._selectedType;
    }

    private set selectedType(type: BoosterType) {
        this._selectedType = type;
        this.onSelectedTypeChanged.invoke(this.selectedType);
    }

    public canProcess(ctx: TurnContext): boolean {
        return ctx.getInputState() != InputState.NORMAL;
    }

    public onTileClick(ctx: TurnContext): TurnEffect | null {
        const booster = this._boosters.get(this.selectedType);
        if (!booster) {
            return null;
        }

        return booster.onTileClick(ctx);
    }

    public getBooster(type: BoosterType): Booster {
        return this._boosters.get(type);
    }

    public register(booster: Booster) {
        this._boosters.set(booster.type, booster);
    }

    public reset(): void {
        this.selectedType = BoosterType.NONE;
        for (const booster of Array.from(this._boosters.values())) {
            booster.reset();
        }
    }

    public apply(type: BoosterType): void {
        const booster = this._boosters.get(type);

        if (!booster || type == BoosterType.NONE) {
            this._game.setInputState(InputState.NORMAL);
            return;
        }

        this._game.setInputState(booster.initialInputState);
    }

    public canApply(type: BoosterType): boolean {
        if (type == BoosterType.NONE) {
            return true;
        }
        const booster = this._boosters.get(type);
        return booster?.canUse() ?? false;
    }

    private handleInputStateChanged(state: InputState) {
        switch (state) {
            case InputState.NORMAL:
                this.selectedType = BoosterType.NONE;
                break;
            case InputState.BOMB:
                this.selectedType = BoosterType.BOMB;
                break
            case InputState.TELEPORT_PHASE_ONE:
            case InputState.TELEPORT_PHASE_TWO:
                this.selectedType = BoosterType.TELEPORT;
                break;
        }
    }
}
