import { BlastGame } from "../BlastGame";
import { BoosterType } from "../enums/BoosterType";

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
            if (game.boosters.selectedType == type) {
                game.boosters.apply(game, BoosterType.NONE);
            } else if (game.boosters.canApply(type)) {
                game.boosters.apply(game, type);
            }
        });
    }

    public updateView() {
        this.label.string = this._type == BoosterType.BOMB ? this._game.boosters.bombCount.toString() : this._game.boosters.teleportCount.toString();
        this.button.interactable = this._game.boosters.canApply(BoosterType.BOMB);
    }
}
