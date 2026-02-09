import { Score } from "../mechanics/Score";

const { ccclass, property } = cc._decorator;

@ccclass
export class ScoreView extends cc.Component {

    @property(cc.Label)
    private label: cc.Label;

    private _score: Score;

    public init(game: Score) {
        this._score = game;
    }

    public updateView() {
        this.label.string = `${this._score.currentScore.toString()} / ${this._score.targetScore}`;
    }
}
