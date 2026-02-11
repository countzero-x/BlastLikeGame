const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView extends cc.Component {

    @property(cc.Sprite)
    private sprite: cc.Sprite = null;

    private _originalPos: cc.Vec3 | null;
    private shakeAction: cc.Action | null = null;
    private shakeResolve: (() => void) | null = null;
    
    public setSpriteFrame(spriteFrame: cc.SpriteFrame): void {
        if (spriteFrame) {
            this.node.active = true;
            this.sprite.spriteFrame = spriteFrame;
        } else {
            this.node.active = false;
        }
    }

    public getPosition(): { x: number; y: number } {
        return this.node.position;
    }

    public async startShake(): Promise<void> {
        this.stopShake();

        const shakeDistance = 10;
        const shakeSpeed = 0.05;

        const shakeSequence = cc.sequence(
            cc.moveBy(shakeSpeed, -shakeDistance, 0),
            cc.moveBy(shakeSpeed, shakeDistance * 2, 0),
            cc.moveBy(shakeSpeed, -shakeDistance * 2, 0),
            cc.moveBy(shakeSpeed, shakeDistance, 0)
        );

        this._originalPos = this.node.position.clone();

        const infiniteShake = cc.repeatForever(shakeSequence);
        infiniteShake.setTag(999);

        this.shakeAction = this.node.runAction(infiniteShake);

        return new Promise<void>((resolve) => {
            this.shakeResolve = resolve;
        });
    }

    public async stopShake(): Promise<void> {
        this.node.stopActionByTag(999);

        if (this.shakeAction) {
            this.node.stopAction(this.shakeAction);
            this.shakeAction = null;
        }

        if (this._originalPos != null) {
            this.node.setPosition(
                Math.round(this._originalPos.x),
                Math.round(this._originalPos.y)
            );
        }

        if (this.shakeResolve) {
            this.shakeResolve();
            this.shakeResolve = null;
        }
    }

    public async animateShake(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this._originalPos != null) {
                this.node.setPosition(this._originalPos);
            }
            this._originalPos = this.node.position.clone();
            this.node.stopActionByTag(999);

            const originalPos = this.node.position.clone();
            const shakeDistance = 10;
            const shakeSpeed = 0.05;

            const shakeAction = cc.sequence(
                cc.moveBy(shakeSpeed, -shakeDistance, 0),
                cc.moveBy(shakeSpeed, shakeDistance * 2, 0),
                cc.moveBy(shakeSpeed, -shakeDistance * 2, 0),
                cc.moveBy(shakeSpeed, shakeDistance, 0),
                cc.moveTo(0, originalPos.x, originalPos.y),
                cc.callFunc(() => resolve())
            );

            shakeAction.setTag(999);
            this.node.runAction(shakeAction);
        });
    }

}
