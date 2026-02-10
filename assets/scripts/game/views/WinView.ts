import { BlastGame } from "../BlastGame";

const { ccclass, property } = cc._decorator;

@ccclass
export class WinView extends cc.Component {

    @property(cc.Button)
    private button: cc.Button

    @property(cc.Node)
    private panelWin: cc.Node;

    private _game: BlastGame

    public init(game: BlastGame) {
        this._game = game;

        this.button.node.on('click', () => {
            this._game.finish();
            this._game.start();
        })
    }

    public async show() {
        this.panelWin.scale = 0;
        this.panelWin.active = true;
        this.panelWin.runAction(
            cc.spawn(
                cc.scaleTo(0.3, 1),
                cc.fadeIn(0.3)
            )
        );
    }

    public async hide(animated: boolean = true) {
        if (animated) {
            this.panelWin.stopAllActions();
            this.panelWin.runAction(
                cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.3, 0),
                        cc.fadeOut(0.3)
                    ),
                    cc.callFunc(() => {
                        this.panelWin.active = false;
                        this.panelWin.opacity = 255;
                    })
                )
            );
        } else {
            this.panelWin.active = false;
            this.panelWin.opacity = 255;
        }
    }
}