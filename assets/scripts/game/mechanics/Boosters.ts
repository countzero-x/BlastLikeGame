import { BlastGame } from "../BlastGame";
import { Board } from "./Board";
import { BoosterType } from "../enums/BoosterType";
import { InputState } from "../enums/InputState";
import { Tile } from "../Tile";

export class Boosters {
    private readonly _bombMaxCount: number;
    private readonly _teleportMaxCount: number;
    private readonly _bombRadius: number;

    private _bombCount: number;
    private _teleportCount: number;
    private _selectedType: BoosterType = BoosterType.NONE;

    private _firstTeleportTile: Tile | null = null;
    private _secondTeleportTile: Tile | null = null;

    private readonly _boosterConfig = {
        [BoosterType.BOMB]: {
            inputState: InputState.BOMB,
            getCount: () => this._bombCount,
            decrementCount: () => this._bombCount--,
        },
        [BoosterType.TELEPORT]: {
            inputState: InputState.TELEPORT_PHASE_ONE,
            getCount: () => this._teleportCount,
            decrementCount: () => this._teleportCount--,
        },
        [BoosterType.NONE]: {
            inputState: InputState.NORMAL,
            getCount: () => Infinity,
            decrementCount: () => { },
        },
    };

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

    public reset(): void {
        this._selectedType = BoosterType.NONE;
        this.clearTeleportTiles();
        this._bombCount = this._bombMaxCount;
        this._teleportCount = this._teleportMaxCount;
    }

    public apply(game: BlastGame, type: BoosterType): void {
        const config = this._boosterConfig[type];
        game.inputState = config.inputState;
        this._selectedType = type;

        if (type === BoosterType.NONE) {
            this.clearTeleportTiles();
        }
    }

    public canApply(type: BoosterType): boolean {
        const config = this._boosterConfig[type];
        return config.getCount() > 0;
    }

    public processClick(game: BlastGame, tile: Tile): Tile[] | null {
        const handlers: Record<InputState, () => Tile[] | null> = {
            [InputState.NORMAL]: () => null,
            [InputState.BOMB]: () => this.handleBombClick(game, tile),
            [InputState.TELEPORT_PHASE_ONE]: () => this.handleTeleportPhaseOne(game, tile),
            [InputState.TELEPORT_PHASE_TWO]: () => this.handleTeleportPhaseTwo(game, tile),
        };

        return handlers[game.inputState]();
    }

    private handleBombClick(game: BlastGame, tile: Tile): Tile[] {
        const tiles = this.getBombAffectedTiles(tile, game.board);
        this.completeBoosterUse(game, BoosterType.BOMB);
        return tiles;
    }

    private handleTeleportPhaseOne(game: BlastGame, tile: Tile): Tile[] {
        this._firstTeleportTile = tile;
        game.inputState = InputState.TELEPORT_PHASE_TWO;
        return [];
    }

    private handleTeleportPhaseTwo(game: BlastGame, tile: Tile): Tile[] {
        this._secondTeleportTile = tile;
        this.applyTeleport(game);
        this.completeBoosterUse(game, BoosterType.TELEPORT);
        return [];
    }

    private completeBoosterUse(game: BlastGame, type: BoosterType): void {
        game.inputState = InputState.NORMAL;
        this._selectedType = BoosterType.NONE;
        this._boosterConfig[type].decrementCount();
    }

    private getBombAffectedTiles(selectedTile: Tile, board: Board): Tile[] {
        const tiles: Tile[] = [];
        const radiusSq = this._bombRadius * this._bombRadius;

        for (let dx = -this._bombRadius; dx <= this._bombRadius; dx++) {
            for (let dy = -this._bombRadius; dy <= this._bombRadius; dy++) {
                const distanceSq = dx * dx + dy * dy;

                if (distanceSq <= radiusSq) {
                    const tile = board.getTile(selectedTile.x + dx, selectedTile.y + dy);
                    if (tile?.isEmpty === false) {
                        tiles.push(tile);
                    }
                }
            }
        }

        return tiles;
    }

    private applyTeleport(game: BlastGame): void {
        if (this._firstTeleportTile && this._secondTeleportTile) {
            game.board.swapTiles(this._firstTeleportTile, this._secondTeleportTile);
        }
        this.clearTeleportTiles();
    }

    private clearTeleportTiles(): void {
        this._firstTeleportTile = null;
        this._secondTeleportTile = null;
    }
}
