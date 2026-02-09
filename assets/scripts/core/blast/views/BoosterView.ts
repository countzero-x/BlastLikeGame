import { BlastGame } from "../BlastGame";
import { BoosterType } from "../BoosterType";

const { ccclass, property } = cc._decorator;

@ccclass
export class BoosterView extends cc.Component {

    @property(cc.Label)
    private label: cc.Label

    @property(cc.Button)
    private button: cc.Button;

    private _type: BoosterType;
    private _game: BlastGame

    public init(game: BlastGame, type: BoosterType) {
        this._type = type;
        this._game = game;

        this.button.node.on('click', () => {
            if (game._boosters.selectedType == type) {
                game._boosters.apply(game, BoosterType.NONE);
            } else if (game._boosters.canApply(type)) {
                game._boosters.apply(game, type);
            }
        });
    }

    public updateView() {
        this.label.string = this._type == BoosterType.BOMB ? this._game._boosters.bombCount.toString() : this._game._boosters.teleportCount.toString();
        this.button.interactable = this._game._boosters.canApply(BoosterType.BOMB);
    }
}
