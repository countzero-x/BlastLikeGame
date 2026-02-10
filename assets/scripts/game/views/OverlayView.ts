const { ccclass, property } = cc._decorator;

@ccclass
export class OverlayView extends cc.Component {

    @property(cc.Node)
    private ovelay: cc.Node;

    private _currentOpacity: number

    protected onEnable(): void {
        this._currentOpacity = this.ovelay.opacity;
    }

    public async show(animated: boolean = true) {
        if (animated) {
            this.ovelay.opacity = 0;
            this.ovelay.active = true;
            this.ovelay.runAction(
                cc.fadeTo(0.3, this._currentOpacity)
            );
        } else {
            this.ovelay.opacity = this._currentOpacity;
        }
    }

    public async hide(animated: boolean = true) {
        if (animated) {
            this.ovelay.runAction(
                cc.sequence(
                    cc.fadeOut(0.3),
                    cc.callFunc(() => {
                        this.ovelay.active = false;
                    })
                )
            );
        } else {
            this.ovelay.active = false;
        }
    }
}
