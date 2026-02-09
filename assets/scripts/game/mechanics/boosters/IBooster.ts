import { BoosterType } from "../../enums/BoosterType";
import { InputState } from "../../enums/InputState";
import { Tile } from "../../Tile";
import { Board } from "../Board";

export interface BoosterContext {
    board: Board;
    setInputState(state: InputState): void;
}

export interface IBooster {
    readonly type: BoosterType;
    readonly initialInputState: InputState;
    
    count(): number;
    canUse(): boolean;
    onClick(ctx: BoosterContext, tile: Tile): Tile[];
    reset(): void;
}