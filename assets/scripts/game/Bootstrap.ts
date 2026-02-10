import { BoardView } from "./views/BoardView";
import { BoosterView } from "./views/BoosterView";
import { LoseView } from "./views/LoseView";
import { MovesView } from "./views/MovesView";
import { ScoreView } from "./views/ScoreView";
import { WinView } from "./views/WinView";
import { BlastGame } from "./BlastGame";
import { BoosterType } from "./enums/BoosterType";
import { GameState } from "./enums/GameState";
import { OverlayView } from "./views/OverlayView";
import { TileViewPool } from "./views/TileViewPool";
import { Board } from "./mechanics/Board";
import { Boosters } from "./mechanics/Boosters";
import { Gravity } from "./mechanics/Gravity";
import { Matches } from "./mechanics/Matches";
import { Moves } from "./mechanics/Moves";
import { Score } from "./mechanics/Score";
import { Shuffle } from "./mechanics/Shuffle";
import { Spawner } from "./mechanics/Spawner";
import { SuperTiles } from "./mechanics/superTiles/SuperTiles";
import { BombBooster } from "./mechanics/boosters/BombBooster";
import { TeleportBooster } from "./mechanics/boosters/TeleportBooster";
import { TileColor } from "./enums/TileColor";
import { SuperTileType } from "./mechanics/superTiles/SuperTileType";
import { LineSuperTileLogic } from "./mechanics/superTiles/LineSuperTileLogic";
import { RadiusBombSuperTileLogic } from "./mechanics/superTiles/RadiusBombSuperTileLogic";
import { MaxBombSuperTileLogic } from "./mechanics/superTiles/MaxBombSuperTileLogic";
import { Input } from "./mechanics/Input";
import { GameViewController } from "./views/GameViewController";
import { PostGameProcessor, PostTurnProcessor, PreGameProcessor, PreTurnProcessor, TileDeletedProcessor, TurnClickProcessor } from "./TurnProcessor";
import { NormalClickProcessor } from "./NormalClickProcessor";

const { ccclass, property } = cc._decorator;

@ccclass
export class Bootstrap extends cc.Component {
    @property()
    private boardWidth = 8;
    @property()
    private boardHeight = 8;

    @property()
    private tileSize = 110;
    @property()
    private tileSpacing = 2;

    @property()
    private scorePerTile = 10;
    @property()
    private targetScore = 5000;

    @property()
    private maxMoves = 10;

    @property()
    private maxShuffles = 3;

    @property()
    private superTileRemovedCountForLine = 5;
    @property()
    private superTileRemovedCountForLineRadiusBomb = 8;
    @property()
    private superTileRemovedCountForMaxBomb = 10;

    @property()
    private superTileBombRadius = 2;
    @property()
    private boosterBombCount = 3;
    @property()
    private boosterBombRadius = 2;
    @property()
    private boosterTeleportCount = 3;

    @property(BoosterView)
    private teleportView: BoosterView;

    @property(BoosterView)
    private bombView: BoosterView;

    @property(BoardView)
    private boardView: BoardView;

    @property(ScoreView)
    private scoreView: ScoreView;

    @property(MovesView)
    private movesView: MovesView;

    @property(WinView)
    private winView: WinView;

    @property(LoseView)
    private loseView: LoseView;

    @property(OverlayView)
    private overlayView: OverlayView;

    @property(cc.Prefab)
    private tilePrefab: cc.Prefab;

    @property(cc.SpriteFrame)
    private redTileSprite: cc.SpriteFrame;

    @property(cc.SpriteFrame)
    private blueTileSprite: cc.SpriteFrame;

    @property(cc.SpriteFrame)
    private greenTileSprite: cc.SpriteFrame;

    @property(cc.SpriteFrame)
    private yellowTileSprite: cc.SpriteFrame;

    @property(cc.SpriteFrame)
    private purpleTileSprite: cc.SpriteFrame;

    @property(cc.SpriteFrame)
    private horizontalTileSprite: cc.SpriteFrame;

    @property(cc.SpriteFrame)
    private verticalTileSprite: cc.SpriteFrame;

