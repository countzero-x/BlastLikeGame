import { GameEvent } from "../../../GameEvent";
import { BoosterType } from "../../enums/BoosterType";
import { InputState } from "../../enums/InputState";
import { BoosterDeselectedProcessor, BoosterSelectedProcessor, BoosterUsedProcessor, TurnClickProcessor } from "../../TurnProcessor";

export interface Booster extends TurnClickProcessor, BoosterSelectedProcessor, BoosterDeselectedProcessor {
    readonly type: BoosterType;
    readonly initialInputState: InputState;
    readonly onCountChanged: GameEvent<number>;

    getCount(): number;
    canUse(): boolean;
    reset(): void;
}