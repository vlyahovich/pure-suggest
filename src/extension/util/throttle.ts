export function throttle(fn: Function, time?: number) {
    let locked: boolean = false,
        lastArgs: any[];

    return function wrapper(...args: any[]) {
        if (locked) {
            lastArgs = args;

            return;
        }

        fn(...args);

        locked = true;

        setTimeout(() => {
            if (lastArgs) {
                wrapper(...lastArgs);

                lastArgs = null;
            }

            locked = false;
        }, time);
    }
}