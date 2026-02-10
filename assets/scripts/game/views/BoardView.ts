import { Board } from "../mechanics/Board";
import { TileMove } from "../mechanics/Gravity";
import { Input } from "../mechanics/Input";
import { SuperTile } from "../mechanics/superTiles/SuperTile";
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

    private _board: Board;
    private _input: Input;
    private _tileSize: number;
    private _tileSpacing: number;
    private _tileViews: TileView[][] = [];
    private _tileViewPool: TileViewPool;

    public init(board: Board, input: Input, tileViewPool: TileViewPool, tileSize: number, tileSpacing: number) {
        this._tileViewPool = tileViewPool;
        this._board = board;
        this._input = input;
        this._tileSize = tileSize;
        this._tileSpacing = tileSpacing;

        for (let x = 0; x < this._board.width; x++) {
            this._tileViews[x] = [];
            for (let y = 0; y < this._board.height; y++) {
                this._tileViews[x][y] = null;
            }
        }
    }

    protected onEnable(): void {
        this.clickNode.on(cc.Node.EventType.TOUCH_END, this.onTouch, this);
    }

    protected onDisable(): void {
        this.clickNode.off(cc.Node.EventType.TOUCH_END, this.onTouch, this);
    }

    public getTileView(x: number, y: number): TileView | null {
        if (x >= 0 && x < this._board.width && y >= 0 && y < this._board.height) {
            return this._tileViews[x][y];
        }
        return null;
    }

    public reset() {
        for (let x = 0; x < this._board.width; x++) {
            this._tileViews[x] = [];
            for (let y = 0; y < this._board.height; y++) {
                if (this._tileViews[x][y] != null) {
                    this._tileViewPool.put(this._tileViews[x][y]);
                }
                this._tileViews[x][y] = null;
            }
        }
    }

    private onTouch(event: cc.Event.EventTouch): void {
        const touchPos = event.getLocation();
        const gridPos = this.worldToGridPos(touchPos);

        cc.log(`Клик в мировых координатах: (${touchPos.x}, ${touchPos.y})`);
        cc.log(`Конвертировано в сетку: (${gridPos.x}, ${gridPos.y})`);

        const tile = this._board.getTile(gridPos.x, gridPos.y);
        if (tile) {
            cc.log(`Тайл найден: цвет=${tile.color}, isEmpty=${tile.isEmpty}`);
        } else {
            cc.log(`Тайл не найден (вне границ)`);
        }

        if (this.isValidPosition(gridPos.x, gridPos.y)) {
            this._input.invokeTileClick({ x: gridPos.x, y: gridPos.y });
        }
    }

    private isValidPosition(x: number, y: number): boolean {
        return x >= 0 && x < this._board.width && y >= 0 && y < this._board.height;
    }

    // ИСПРАВЛЕНО: явный возврат null и правильная типизация
    private createTileView(tile: Tile): TileView | null {
        if (tile == null) {
            return null;
        }

        const view = this._tileViewPool.get(tile);
        view.node.position = this.gridToWorldPos(tile.x, tile.y);

        this.tiles.addChild(view.node);
        return view;
    }

    private gridToWorldPos(x: number, y: number): cc.Vec3 {
        const startX = -(this._board.width * (this._tileSize + this._tileSpacing)) / 2 + this._tileSize / 2;
        const startY = -(this._board.height * (this._tileSize + this._tileSpacing)) / 2 + this._tileSize / 2;

        return cc.v3(
            startX + x * (this._tileSize + this._tileSpacing),
            startY + y * (this._tileSize + this._tileSpacing),
            0
        );
    }

    // ИСПРАВЛЕНО: убрал | null из возвращаемого типа, т.к. всегда возвращаем объект
    private worldToGridPos(worldPos: cc.Vec2): { x: number, y: number } {
        const localPos = this.tiles.convertToNodeSpaceAR(worldPos);

        const startX = -(this._board.width * (this._tileSize + this._tileSpacing)) / 2 + this._tileSize / 2;
        const startY = -(this._board.height * (this._tileSize + this._tileSpacing)) / 2 + this._tileSize / 2;

        const x = Math.floor((localPos.x - startX + this._tileSize / 2) / (this._tileSize + this._tileSpacing));
        const y = Math.floor((localPos.y - startY + this._tileSize / 2) / (this._tileSize + this._tileSpacing));

        return { x, y };
    }

    public animateTileRemoval(tiles: Tile[]): Promise<void> {
        return new Promise<void>((resolve) => {
            if (tiles.length === 0) {
                resolve();
                return;
            }

            let completed = 0;
            const duration = 0.3;

            for (const tile of tiles) {
                const tileView = this.getTileView(tile.x, tile.y);
                if (tileView) {
                    tileView.node.runAction(
                        cc.sequence(
                            cc.spawn(
                                cc.scaleTo(duration, 0),
                                cc.fadeOut(duration)
                            ),
                            cc.callFunc(() => {
                                this._tileViews[tile.x][tile.y] = null;
                                this._tileViewPool.put(tileView);

                                completed++;
                                if (completed === tiles.length) {
                                    resolve();
                                }
                            })
                        )
                    );
                } else {
                    completed++;
                    if (completed === tiles.length) {
                        resolve();
                    }
                }
            }
        });
    }

    public animateSuperTileCreation(superTile: SuperTile | null): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!superTile) {
                resolve();
                return;
            }

            const x = superTile.x;
            const y = superTile.y;

            const tileView = this.createTileView(superTile);
            this._tileViews[x][y] = tileView;

            if (!tileView) {
                resolve();
                return;
            }

            tileView.node.scale = 0;

            const duration = 0.4;
            tileView.node.runAction(
                cc.sequence(
                    cc.spawn(
                        cc.fadeIn(duration * 0.3),
                        cc.scaleTo(duration * 0.3, 1).easing(cc.easeBackOut())
                    ),
                    cc.callFunc(() => {
                        resolve();
                    })
                )
            );
        });
    }

    public animateGravity(movements: TileMove[]): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!movements || movements.length === 0) {
                resolve();
                return;
            }

            let completed = 0;
            const duration = 0.1;

            movements.forEach((move) => {
                const tileView = this._tileViews[move.x][move.fromY];

                if (tileView) {
                    this._tileViews[move.x][move.fromY] = null;

                    const updatedTile = this._board.getTile(move.x, move.toY);
                    if (updatedTile) {
                        this._tileViews[move.x][move.toY] = tileView;
                        cc.log(`  Обновлен внутренний tile TileView: (${updatedTile.x}, ${updatedTile.y})`);
                    }

                    // Вычисляем новую мировую позицию
                    const newWorldPos = this.gridToWorldPos(move.x, move.toY);

                    // Запускаем анимацию перемещения
                    tileView.node.runAction(
                        cc.sequence(
                            cc.moveTo(duration, newWorldPos.x, newWorldPos.y).easing(cc.easeIn(2)),
                            cc.callFunc(() => {
                                completed++;
                                if (completed === movements.length) {
                                    resolve();
                                }
                            })
                        )
                    );
                } else {
                    completed++;
                    if (completed === movements.length) {
                        resolve();
                    }
                }
            });
        });
    }

    public animateHideTiles(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this._tileViews.length === 0) {
                resolve();
                return;
            }

            let completed = 0;
            const duration = 0.4;

            const centerX = Math.floor(this._board.width / 2);
            const centerY = Math.floor(this._board.height / 2);

            for (let x = 0; x < this._board.width; x++) {
                for (let y = 0; y < this._board.height; y++) {
                    const tileView = this.getTileView(x, y);
                    if (tileView) {
                        // Расстояние от центра
                        const distance = Math.abs(x - centerX) + Math.abs(y - centerY);
                        const delay = distance * 0.05;

                        tileView.node.runAction(
                            cc.sequence(
                                cc.delayTime(delay),
                                cc.spawn(
                                    cc.scaleTo(duration, 0).easing(cc.easeIn(2)),
                                    cc.fadeOut(duration),
                                    cc.rotateBy(duration, 180)
                                ),
                                cc.callFunc(() => {
                                    completed++;
                                    if (completed == this._tileViews.length) {
                                        resolve();
                                    }
                                })
                            )
                        );
                    }
                }
            }
        });
    }


    public animateNewTiles(newTiles: Tile[]): Promise<void> {
        return new Promise<void>((resolve) => {
            if (newTiles.length === 0) {
                resolve();
                return;
            }

            let completed = 0;
            const duration = 0.4;

            for (const tile of newTiles) {
                const tileView = this.createTileView(tile);
                this._tileViews[tile.x][tile.y] = tileView;

                // ИСПРАВЛЕНО: добавлена проверка на null
                if (!tileView) {
                    completed++;
                    if (completed === newTiles.length) {
                        resolve();
                    }
                    continue;
                }

                const finalPos = this.gridToWorldPos(tile.x, tile.y);
                const startPos = cc.v3(
                    finalPos.x,
                    finalPos.y + (this._board.height * (this._tileSize + this._tileSpacing))
                );

                tileView.node.position = startPos;
                tileView.node.opacity = 0;

                tileView.node.runAction(
                    cc.sequence(
                        cc.spawn(
                            cc.moveTo(duration, cc.v2(finalPos)).easing(cc.easeBounceOut()),
                            cc.fadeIn(duration * 0.3),
                            cc.scaleTo(duration * 0.3, 1)
                        ),
                        cc.callFunc(() => {
                            completed++;
                            if (completed === newTiles.length) {
                                resolve();
                            }
                        })
                    )
                );
            }
        });
    }

    public animateTileSwap(left: Tile, right: Tile): Promise<void> {
        return new Promise((resolve) => {
            const tileView1 = this.getTileView(left.x, left.y);
            const tileView2 = this.getTileView(right.x, right.y);

            if (!tileView1 || !tileView2) {
                resolve();
                return;
            }

            const duration = 0.3;
            let completed = 0;

            const onComplete = () => {
                completed++;
                if (completed === 2) {
                    resolve();
                }
            };

            tileView1.node.runAction(
                cc.sequence(
                    cc.scaleTo(duration / 2, 0).easing(cc.easeIn(2)),
                    cc.callFunc(() => {
                        const newPos = this.gridToWorldPos(right.x, right.y);
                        tileView1.node.position = newPos;
                        this._tileViews[right.x][right.y] = tileView1;
                    }),
                    cc.scaleTo(duration / 2, 1.0).easing(cc.easeOut(2)),
                    cc.callFunc(onComplete)
                )
            );

            tileView2.node.runAction(
                cc.sequence(
                    cc.scaleTo(duration / 2, 0).easing(cc.easeIn(2)),
                    cc.callFunc(() => {
                        const newPos = this.gridToWorldPos(left.x, left.y);
                        tileView2.node.position = newPos;
                        this._tileViews[left.x][left.y] = tileView2;
                    }),
                    cc.scaleTo(duration / 2, 1.0).easing(cc.easeOut(2)),
                    cc.callFunc(onComplete)
                )
            );
        });
    }

    public animateShuffle(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this._tileViews.length === 0) {
                resolve();
                return;
            }

            const duration = 0.5;
            let completed = 0;

            // ИСПРАВЛЕНО: подсчитываем общее количество тайлов
            let totalTiles = 0;
            for (const row of this._tileViews) {
                totalTiles += row.length;
            }

            for (const row of this._tileViews) {
                for (const tile of row) {
                    // ИСПРАВЛЕНО: добавлена проверка на null
                    if (!tile) {
                        completed++;
                        continue;
                    }

                    tile.node.runAction(
                        cc.sequence(
                            cc.spawn(
                                cc.scaleTo(duration / 2, 0).easing(cc.easeIn(2)),
                                cc.rotateBy(duration / 2, 180),
                                cc.fadeOut(duration / 2)
                            ),
                            cc.callFunc(() => {
                                completed++;
                                // ИСПРАВЛЕНО: сравниваем с общим количеством тайлов
                                if (completed === totalTiles) {
                                    for (let x = 0; x < this._board.width; x++) {
                                        for (let y = 0; y < this._board.height; y++) {
                                            const tileView = this.getTileView(x, y);
                                            const tile = this._board.getTile(x, y);
                                            if (tileView && tile) {
                                                tileView.node.scale = 0;
                                                tileView.node.opacity = 0;
                                                tileView.node.rotation = 0;
                                            }
                                        }
                                    }

                                    const allTileViews: TileView[] = [];

                                    for (let x = 0; x < this._board.width; x++) {
                                        for (let y = 0; y < this._board.height; y++) {
                                            const tileView = this.getTileView(x, y);
                                            if (tileView) {
                                                allTileViews.push(tileView);
                                            }
                                        }
                                    }

                                    let completedAppear = 0;
                                    const appearDuration = 0.5;

                                    for (const tileView of allTileViews) {
                                        const randomDelay = Math.random() * 0.3;

                                        tileView.node.runAction(
                                            cc.sequence(
                                                cc.delayTime(randomDelay),
                                                cc.spawn(
                                                    cc.scaleTo(appearDuration / 2, 1.0).easing(cc.easeBackOut()),
                                                    cc.fadeIn(appearDuration / 2)
                                                ),
                                                cc.callFunc(() => {
                                                    completedAppear++;
                                                    if (completedAppear === allTileViews.length) {
                                                        resolve();
                                                    }
                                                })
                                            )
                                        );
                                    }
                                }
                            })
                        )
                    );
                }
            }
        });
    }
}