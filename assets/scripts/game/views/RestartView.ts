import { BlastGame } from "../BlastGame";
import { GameMediator } from "../mechanics/GameMediator";

const { ccclass, property } = cc._decorator;

@ccclass
export class RestartView extends cc.Component {

    @property(cc.Button)
    private button: cc.Button

    private _mediator: GameMediator

    public init(mediator: GameMediator) {
        this._mediator = mediator;

        this.button.node.on('click', () => {
            if (this._mediator.isInputEnabled()) {
                this._mediator.finishGame();
                this._mediator.startGame();
            }
        })
    }

    public async show(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.node.scale = 0;
            this.node.active = true;
            this.node.runAction(
                cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.3, 1),
                        cc.fadeIn(0.3)
                    ),
                    cc.callFunc(() => resolve())
                )
            );
        });
    }

    public async hide(animated: boolean = true): Promise<void> {
        return new Promise<void>((resolve) => {
            if (animated) {
                this.node.stopAllActions();
                this.node.runAction(
                    cc.sequence(
                        cc.spawn(
                            cc.scaleTo(0.3, 0),
                            cc.fadeOut(0.3)
                        ),
                        cc.callFunc(() => {
                            this.node.active = false;
                            this.node.opacity = 255;
                            resolve();
                        })
                    )
                );
            } else {
                this.node.active = false;
                this.node.opacity = 255;
                resolve();
            }
        });
    }
}