import { BlastGame } from "../BlastGame";

const { ccclass, property } = cc._decorator;

@ccclass
export class MovesView extends cc.Component {

    @property(cc.Label)
    private label: cc.Label

    private _game: BlastGame

    public init(game: BlastGame) {
        this._game = game;
    }

    public updateView() {
        this.label.string = this._game._moves.currentMoves.toString();
    }
}