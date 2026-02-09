import { IGameStateContext } from "./IGameStateContext";
import { GameState } from "./GameState";
import { GameStateHandler } from "./GameStateHandler";

export class GameStatesHandler {
    private currentState: GameState | null = null;
    private states: Map<GameState, GameStateHandler>;
    private transitions: Map<GameState, Set<GameState>>;

    private inTransition: boolean;
    private transitionQueue: GameState[] = [];

    public constructor() {
        this.states = new Map();
        this.transitions = new Map();
    }

    public registerState(state: GameState, handler: GameStateHandler): void {
        this.states.set(state, handler);
    }

    public defineTransition(from: GameState, to: GameState[]): void {
        if (!this.transitions.has(from)) {
            this.transitions.set(from, new Set());
        }

        const allowedStates = this.transitions.get(from)!;
        to.forEach(state => allowedStates.add(state));
    }

    public canTransitionTo(state: GameState): boolean {
        if (this.currentState === null) {
            return true;
        }

        const allowedStates = this.transitions.get(this.currentState);

        if (!allowedStates) {
            return false;
        }

        return allowedStates.has(state);
    }

    public transitionTo(state: GameState, context: IGameStateContext): void {
        if (this.inTransition) {
            this.transitionQueue.push(state);
            return;
        }

        this.processQueue(context);
    }

    private async executeTransition(state: GameState, context: IGameStateContext): Promise<void> {
        if (!this.states.has(state)) {
            return;
        }

        if (!this.canTransitionTo(state)) {
            return;
        }

        this.inTransition = true;

        try {
            if (this.currentState !== null) {
                const currentHandler = this.states.get(this.currentState);
                if (currentHandler) {
                    await currentHandler.Exit(context);
                }
            }

            this.currentState = state;

            const newHandler = this.states.get(state);
            if (newHandler) {
                await newHandler.Enter(context);
            }
        } catch (error) {
            throw error;
        } finally {
            this.inTransition = false;
            this.processQueue(context);
        }
    }

    private processQueue(context: IGameStateContext): void {
        if (this.inTransition) {
            return;
        }

        if (this.transitionQueue.length === 0) {
            return;
        }

        const nextTransition = this.transitionQueue.shift()!;
        this.executeTransition(nextTransition, context);
    }
}