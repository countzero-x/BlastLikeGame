import { GameEvent } from "../../GameEvent";
import { BoosterType } from "../enums/BoosterType";
import { InputState } from "../enums/InputState";
import { TurnContext } from "../TurnContext";
import { TurnClickProcessor } from "../TurnProcessor";
import { TurnEffect } from "./Board";
import { BoosterContext, Booster } from "./boosters/IBooster";

export class Boosters implements TurnClickProcessor {
    private readonly _boosters = new Map<BoosterType, Booster>();

    private _selectedType: BoosterType = BoosterType.NONE;
    private _ctx: BoosterContext;

    public readonly onSelectedTypeChanged = new GameEvent<BoosterType>();

    public setContext(context: BoosterContext) {
        this._ctx = context;

        this._ctx.inputStateChanged.subscribe(this.handleInputStateChanged, this);
    }

    public get selectedType(): BoosterType {
        return this._selectedType;
    }

    private set selectedType(type: BoosterType) {
        this._selectedType = type;
        this.onSelectedTypeChanged.invoke(this.selectedType);
    }

    canProcess(ctx: TurnContext): boolean {
        return ctx.inputState != InputState.NORMAL;
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
        this.selectedType = type;

        if (!booster || type == BoosterType.NONE) {
            this._ctx.setInputState(InputState.NORMAL);
            return;
        }

        this._ctx.setInputState(booster.initialInputState);
    }

    public canApply(type: BoosterType): boolean {
        if (type == BoosterType.NONE) return true;
        const booster = this._boosters.get(type);
        return booster?.canUse() ?? false;
    }

    private handleInputStateChanged(state: InputState) {
        switch (state) {
            case InputState.NORMAL:
                this._selectedType = BoosterType.NONE;
                break;
            case InputState.BOMB:
                this._selectedType = BoosterType.BOMB;
                break
            case InputState.TELEPORT_PHASE_ONE:
            case InputState.TELEPORT_PHASE_TWO:
                this._selectedType = BoosterType.TELEPORT;
                break;
        }
    }
}
