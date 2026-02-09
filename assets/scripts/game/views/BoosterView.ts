import { BlastGame } from "../BlastGame";
import { BoosterType } from "../enums/BoosterType";
import { Boosters } from "../mechanics/Boosters";
import { IBooster } from "../mechanics/boosters/IBooster";

const { ccclass, property } = cc._decorator;

@ccclass
export class BoosterView extends cc.Component {

    @property(cc.Label)
    private label: cc.Label

    @property(cc.Button)
    private button: cc.Button;

    private _booster: IBooster;
    private _boosters: Boosters

    public init(boosters: Boosters, type: BoosterType) {
        this._boosters = boosters;

        this._booster = this._boosters.getBooster(type);

        this.button.node.on('click', () => {
            if (this._boosters.selectedType == type) {
                this._boosters.apply(BoosterType.NONE);
            } else if (this._boosters.canApply(type)) {
                this._boosters.apply(type);
            }
        });
    }

    public updateView() {
        this.label.string = this._booster.count().toString();
        this.button.interactable = this._boosters.canApply(BoosterType.BOMB);
    }
}
