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
}
