import { BlastGame } from "../BlastGame";
import { TurnOutcome } from "../TurnOutcome";
import { BoosterType } from "../enums/BoosterType";
import { GameState } from "../enums/GameState";
import { InputState } from "../enums/InputState";
import { BoardView } from "./BoardView";
import { BoosterView } from "./BoosterView";
import { LoseView } from "./LoseView";
import { MovesView } from "./MovesView";
import { OverlayView } from "./OverlayView";
import { ScoreView } from "./ScoreView";
import { WinView } from "./WinView";

export class GameView {
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
        this._game.onMoveCompleted.subscribe(this.updateView, this);
        this.updateView(this._game.lastTurnOutcome);

        for (var item of this._boosterViews) {
            this._boosterViewsMap.set(item.type, item);
        }
    }

    private async updateView(context: TurnOutcome) {
        this._game.input.disable();

        this._overlayView.hide(false);
        this._winView.hide();
        this._loseView.hide();

        await this._boardView.animateTileRemoval(context.removedTiles);
        await this._scoreView.animateScoreUpdate();
        await this._movesView.animateMovesUpdate();
        await this._boardView.animateSuperTileCreation(context.superTile);
        await this._boardView.animateGravity(context.movements);
        await this._boardView.animateNewTiles(context.newTiles);

        if (context.removedTiles.length == 0
            && context.selectedTile != null
            && context.inputState == InputState.NORMAL) {
            const view = this._boardView.getTileView(context.selectedTile.x, context.selectedTile.y);
            view.animateShake();
        }

        if (context.shuffleRequired) {
            await this._boardView.animateShuffle();
        }

        if (context.state == GameState.LOSE) {
            await this._boardView.animateHideTiles();
            await this._overlayView.show(true);
            await this._loseView.show();
            this._boardView.reset();
        }
        else if (context.state == GameState.WIN) {
            await this._boardView.animateHideTiles();
            await this._overlayView.show(true);
            await this._winView.show();
            this._boardView.reset();
        }
        else {
            this._game.input.enable();
        }
    }
}