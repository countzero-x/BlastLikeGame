
export class GameConfig {
    // Размеры доски
    static readonly DEFAULT_BOARD_WIDTH = 8;
    static readonly DEFAULT_BOARD_HEIGHT = 8;

    static readonly TILE_SIZE = 50;
    static readonly TILE_SPACING = 2;

    // Очки
    static readonly SCORE_FOR_TILE = 10;
    static readonly TARGET_SCORE = 1000;

    // Ходы
    static readonly MAX_MOVES = 10;

    static readonly MAX_SHUFFLES = 3;

    static readonly SUPERTILE_REMOVED_COUNT_FOR_LINE = 5;
    static readonly SUPERTILE_REMOVED_COUNT_FOR_RADIUS_BOMB = 8;
    static readonly SUPERTILE_REMOVED_COUNT_FOR_MAX_BOMB = 10;

    static readonly RADIUS_BOMB = 2;
}
