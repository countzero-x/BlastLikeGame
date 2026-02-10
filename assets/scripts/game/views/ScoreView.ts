import { Score } from "../mechanics/Score";

const { ccclass, property } = cc._decorator;

@ccclass
export class ScoreView extends cc.Component {

    @property(cc.Label)
    private label: cc.Label;

    private _currentDisplayScore: number
    private _score: Score;

    public init(game: Score) {
        this._score = game;
        this._currentDisplayScore = this._score.currentScore;
    }

    public updateScore(animated: boolean = true): Promise<void> {
        if (!animated) {
            return new Promise<void>((resolve) => {
                this.label.string = `${this._score.currentScore}/${this._score.targetScore}`;
                resolve();
            })
        }

        return new Promise<void>((resolve) => {
            if (!this.label) {
                resolve();
                return;
            }

            if (this._currentDisplayScore == this._score.currentScore) {
                this._currentDisplayScore = this._score.currentScore;
                this.label.string = `${this._score.currentScore}/${this._score.targetScore}`;
                resolve();
                return;
            }

            const oldScore = this._currentDisplayScore;
            const newScore = this._score.currentScore;
            const difference = newScore - oldScore;

            if (difference === 0) {
                resolve();
                return;
            }

            this.label.node.stopActionByTag(100);

            const duration = 0.5;
            const steps = 20;
            const increment = difference / steps;
            let currentStep = 0;

            const counterAction = cc.repeat(
                cc.sequence(
                    cc.delayTime(duration / steps),
                    cc.callFunc(() => {
                        currentStep++;
                        this._currentDisplayScore = Math.floor(oldScore + increment * currentStep);

                        if (currentStep >= steps) {
                            this._currentDisplayScore = newScore;
                        }

                        this.label.string = `${this._currentDisplayScore}/${this._score.targetScore}`;
                    })
                ),
                steps
            );

            const visualAction = cc.sequence(
                cc.spawn(
                    cc.scaleTo(0.2, 1.3).easing(cc.easeOut(2)),
                    cc.tintTo(0.2, 255, 255, 100) // Желтый оттенок
                ),
                cc.spawn(
                    cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut()),
                    cc.tintTo(0.3, 255, 255, 255) // Обратно к белому
                )
            );

            const combinedAction = cc.spawn(
                counterAction,
                cc.sequence(
                    visualAction,
                    cc.callFunc(() => {
                        resolve();
                    })
                )
            );
            combinedAction.setTag(100);

            this.label.node.runAction(combinedAction);
        });
    }
}
