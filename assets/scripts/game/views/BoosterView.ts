import { BlastGame } from "../BlastGame";
import { BoosterType } from "../enums/BoosterType";
import { Boosters } from "../mechanics/Boosters";
import { Booster } from "../mechanics/boosters/Booster";

const { ccclass, property } = cc._decorator;

@ccclass
export class BoosterView extends cc.Component {

    @property(cc.Label)
    private label: cc.Label

    @property(cc.Button)
    private button: cc.Button;

    private _booster: Booster;
    private _boosters: Boosters

    private _type: BoosterType;

    public get type(): BoosterType {
        return this._type;
    }

    public init(boosters: Boosters, type: BoosterType) {
        this._boosters = boosters;
        this._type = type;

        this._booster = this._boosters.getBooster(type);
        this._booster.onCountChanged.subscribe(this.handleCountChanged, this);
        boosters.onSelectedTypeChanged.subscribe(this.handleTypeChanged, this)
        this.handleCountChanged(this._booster.getCount());

        this.button.node.on('click', () => {
            if (this._boosters.selectedType == type) {
                this._boosters.apply(BoosterType.NONE);
            } else if (this._boosters.canApply(type)) {
                this._boosters.apply(type);
            }
        });
    }

    private handleCountChanged(value: number) {
        this.label.string = this._booster.getCount().toString();
        this.button.interactable = this._boosters.canApply(this.type);
    }

    private handleTypeChanged(type: BoosterType) {
        this.animateBoosterActive(this._type == type);
    }

    public animateBoosterActive(active: boolean): void {
        const scale = active ? 1.2 : 1.0;
        const color = active ? cc.Color.YELLOW : cc.Color.WHITE;

        this.node.stopAllActions();
        this.node.runAction(
            cc.spawn(
                cc.scaleTo(0.2, scale),
                cc.tintTo(0.2, color.r, color.g, color.b)
            )
        );

        if (active) {
            this.node.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.scaleTo(0.5, 1.3),
                        cc.scaleTo(0.5, 1.2)
                    )
                )
            );
        }
    }
}
