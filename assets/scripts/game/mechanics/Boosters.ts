import { BoosterType } from "../enums/BoosterType";
import { InputState } from "../enums/InputState";
import { Tile } from "../Tile";
import { BoosterContext, IBooster } from "./boosters/IBooster";

export class Boosters {
    private readonly _boosters = new Map<BoosterType, IBooster>();

    private _selectedType: BoosterType = BoosterType.NONE;
    private _ctx: BoosterContext;

    public setContext(context: BoosterContext) {
        this._ctx = context;
    }

    public get selectedType(): BoosterType {
        return this._selectedType;
    }

    public getBooster(type: BoosterType): IBooster {
        return this._boosters.get(type);
    }

    public register(booster: IBooster) {
        this._boosters.set(booster.type, booster);
    }

    public reset(): void {
        this._selectedType = BoosterType.NONE;
        for (const booster of Array.from(this._boosters.values())) {
            booster.reset();
        }
    }

    public apply(type: BoosterType): void {
        const booster = this._boosters.get(type);
        this._selectedType = type;

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

    public processClick(tile: Tile): Tile[] {
        const booster = this._boosters.get(this._selectedType);
        if (!booster) return [];

        return booster.onClick(this._ctx, tile);
    }
}
