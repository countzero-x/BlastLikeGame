import { BoosterType } from "../enums/BoosterType";
import { GameMediator } from "../mechanics/GameMediator";
import { TurnEffect } from "../mechanics/TurnEffect";
import { DestroyEffect } from "../mechanics/effects/DestroyEffect";
import { GravityEffect } from "../mechanics/effects/GravityEffect";
import { LoseEffect } from "../mechanics/effects/LoseEffect";
import { ShakeEffect } from "../mechanics/effects/ShakeEffect";
import { ShuffleEffect } from "../mechanics/effects/ShuffleEffect";
import { SuperTileSpawnEffect } from "../mechanics/effects/SuperTileSpawnEffect";
import { SwapEffect } from "../mechanics/effects/SwapEffect";
import { TeleportDeselectEffect } from "../mechanics/effects/TeleportDeselectEffect";
import { TeleportSelectEffect } from "../mechanics/effects/TeleportSelectEffect";
import { TileSpawnEffect } from "../mechanics/effects/TileSpawnEffect";
import { WinEffect } from "../mechanics/effects/WinEffect";
import { BoardView } from "./BoardView";
import { BoosterView } from "./BoosterView";
import { MovesView } from "./MovesView";
import { OverlayView } from "./OverlayView";
import { ScoreView } from "./ScoreView";
import { RestartView } from "./RestartView";

export class GameController {
    private _mediator: GameMediator;

    private _boardView: BoardView;
    private _boosterViews: Array<BoosterView>;
    private _loseView: RestartView;
    private _winView: RestartView;
    private _movesView: MovesView;
    private _scoreView: ScoreView;
    private _overlayView: OverlayView;

    private _boosterViewsMap = new Map<BoosterType, BoosterView>();

    constructor(mediator: GameMediator,
        boardView: BoardView,
        boosterViews: Array<BoosterView>,
        loseView: RestartView,
        winView: RestartView,
        movesView: MovesView,
        scoreView: ScoreView,
        overlayView: OverlayView,
    ) {
        this._mediator = mediator;
        this._boardView = boardView;
        this._boosterViews = boosterViews;
        this._loseView = loseView;
        this._winView = winView;
        this._movesView = movesView;
        this._scoreView = scoreView;
        this._overlayView = overlayView;
    }

    public init() {
        this._mediator.onGameStarted.subscribe(this.processEffects, this);
        this._mediator.onTurnFinished.subscribe(this.processEffects, this);
        this._mediator.onGameFinished.subscribe(this.processEffects, this);
        this._mediator.onBoosterSelected.subscribe(this.processEffects, this);
        this._mediator.onBoosterDeselected.subscribe(this.processEffects, this);

        for (const item of this._boosterViews) {
            this._boosterViewsMap.set(item.type, item);
        }

        this._overlayView.hide(false);
        this._winView.hide(false);
        this._loseView.hide(false);
        this._mediator.enableInput();
        this._scoreView.updateScore(false);
        this._movesView.updateMoves(false)
    }

    private async processEffects(effects: Array<TurnEffect>) {
        this._mediator.disableInput();

        this._overlayView.hide();
        this._winView.hide();
        this._loseView.hide();

        for (const effect of effects) {
            if (effect instanceof DestroyEffect) {
                await this._boardView.animateTileRemoval(effect.tilesToRemove);
            }
            else if (effect instanceof SuperTileSpawnEffect) {
                await this._boardView.animateSuperTileCreation(effect.superTile);
            }
            else if (effect instanceof TileSpawnEffect) {
                await this._boardView.animateNewTiles(effect.tilesToSpawn);
            }
            else if (effect instanceof GravityEffect) {
                await this._boardView.animateGravity(effect.moves);
            }
            else if (effect instanceof ShuffleEffect) {
                await this._boardView.animateShuffle();
            }
            else if (effect instanceof ShakeEffect) {
                const view = this._boardView.getTileView(effect.tileToShake.x, effect.tileToShake.y);
                view.animateShake();
            }
            else if (effect instanceof SwapEffect) {
                const viewLeft = this._boardView.getTileView(effect.left.x, effect.left.y);
                viewLeft.stopShake();
                const viewRight = this._boardView.getTileView(effect.right.x, effect.right.y);
                viewRight.stopShake();
                await this._boardView.animateTileSwap(effect.left, effect.right);
            }
            else if (effect instanceof TeleportSelectEffect) {
                const view = this._boardView.getTileView(effect.selectedTile.x, effect.selectedTile.y);
                view.startShake();
            }
            else if (effect instanceof TeleportDeselectEffect) {
                const view = this._boardView.getTileView(effect.deselectedTile.x, effect.deselectedTile.y);
                view.stopShake();
            }
            else if (effect instanceof WinEffect) {
                await this._boardView.animateHideTiles();
                await this._overlayView.show();
                await this._winView.show();
                this._boardView.reset();
            }
            else if (effect instanceof LoseEffect) {
                await this._boardView.animateHideTiles();
                await this._overlayView.show();
                await this._loseView.show();
                this._boardView.reset();
            }
        }

        this._scoreView.updateScore();
        this._movesView.updateMoves()

        this._mediator.enableInput();
    }
}