import { BlastGame } from "./BlastGame";
import { Board } from "./Board";
import { BoosterType } from "./BoosterType";
import { GameConfig } from "./GameConfig";
import { InputState } from "./InputState";
import { Tile } from "./Tile";


export class Boosters {
    private _bombCount: number;
    private _teleportCount: number;

    private _firstTeleportTile: Tile;
    private _secondTeleportTile: Tile;

    private _selectedType: BoosterType

    public constructor(bombCount: number, teleportCount: number) {
        this._bombCount = bombCount;
        this._teleportCount = teleportCount;
    }

    public get selectedType(): BoosterType {
        return this._selectedType;
    }

    public get bombCount(): number {
        return this._bombCount;
    }

    public get teleportCount(): number {
        return this._teleportCount;
    }

    public reset() {
        this._selectedType = BoosterType.NONE;
        this._firstTeleportTile = null;
        this._secondTeleportTile = null;
    }

    public apply(game: BlastGame, type: BoosterType) {
        switch (type) {
            case BoosterType.BOMB:
                game._inputState = InputState.BOMB;
                break;
            case BoosterType.TELEPORT:
                game._inputState = InputState.TELEPORT_PHASE_ONE;
                break;
            case BoosterType.NONE:
                game._inputState = InputState.NORMAL;
                this.reset();
        }
        this._selectedType = type;
    }

    public canApply(type: BoosterType): boolean {
        switch (type) {
            case BoosterType.BOMB:
                return this._bombCount > 0;
            case BoosterType.TELEPORT:
                return this._teleportCount > 0;
            case BoosterType.NONE:
                return true;
        }
    }

    public proccessClick(game: BlastGame, tile: Tile): Tile[] {
        switch (game._inputState) {
            case InputState.NORMAL:
                return null;
            case InputState.BOMB:
                const tiles = this.applyBombBooster(tile, game._board);
                game._inputState = InputState.NORMAL;
                this._bombCount--;
                return tiles;
            case InputState.TELEPORT_PHASE_ONE:
                this._firstTeleportTile = tile;
                game._inputState = InputState.TELEPORT_PHASE_TWO;
                return null;
            case InputState.TELEPORT_PHASE_TWO:
                this._secondTeleportTile = tile;
                this.applyTeleportBooster(game);
                game._inputState = InputState.NORMAL;
                this._teleportCount--;
                return null;
        }
    }

    private applyBombBooster(selectedTile: Tile, board: Board): Tile[] {
        const radius = GameConfig.BOOSTER_RADIUS_BOMB;

        const tiles: Tile[] = [];
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= radius) {
                    const tile = board.getTile(selectedTile.x + dx, selectedTile.y + dy);
                    if (tile && !tile.isEmpty) {
                        tiles.push(tile);
                    }
                }
            }
        }

        return tiles;
    }

    private applyTeleportBooster(game: BlastGame): Tile[] {
        game._board.moveTile(this._firstTeleportTile, this._secondTeleportTile);

        this._firstTeleportTile = null;
        this._secondTeleportTile = null;

        game._inputState = InputState.NORMAL;

        return null;
    }
}
