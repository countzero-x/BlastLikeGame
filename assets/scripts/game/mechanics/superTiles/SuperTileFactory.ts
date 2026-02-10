import { SuperTileType } from "./SuperTileType";


export class SuperTileFactory {
    private readonly _thresholds: Array<{ threshold: number; type: SuperTileType; }> = [];

    public register(type: SuperTileType, threshold: number) {
        this._thresholds.push({ threshold: threshold, type: type });
    }

    public getType(tilesRemoved: number): SuperTileType {
        const available = this._thresholds.filter(t => tilesRemoved >= t.threshold);
        if (available.length == 0) {
            return SuperTileType.NONE;
        }

        const random = Math.floor(Math.random() * available.length);
        return available[random].type;
    }
}
