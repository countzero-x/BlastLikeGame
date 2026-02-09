import { GameState } from "../fsm/GameState";
import { BlastGame } from "./BlastGame";
import { Board } from "./Board";
import { BoosterType } from "./BoosterType";
import { GameConfig } from "./GameConfig";
import { Tile } from "./Tile";
import { TileColor } from "./TileColor";
import TileView from "./views/TileView";

const { ccclass, property } = cc._decorator;

@ccclass
export class GameTest extends cc.Component {

    @property(cc.Node)
    tilesContainer: cc.Node

    @property(cc.Node)
    clickNode: cc.Node

    @property(cc.Prefab)
    tilePrefab: cc.Prefab

    @property(cc.Label)
    scoreLabel: cc.Label

    @property(cc.Label)
    movesLabel: cc.Label

    @property(cc.Button)
    winButton: cc.Button

    @property(cc.Button)
    loseButton: cc.Button

    @property(cc.Label)
    teleportLabel: cc.Label

    @property(cc.Label)
    bombLabel: cc.Label

    @property(cc.Button)
    teleportButton: cc.Button;

    @property(cc.Button)
    bombButton: cc.Button;

    game: BlastGame

    tileViews: TileView[][] = [];

    protected onLoad(): void {
        this.game = new BlastGame();
        this.game.stateChanged.subscribe(this.handleStateChanged, this);
        this.game.init();
        this.game.start();

        this.winButton.node.on('click', () => {
            this.game.finish();
            this.game.start();
        })

        this.loseButton.node.on('click', () => {
            this.game.finish();
            this.game.start();
        })

        this.bombButton.node.on('click', () => {
            if (this.game._boosters.selectedType == BoosterType.BOMB) {
                this.game._boosters.apply(this.game, BoosterType.NONE);
            } else if (this.game._boosters.canApply(BoosterType.BOMB)) {
                this.game._boosters.apply(this.game, BoosterType.BOMB);
            }
        });

        this.teleportButton.node.on('click', () => {
            if (this.game._boosters.selectedType == BoosterType.TELEPORT) {
                this.game._boosters.apply(this.game, BoosterType.NONE);
            }
            else if (this.game._boosters.canApply(BoosterType.TELEPORT)) {
                this.game._boosters.apply(this.game, BoosterType.TELEPORT);
            }
        });

        this.clickNode.on(cc.Node.EventType.TOUCH_END, this.onTouch, this);
    }

    private onTouch(event: cc.Event.EventTouch): void {
        const touchPos = event.getLocation();
        const gridPos = this.worldToGridPos(touchPos);

        cc.log(`Клик в мировых координатах: (${touchPos.x}, ${touchPos.y})`);
        cc.log(`Конвертировано в сетку: (${gridPos.x}, ${gridPos.y})`);

        const tile = this.game._board.getTile(gridPos.x, gridPos.y);
        if (tile) {
            cc.log(`Тайл найден: цвет=${tile.color}, isEmpty=${tile.isEmpty}`);
        } else {
            cc.log(`Тайл не найден (вне границ)`);
        }

        if (this.isValidPosition(gridPos.x, gridPos.y)) {
            this.game.makeMove(gridPos.x, gridPos.y);
        }
    }

    private isValidPosition(x: number, y: number): boolean {
        return x >= 0 && x < this.game._board.width && y >= 0 && y < this.game._board.height;
    }

    private handleStateChanged(state: GameState) {
        console.log(state);

        this.updateBoardView();

        this.scoreLabel.string = `${this.game._score.currentScore.toString()} / ${this.game._score.targetScore}`;
        this.movesLabel.string = this.game._moves.currentMoves.toString();

        this.winButton.node.active = state == GameState.WIN;
        this.loseButton.node.active = state == GameState.LOSE;

        this.bombButton.interactable = this.game._boosters.canApply(BoosterType.BOMB);
        this.bombLabel.string = this.game._boosters.bombCount.toString();

        this.teleportButton.interactable = this.game._boosters.canApply(BoosterType.TELEPORT);
        this.teleportLabel.string = this.game._boosters.teleportCount.toString();

        GameTest.printBoard(this.game._board);
    }

    private gridToWorldPos(x: number, y: number): cc.Vec3 {
        const startX = -(this.game._board.width * (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING)) / 2 + GameConfig.TILE_SIZE / 2;
        const startY = -(this.game._board.height * (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING)) / 2 + GameConfig.TILE_SIZE / 2;

        return cc.v3(
            startX + x * (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING),
            startY + y * (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING),
            0
        );
    }

    private worldToGridPos(worldPos: cc.Vec2): { x: number, y: number } | null {
        const localPos = this.tilesContainer.convertToNodeSpaceAR(worldPos);

        const startX = -(this.game._board.width * (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING)) / 2 + GameConfig.TILE_SIZE / 2;
        const startY = -(this.game._board.height * (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING)) / 2 + GameConfig.TILE_SIZE / 2;

        const x = Math.floor((localPos.x - startX + GameConfig.TILE_SIZE / 2) / (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING));
        const y = Math.floor((localPos.y - startY + GameConfig.TILE_SIZE / 2) / (GameConfig.TILE_SIZE + GameConfig.TILE_SPACING));

        return { x, y };
    }

    private getTileView(x: number, y: number): TileView {
        if (x >= 0 && x < this.game._board.width && y >= 0 && y < this.game._board.height) {
            return this.tileViews[x][y];
        }
        return null;
    }

    private updateBoardView() {
        for (let x = 0; x < this.game._board.width; x++) {
            for (let y = 0; y < this.game._board.height; y++) {
                if (this.tileViews.length - 1 < x) {
                    continue;
                }

                if (this.tileViews[x].length - 1 < y) {
                    console;
                }

                if (this.tileViews[x][y] != null) {
                    this.tileViews[x][y].node.destroy()
                    this.tileViews[x][y] = null;
                }

            }
        }
        this.createTileViews();
    }

    private createTileViews(): void {
        for (let x = 0; x < this.game._board.width; x++) {
            this.tileViews[x] = [];
            for (let y = 0; y < this.game._board.height; y++) {
                const tile = this.game._board.getTile(x, y);
                const tileView = this.createTileView(tile);
                this.tileViews[x][y] = tileView;
            }
        }
    }

    // BoardView.ts - метод createTileView()
    private createTileView(tile: Tile): TileView {
        if (tile == null) {
            return;
        }

        const tileNode = cc.instantiate(this.tilePrefab);
        const tileView = tileNode.getComponent(TileView);

        tileView.setTile(tile);
        tileNode.position = this.gridToWorldPos(tile.x, tile.y);  // Прямое присваивание

        this.tilesContainer.addChild(tileNode);
        return tileView;
    }


    public static printBoard(board: Board): void {
        console.log('\n=== Board State ===');

        // Выводим сверху вниз (от максимального y к 0)
        for (let y = board.height - 1; y >= 0; y--) {
            let row = `y=${y}: `;

            for (let x = 0; x < board.width; x++) {
                const tile = board.getTile(x, y);

                if (!tile || tile.isEmpty) {
                    row += '[ ] ';
                } else {
                    // Сокращенное название цвета
                    const colorChar = tile.color;
                    row += `[${colorChar}] `;
                }
            }

            console.log(row);
        }

        // Выводим подписи колонок
        let footer = '     ';
        for (let x = 0; x < board.width; x++) {
            footer += ` ${x}  `;
        }
        console.log(footer);
        console.log('==================\n');
    }
}
