
import { BlastGame } from "../BlastGame";
import { GameState } from "../enums/GameState";

const { ccclass, property } = cc._decorator;

@ccclass
export class LoseView extends cc.Component {

    @property(cc.Button)
    private button: cc.Button

    private _game: BlastGame

    public init(game: BlastGame) {
        this._game = game;

        this.button.node.on('click', () => {
            this._game.finish();
            this._game.start();
        })
    }

    public updateView() {
        this.button.node.active = this._game._state == GameState.LOSE;
    }
}