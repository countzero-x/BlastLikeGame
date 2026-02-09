import { SuperTileType } from "../enums/SuperTileType";
import { TileColor } from "../enums/TileColor";
import { SuperTile } from "../mechanics/superTiles/SuperTile";
import { Tile } from "../Tile";
import TileView from "./TileView";

// todo: не оч хорошо что он и пул, и фабрика
// но разделить их - трата времени на данном этапе
export class TileViewPool {
    private static readonly TILES_POOL_NAME = 'TilesPool';

    private pool: cc.NodePool;
    private prefab: cc.Prefab;

    private regularTilesSprites: Map<TileColor, cc.SpriteFrame> = new Map();
    private superTilesSprites: Map<SuperTileType, cc.SpriteFrame> = new Map();

    registerRegularTile(color: TileColor, sprite: cc.SpriteFrame) {
        this.regularTilesSprites.set(color, sprite);
    }

    registerSuperTile(type: SuperTileType, sprite: cc.SpriteFrame) {
        this.superTilesSprites.set(type, sprite);
    }

    public init(prefab: cc.Prefab, preinstantiatedCount: number) {
        this.prefab = prefab;
        this.pool = new cc.NodePool(TileViewPool.TILES_POOL_NAME);

        for (let i = 0; i < preinstantiatedCount; i++) {
            const tileView = cc.instantiate(this.prefab);
            this.pool.put(tileView);
        }
    }

    public terminate() {
        this.pool.clear();
    }

    public get(tile: Tile): TileView {
        let node = this.pool.get();
        if (node == null) {
            node = cc.instantiate(this.prefab);
        }
        const view = node.getComponent(TileView);

        if (tile instanceof SuperTile) {
            const sprite = this.superTilesSprites.get(tile.type);
            view.setSpriteFrame(sprite);
        }
        else {
            const sprite = this.regularTilesSprites.get(tile.color);
            view.setSpriteFrame(sprite);
        }

        return view;
    }

    public put(tileView: TileView) {
        this.pool.put(tileView.node);
    }
}
