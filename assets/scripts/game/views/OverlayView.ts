import { BlastGame } from "../BlastGame";
import { GameState } from "../enums/GameState";

const { ccclass, property } = cc._decorator;

@ccclass
export class OverlayView extends cc.Component {

    @property(cc.Node)
    private ovelay: cc.Node;

    private _game: BlastGame;

    public init(game: BlastGame) {
        this._game = game;
    }

    public updateView() {
        this.ovelay.active = this._game._state == GameState.WIN || this._game._state == GameState.LOSE;
    }
}
