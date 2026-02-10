const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView extends cc.Component {

    @property(cc.Sprite)
    private sprite: cc.Sprite = null;

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

    public animateShake(): void {
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
        );

        shakeAction.setTag(999);
        this.node.runAction(shakeAction);
    }
}
