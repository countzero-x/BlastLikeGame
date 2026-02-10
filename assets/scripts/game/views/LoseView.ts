
import { BlastGame } from "../BlastGame";
import { GameMediator } from "../mechanics/GameMediator";

const { ccclass, property } = cc._decorator;

@ccclass
export class LoseView extends cc.Component {

    @property(cc.Button)
    private button: cc.Button

    @property(cc.Node)
    private panelLose: cc.Node;

    private _mediator: GameMediator

    public init(mediator: GameMediator) {
        this._mediator = mediator;

        this.button.node.on('click', () => {
            this._mediator.finishGame();
            this._mediator.startGame();
        })
    }

    public async show(animated: boolean = true) {
        this.panelLose.scale = 0;
        this.panelLose.active = true;
        this.panelLose.runAction(
            cc.spawn(
                cc.scaleTo(0.3, 1),
                cc.fadeIn(0.3)
            )
        );
    }

    public async hide(animated: boolean = true) {
        if (animated) {
            this.panelLose.stopAllActions();
            this.panelLose.runAction(
                cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.3, 0),
                        cc.fadeOut(0.3)
                    ),
                    cc.callFunc(() => {
                        this.panelLose.active = false;
                        this.panelLose.opacity = 255;
                    })
                )
            );
        } else {
            this.panelLose.active = false;
            this.panelLose.opacity = 255;
        }
    }
}