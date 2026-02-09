import { BlastGame } from "../BlastGame";
import { GameConfig } from "../GameConfig";
import { Tile } from "../Tile";
import TileView from "./TileView";

const { ccclass, property } = cc._decorator;

@ccclass
export class BoardView extends cc.Component {

    @property(cc.Prefab)
    private tilePrefab: cc.Prefab

    @property(cc.Node)
    private tiles: cc.Node

    @property(cc.Node)
    private clickNode: cc.Node

    private _game: BlastGame
    private _tileViews: TileView[][] = [];

    private pool: cc.NodePool;

    public init(game: BlastGame) {
        this.pool = new cc.NodePool('TilesPool');

        this._game = game;
        this.clickNode.on(cc.Node.EventType.TOUCH_END, this.onTouch, this);
    }

    public updateView() {
        for (let x = 0; x < this._game._board.width; x++) {
            for (let y = 0; y < this._game._board.height; y++) {
                if (this._tileViews.length - 1 < x) {
                    continue;
                }

                if (this._tileViews[x].length - 1 < y) {
                    console;
                }

                if (this._tileViews[x][y] != null) {
                    this.pool.put(this._tileViews[x][y].node);
                    this._tileViews[x][y] = null;
                }

            }
        }
        this.createTileViews();
    }

    private onTouch(event: cc.Event.EventTouch): void {
        const touchPos = event.getLocation();
        const gridPos = this.worldToGridPos(touchPos);

        cc.log(`Клик в мировых координатах: (${touchPos.x}, ${touchPos.y})`);
        cc.log(`Конвертировано в сетку: (${gridPos.x}, ${gridPos.y})`);

        const tile = this._game._board.getTile(gridPos.x, gridPos.y);
        if (tile) {
            cc.log(`Тайл найден: цвет=${tile.color}, isEmpty=${tile.isEmpty}`);
        } else {
            cc.log(`Тайл не найден (вне границ)`);
        }

        if (this.isValidPosition(gridPos.x, gridPos.y)) {
            this._game.makeMove(gridPos.x, gridPos.y);
        }
    }

    private createTileViews(): void {
        for (let x = 0; x < this._game._board.width; x++) {
            this._tileViews[x] = [];
            for (let y = 0; y < this._game._board.height; y++) {
                const tile = this._game._board.getTile(x, y);
                const tileView = this.createTileView(tile);
                this._tileViews[x][y] = tileView;
            }
        }
    }

    private isValidPosition(x: number, y: number): boolean {
        return x >= 0 && x < this._game._board.width && y >= 0 && y < this._game._board.height;
    }

    private createTileView(tile: Tile): TileView {
        if (tile == null) {
            return;
        }

        let tileNode = this.pool.get();
        if (tileNode == null) {
            tileNode = cc.instantiate(this.tilePrefab);
        }

        const tileView = tileNode.getComponent(TileView);

        tileView.setTile(tile);
        tileNode.position = this.gridToWorldPos(tile.x, tile.y);

        this.tiles.addChild(tileNode);
        return tileView;
    }

    private gridToWorldPos(x: number, y: number): cc.Vec3 {
        const startX = -(this._game._board.width * (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING)) / 2 + GameConfig.TILE_SIZE / 2;
        const startY = -(this._game._board.height * (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING)) / 2 + GameConfig.TILE_SIZE / 2;

        return cc.v3(
            startX + x * (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING),
            startY + y * (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING),
            0
        );
    }

    private worldToGridPos(worldPos: cc.Vec2): { x: number, y: number } | null {
        const localPos = this.tiles.convertToNodeSpaceAR(worldPos);

        const startX = -(this._game._board.width * (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING)) / 2 + GameConfig.TILE_SIZE / 2;
        const startY = -(this._game._board.height * (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING)) / 2 + GameConfig.TILE_SIZE / 2;

        const x = Math.floor((localPos.x - startX + GameConfig.TILE_SIZE / 2) / (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING));
        const y = Math.floor((localPos.y - startY + GameConfig.TILE_SIZE / 2) / (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING));

        return { x, y };
    }
}
