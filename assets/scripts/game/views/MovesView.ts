import { Moves } from "../mechanics/Moves";

const { ccclass, property } = cc._decorator;

@ccclass
export class MovesView extends cc.Component {

    @property(cc.Label)
    private label: cc.Label

    private _moves: Moves;

    public init(moves: Moves) {
        this._moves = moves;
    }

    public updateView() {
        this.label.string = this._moves.currentMoves.toString();
    }
}