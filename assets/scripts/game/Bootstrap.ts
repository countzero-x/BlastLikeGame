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

const { ccclass, property } = cc._decorator;

@ccclass
export class Bootstrap extends cc.Component {
    @property(BoosterView)
    private teleportView: BoosterView

    @property(BoosterView)
    private bombView: BoosterView

    @property(BoardView)
    private boardView: BoardView;

    @property(ScoreView)
    private scoreView: ScoreView

    @property(MovesView)
    private movesView: MovesView

    @property(WinView)
    private winView: WinView

    @property(LoseView)
    private loseView: LoseView

    @property(OverlayView)
    private overlayView: OverlayView

    private _game: BlastGame

    protected onLoad(): void {
        this._game = new BlastGame();
        this._game.init();

        this.scoreView.init(this._game);
        this.movesView.init(this._game);

        this.winView.init(this._game);
        this.loseView.init(this._game);

        this.overlayView.init(this._game);

        this.bombView.init(this._game, BoosterType.BOMB);
        this.teleportView.init(this._game, BoosterType.TELEPORT);

        const tileViewPool = new TileViewPool();
        tileViewPool.init();

        this.boardView.init(this._game, tileViewPool);

        this._game.stateChanged.subscribe(this.handleStateChanged, this);
        this._game.start();
    }

    private handleStateChanged(state: GameState) {
        this.overlayView.updateView();

        this.boardView.updateView();

        this.scoreView.updateView();
        this.movesView.updateView();

        this.winView.updateView();
        this.loseView.updateView();

        this.teleportView.updateView();
        this.bombView.updateView();
    }
}