    @property(cc.SpriteFrame)
    private radiusBombTileSprite: cc.SpriteFrame;

    @property(cc.SpriteFrame)
    private maxBombTileSprite: cc.SpriteFrame;

    protected onLoad(): void {

        const boosters = new Boosters();
        boosters.register(new BombBooster(this.boosterBombCount, this.boosterBombRadius));
        boosters.register(new TeleportBooster(this.boosterTeleportCount));

        const superTiles = new SuperTiles();
        superTiles.register(new LineSuperTileLogic(true), this.superTileRemovedCountForLine);
        superTiles.register(new LineSuperTileLogic(false), this.superTileRemovedCountForLine);
        superTiles.register(new RadiusBombSuperTileLogic(this.superTileBombRadius), this.superTileRemovedCountForLineRadiusBomb);
        superTiles.register(new MaxBombSuperTileLogic(), this.superTileRemovedCountForMaxBomb);

        const spawner = new Spawner();
        spawner.register(TileColor.RED);
        spawner.register(TileColor.BLUE);
        // spawner.register(TileColor.GREEN);
        // spawner.register(TileColor.YELLOW);
        spawner.register(TileColor.PURPLE);

        const board = new Board(this.boardWidth, this.boardHeight);
        const score = new Score(this.targetScore, this.scorePerTile);
        const moves = new Moves(this.maxMoves);
        const shuffle = new Shuffle(this.maxShuffles);
        const matches = new Matches();
        const gravity = new Gravity();

        const input = new Input();

        const preGameProcessors: Array<PreGameProcessor> = [
            spawner
        ]

        const postGameProcessors: Array<PostGameProcessor> = [
            spawner
        ]

        const preTurnProcessors: Array<PreTurnProcessor> = [
            shuffle
        ];

        const turnClickProcessors: Array<TurnClickProcessor> = [
            new NormalClickProcessor(),
            boosters,
            superTiles,
        ];

        const postTurnProcessors: Array<PostTurnProcessor> = [
            gravity,
            spawner,
            moves,
            score
        ];

        const tileRemovedProcessors: Array<TileDeletedProcessor> = [

        ];

        const game = new BlastGame(
            input,
            board,
            score,
            moves,
            spawner,
            shuffle,
            matches,
            gravity,
            superTiles,
            boosters,
            preGameProcessors,
            postGameProcessors,
            preTurnProcessors,
            turnClickProcessors,
            postTurnProcessors,
            tileRemovedProcessors
        );

        this.scoreView.init(game.score);
        this.movesView.init(game.moves);

        this.winView.init(game);
        this.loseView.init(game);

        this.bombView.init(game.boosters, BoosterType.BOMB);
        this.teleportView.init(game.boosters, BoosterType.TELEPORT);

        const tileViewPool = new TileViewPool();
        tileViewPool.init(this.tilePrefab, this.boardHeight * this.boardWidth);

        tileViewPool.registerRegularTile(TileColor.RED, this.redTileSprite);
        tileViewPool.registerRegularTile(TileColor.BLUE, this.blueTileSprite);
        tileViewPool.registerRegularTile(TileColor.GREEN, this.greenTileSprite);
        tileViewPool.registerRegularTile(TileColor.YELLOW, this.yellowTileSprite);
        tileViewPool.registerRegularTile(TileColor.PURPLE, this.purpleTileSprite);

        tileViewPool.registerSuperTile(SuperTileType.HORIZONTAL, this.horizontalTileSprite);
        tileViewPool.registerSuperTile(SuperTileType.VERTICAL, this.verticalTileSprite);
        tileViewPool.registerSuperTile(SuperTileType.RADIUS_BOMB, this.radiusBombTileSprite);
        tileViewPool.registerSuperTile(SuperTileType.MAX_BOMB, this.maxBombTileSprite);

        this.boardView.init(game.board, game.input, tileViewPool, this.tileSize, this.tileSpacing);

        const gameView = new GameViewController(game, this.boardView, new Array<BoosterView>(this.bombView, this.teleportView), this.loseView, this.winView, this.movesView, this.scoreView, this.overlayView);
        gameView.init();

        game.start();
    }
}
