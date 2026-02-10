import { GameEvent } from "../../../GameEvent";
import { BoosterType } from "../../enums/BoosterType";
import { InputState } from "../../enums/InputState";
import { TurnClickProcessor } from "../../TurnProcessor";
import { Board } from "../Board";

export interface Booster extends TurnClickProcessor {
    readonly type: BoosterType;
    readonly initialInputState: InputState;
    readonly onCountChanged: GameEvent<number>;

    getCount(): number;
    canUse(): boolean;
    reset(): void;
}