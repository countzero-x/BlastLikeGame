import { BlastGame } from "../BlastGame";
import { BoosterType } from "../enums/BoosterType";
import { Boosters } from "../mechanics/Boosters";
import { Booster } from "../mechanics/boosters/Booster";
import { GameMediator } from "../mechanics/GameMediator";

const { ccclass, property } = cc._decorator;

@ccclass
export class BoosterView extends cc.Component {

    @property(cc.Label)
    private label: cc.Label

    @property(cc.Button)
    private button: cc.Button;

    private _mediator: GameMediator

    private _type: BoosterType;

    public get type(): BoosterType {
        return this._type;
    }

    public init(mediator: GameMediator, type: BoosterType) {
        this._mediator = mediator;
        this._type = type;

        this._mediator.onBoosterCountChanged.subscribe(this.handleCountChanged, this);
        this._mediator.onBoosterTypeChanged.subscribe(this.handleTypeChanged, this)
        this.handleCountChanged({ type: this._type, count: this._mediator.getBoosterCount(this.type) });

        this.button.node.on('click', this.handleClicked.bind(this));
    }

    private handleClicked() {
        if (this._mediator.getSelectedBoosterType() == this.type) {
            this._mediator.deselectBooster(this.type);
        } else if (this._mediator.canSelectBooster(this.type)) {
            this._mediator.selectBooster(this.type);
        }
    }

    private handleCountChanged(data: { type: BoosterType, count: number }) {
        if (data.type != this.type) {
            return;
        }

        this.label.string = data.count.toString();
        this.button.interactable = this._mediator.canSelectBooster(this.type);
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
