export class EventEmitter {
    public length = 0;

    protected events: {
        [propName: string]: Function[];
    };

    constructor() {
        this.events = {};
    }

    on(eventName: string, fn: Function) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(fn);
        this.length++;

        return () => this.off(eventName, fn);
    }

    off(eventName: string, fn: Function) {
        this.events[eventName] = this.events[eventName].filter((eventFn) => fn !== eventFn);
        this.length--;
    }

    trigger(eventName: string, ...args: any[]) {
        let event = this.events[eventName];

        if (event) {
            event.forEach((fn) => fn(...args));
        }
    }
}