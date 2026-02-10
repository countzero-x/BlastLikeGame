import { Moves } from "../mechanics/Moves";

const { ccclass, property } = cc._decorator;

@ccclass
export class MovesView extends cc.Component {

    @property(cc.Label)
    private label: cc.Label;

    private _moves: Moves;
    private _currentDisplayMoves: number;

    public init(moves: Moves) {
        this._moves = moves;
        this._currentDisplayMoves = moves.currentMoves;
    }

    public updateMoves(animated: boolean = true): Promise<void> {
        if (!animated) {
            return new Promise<void>((resolve) => {
                this.label.string = this.label.string = `${this._moves.currentMoves}`;
                resolve();
            })
        }

        return new Promise<void>((resolve) => {
            if (!this.label) {
                resolve();
                return;
            }

            if (this._currentDisplayMoves == this._moves.currentMoves) {
                this._currentDisplayMoves = this._moves.currentMoves;
                this.label.string = `${this._moves.currentMoves}`;
                resolve();
                return;
            }

            const oldMoves = this._currentDisplayMoves;
            const newMoves = this._moves.currentMoves;
            const difference = newMoves - oldMoves;

            if (difference === 0) {
                resolve();
                return;
            }

            this.label.node.stopActionByTag(101);

            this._currentDisplayMoves = newMoves;
            this.label.string = `${this._currentDisplayMoves}`;

            let visualAction: cc.Action;

            if (difference < 0) {
                visualAction = cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.15, 1.2).easing(cc.easeOut(2)),
                        cc.tintTo(0.15, 255, 100, 100) // Красный
                    ),
                    cc.spawn(
                        cc.scaleTo(0.25, 1.0).easing(cc.easeBackOut()),
                        cc.tintTo(0.25, 255, 255, 255) // Белый
                    ),
                    cc.callFunc(() => {
                        resolve();
                    })
                );
            } else {
                visualAction = cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.15, 1.2).easing(cc.easeOut(2)),
                        cc.tintTo(0.15, 100, 255, 100) // Зеленый
                    ),
                    cc.spawn(
                        cc.scaleTo(0.25, 1.0).easing(cc.easeBackOut()),
                        cc.tintTo(0.25, 255, 255, 255)
                    ),
                    cc.callFunc(() => {
                        resolve();
                    })
                );
            }

            visualAction.setTag(101);
            this.label.node.runAction(visualAction);
        });
    }
}