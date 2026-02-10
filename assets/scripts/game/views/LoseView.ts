
import { BlastGame } from "../BlastGame";

const { ccclass, property } = cc._decorator;

@ccclass
export class LoseView extends cc.Component {

    @property(cc.Button)
    private button: cc.Button

    @property(cc.Node)
    private panelLose: cc.Node;

    private _game: BlastGame

    public init(game: BlastGame) {
        this._game = game;

        this.button.node.on('click', () => {
            this._game.finish();
            this._game.start();
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