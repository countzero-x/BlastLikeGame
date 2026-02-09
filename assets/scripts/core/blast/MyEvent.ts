export type Handler<T> = { action: (arg1: T) => void, caller: any }

export class MyEvent<T> {
    private _handlers: Handler<T>[] = [];
    private _onceHandlers: Handler<T>[] = [];

    public subscribe(action: (arg1: T) => void, caller: any): void {
        if (this._onceHandlers.find(handler => this.same(handler, action, caller)))
            throw new Error("Error in Event.subscribe(). Already subscribed once");

        if (this._handlers.find(handler => this.same(handler, action, caller)))
            return;

        this._handlers.push({ action, caller: caller });
    }

    public subscribeOnce(action: (arg1: T) => void, caller: any): void {
        if (this._handlers.find(handler => this.same(handler, action, caller)))
            throw new Error("Error in Event.subscribeOnce(). Already subscribed");

        if (this._onceHandlers.find(handler => this.same(handler, action, caller)))
            return;

        this._onceHandlers.push({ action, caller: caller });
    }

    public unsubscribe(action: (arg1: T) => void, caller: any): void {
        const handlerIndex = this._handlers.findIndex(handler => this.same(handler, action, caller));
        if (handlerIndex != -1)
            this._handlers.splice(handlerIndex, 1);

        const onceHandlerIndex = this._onceHandlers.findIndex(handler => this.same(handler, action, caller));
        if (onceHandlerIndex != -1)
            this._onceHandlers.splice(onceHandlerIndex, 1);
    }

    public unsubscribeAll() {
        this._handlers.length = 0;
        this._onceHandlers.length = 0;
    }

    public invoke(arg: T): void {
        const handlers = [...this._handlers];
        handlers.forEach((handler, i) => {
            handler.action.call(handler.caller, arg);
        });

        const onceHandlers = [...this._onceHandlers];
        onceHandlers.forEach(handler => handler.action.call(handler.caller, arg));
        this._onceHandlers.length = 0;
    }

    private same(handler: Handler<T>, action: (arg1: T) => void, caller: any): boolean {
        return handler.action == action && handler.caller == caller;
    }
}
