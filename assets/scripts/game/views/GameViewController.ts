import { BlastGame } from "../BlastGame";
import { BoosterType } from "../enums/BoosterType";
import { TurnEffect } from "../mechanics/Board";
import { DestroyEffect } from "../mechanics/effects/DestroyEffect";
import { GravityEffect } from "../mechanics/effects/GravityEffect";
import { LoseEffect } from "../mechanics/effects/LoseEffect";
import { ShakeEffect } from "../mechanics/effects/ShakeEffect";
import { ShuffleEffect } from "../mechanics/effects/ShuffleEffect";
import { SuperTileSpawnEffect } from "../mechanics/effects/SuperTileSpawnEffect";
import { TileSpawnEffect } from "../mechanics/effects/TileSpawnEffect";
import { WinEffect } from "../mechanics/effects/WinEffect";
import { Tile } from "../Tile";
import { BoardView } from "./BoardView";
import { BoosterView } from "./BoosterView";
import { LoseView } from "./LoseView";
import { MovesView } from "./MovesView";
import { OverlayView } from "./OverlayView";
import { ScoreView } from "./ScoreView";
import { WinView } from "./WinView";

export class GameViewController {
    private _game: BlastGame;

    private _boardView: BoardView;
    private _boosterViews: Array<BoosterView>;
    private _loseView: LoseView;
    private _winView: WinView;
    private _movesView: MovesView;
    private _scoreView: ScoreView;
    private _overlayView: OverlayView;

    private _boosterViewsMap = new Map<BoosterType, BoosterView>();

    constructor(game: BlastGame,
        boardView: BoardView,
        boosterViews: Array<BoosterView>,
        loseView: LoseView,
        winView: WinView,
        movesView: MovesView,
        scoreView: ScoreView,
        overlayView: OverlayView,
    ) {
        this._game = game;
        this._boardView = boardView;
        this._boosterViews = boosterViews;
        this._loseView = loseView;
        this._winView = winView;
        this._movesView = movesView;
        this._scoreView = scoreView;
        this._overlayView = overlayView;
    }

    public init() {
        this._game.onGameStarted.subscribe(this.processEffects, this);
        this._game.onTurnFinished.subscribe(this.processEffects, this);
        this._game.onGameFinished.subscribe(this.processEffects, this);

        for (var item of this._boosterViews) {
            this._boosterViewsMap.set(item.type, item);
        }
    }

    private async processEffects(effects: Array<TurnEffect>) {
        this._game.input.disable();

        this._overlayView.hide(false);
        this._winView.hide();
        this._loseView.hide();

        for (var effect of effects) {
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
            else if (effect instanceof WinEffect) {
                await this._boardView.animateHideTiles();
                await this._overlayView.show(true);
                await this._winView.show();
                this._boardView.reset();
            }
            else if (effect instanceof LoseEffect) {
                await this._boardView.animateHideTiles();
                await this._overlayView.show(true);
                await this._loseView.show();
                this._boardView.reset();
            }
        }

        await this._scoreView.animateScoreUpdate();
        await this._movesView.animateMovesUpdate();

        this._game.input.enable();
    }
}