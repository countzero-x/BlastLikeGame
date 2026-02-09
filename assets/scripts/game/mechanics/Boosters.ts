import { BlastGame } from "../BlastGame";
import { Board } from "./Board";
import { BoosterType } from "../enums/BoosterType";
import { InputState } from "../enums/InputState";
import { Tile } from "../views/Tile";

export class Boosters {
    private _bombCount: number;
    private _teleportCount: number;

    private _bombMaxCount: number;
    private _teleportMaxCount: number;

    private _firstTeleportTile: Tile;
    private _secondTeleportTile: Tile;

    private _selectedType: BoosterType

    private _bombRadius: number

    public constructor(bombCount: number, teleportCount: number, bombRadius: number) {
        this._bombMaxCount = bombCount;
        this._teleportMaxCount = teleportCount;
        this._bombCount = bombCount;
        this._teleportCount = teleportCount;
        this._bombRadius = bombRadius;
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
        this._bombCount = this._bombMaxCount;
        this._teleportCount = this._teleportMaxCount;
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
                this._firstTeleportTile = null;
                this._secondTeleportTile = null;
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
                this._selectedType = BoosterType.NONE;
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
                this._selectedType = BoosterType.NONE;
                this._teleportCount--;
                return null;
        }
    }

    private applyBombBooster(selectedTile: Tile, board: Board): Tile[] {
        const tiles: Tile[] = [];
        for (let dx = -this._bombRadius; dx <= this._bombRadius; dx++) {
            for (let dy = -this._bombRadius; dy <= this._bombRadius; dy++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this._bombRadius) {
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
        game._board.swapTiles(this._firstTeleportTile, this._secondTeleportTile);

        this._firstTeleportTile = null;
        this._secondTeleportTile = null;

        game._inputState = InputState.NORMAL;

        return null;
    }
}
