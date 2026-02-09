import { BlastGame } from "../BlastGame";

const { ccclass, property } = cc._decorator;

@ccclass
export class ScoreView extends cc.Component {

    @property(cc.Label)
    private label: cc.Label;

    private _game: BlastGame;

    public init(game: BlastGame) {
        this._game = game;
    }

    public updateView() {
        this.label.string = `${this._game._score.currentScore.toString()} / ${this._game._score.targetScore}`;
    }
}
