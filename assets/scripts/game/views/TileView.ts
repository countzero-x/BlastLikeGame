import { SuperTile } from "../SuperTile";
import { Tile } from "../Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView extends cc.Component {

    @property(cc.Sprite)
    private sprite: cc.Sprite = null;

    @property([cc.SpriteFrame])
    private colorSprites: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    private superTileSprites: cc.SpriteFrame[] = [];

    private _tile: Tile = null;

    public setTile(tile: Tile): void {
        this._tile = tile;
        this.updateVisual();
    }

    private updateVisual(): void {
        if (!this._tile || this._tile.isEmpty) {
            this.node.active = false;
            return;
        }

        // todo: не уверен что нужен один вью на оба типа
        this.node.active = true;
        if (this._tile instanceof SuperTile) {
            this.sprite.spriteFrame = this.superTileSprites[this._tile.type];
        }
        else {
            this.sprite.spriteFrame = this.colorSprites[this._tile.color];
        }
    }

    public getTile(): Tile {
        return this._tile;
    }
}

