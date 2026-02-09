import { Tile } from "./Tile";
import TileView from "./TileView";

export class TileViewPool {
    private static readonly TILES_POOL_NAME = 'TilesPool';

    private pool: cc.NodePool;
    private prefab: cc.Prefab

    public init() {
        this.pool = new cc.NodePool(TileViewPool.TILES_POOL_NAME);
    }

    public get(tile: Tile): TileView {
        let node = this.pool.get();
        if (node == null) {
            node = cc.instantiate(this.prefab);
        }
        const view = node.getComponent(TileView);
        view.setTile(tile);

        return view;
    }

    public put(tileView: TileView) {
        this.pool.put(tileView.node);
    }
}
