import { SuperTile } from "../SuperTile";
import { Tile } from "../Tile";

// TileView.ts - полная версия с супер-тайлами
const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView extends cc.Component {

    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    @property([cc.SpriteFrame])
    colorSprites: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    superTileSprites: cc.SpriteFrame[] = [];

    private tile: Tile = null;
    public onTileClick: (x: number, y: number) => void = null;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouch, this);
    }

    private onTouch(event: cc.Event.EventTouch): void {
        if (this.tile && !this.tile.isEmpty && this.onTileClick) {
            event.stopPropagation();
            this.onTileClick(this.tile.x, this.tile.y);
        }
    }

    public setTile(tile: Tile): void {
        this.tile = tile;
        this.updateVisual();
    }

    private updateVisual(): void {
        if (!this.tile || this.tile.isEmpty) {
            this.node.active = false;
            return;
        }

        // todo: не уверен что нужен один вью на оба типа
        this.node.active = true;
        if (this.tile instanceof SuperTile) {
            this.sprite.spriteFrame = this.superTileSprites[this.tile.type];
        }
        else {
            this.sprite.spriteFrame = this.colorSprites[this.tile.color];
        }
    }

    public getTile(): Tile {
        return this.tile;
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouch, this);
    }
}