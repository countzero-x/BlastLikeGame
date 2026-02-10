import { BlastGame } from "../BlastGame";
import { Tile } from "../Tile";

import TileView from "./TileView";
import { TileViewPool } from "./TileViewPool";

const { ccclass, property } = cc._decorator;

@ccclass
export class BoardView extends cc.Component {

    @property(cc.Node)
    private tiles: cc.Node

    @property(cc.Node)
    private clickNode: cc.Node

    private _game: BlastGame
    private _tileSize: number;
    private _tileSpacing: number;
    private _tileViews: TileView[][] = [];
    private _tileViewPool: TileViewPool;

    public init(game: BlastGame, tileViewPool: TileViewPool, tileSize: number, tileSpacing: number) {
        this._tileViewPool = tileViewPool;
        this._game = game;
        this._tileSize = tileSize;
        this._tileSpacing = tileSpacing;
    }

    protected onEnable(): void {
        this.clickNode.on(cc.Node.EventType.TOUCH_END, this.onTouch, this);
    }

    protected onDisable(): void {
        this.clickNode.off(cc.Node.EventType.TOUCH_END, this.onTouch, this);
    }

    public updateView() {
        for (let x = 0; x < this._game.board.width; x++) {
            for (let y = 0; y < this._game.board.height; y++) {
                if (this._tileViews.length - 1 < x) {
                    continue;
                }

                if (this._tileViews[x].length - 1 < y) {
                    console;
                }

                if (this._tileViews[x][y] != null) {
                    this._tileViewPool.put(this._tileViews[x][y]);
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

        const tile = this._game.board.getTile(gridPos.x, gridPos.y);
        if (tile) {
            cc.log(`Тайл найден: цвет=${tile.color}, isEmpty=${tile.isEmpty}`);
        } else {
            cc.log(`Тайл не найден (вне границ)`);
        }

        if (this.isValidPosition(gridPos.x, gridPos.y)) {
            this._game.input.invokeTileClick({ x: gridPos.x, y: gridPos.y });
        }
    }

    private createTileViews(): void {
        for (let x = 0; x < this._game.board.width; x++) {
            this._tileViews[x] = [];
            for (let y = 0; y < this._game.board.height; y++) {
                const tile = this._game.board.getTile(x, y);
                const tileView = this.createTileView(tile);
                this._tileViews[x][y] = tileView;
            }
        }
    }

    private isValidPosition(x: number, y: number): boolean {
        return x >= 0 && x < this._game.board.width && y >= 0 && y < this._game.board.height;
    }

    private createTileView(tile: Tile): TileView {
        if (tile == null) {
            return;
        }

        const view = this._tileViewPool.get(tile);
        view.node.position = this.gridToWorldPos(tile.x, tile.y);

        this.tiles.addChild(view.node);
        return view;
    }

    private gridToWorldPos(x: number, y: number): cc.Vec3 {
        const startX = -(this._game.board.width * (this._tileSize + this._tileSpacing)) / 2 + this._tileSize / 2;
        const startY = -(this._game.board.height * (this._tileSize + this._tileSpacing)) / 2 + this._tileSize / 2;

        return cc.v3(
            startX + x * (this._tileSize + this._tileSpacing),
            startY + y * (this._tileSize + this._tileSpacing),
            0
        );
    }

    private worldToGridPos(worldPos: cc.Vec2): { x: number, y: number } | null {
        const localPos = this.tiles.convertToNodeSpaceAR(worldPos);

        const startX = -(this._game.board.width * (this._tileSize + this._tileSpacing)) / 2 + this._tileSize / 2;
        const startY = -(this._game.board.height * (this._tileSize + this._tileSpacing)) / 2 + this._tileSize / 2;

        const x = Math.floor((localPos.x - startX + this._tileSize / 2) / (this._tileSize + this._tileSpacing));
        const y = Math.floor((localPos.y - startY + this._tileSize / 2) / (this._tileSize + this._tileSpacing));

        return { x, y };
    }
}
