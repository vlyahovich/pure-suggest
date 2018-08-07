export function debounce(fn: Function, time?: number) {
    let timeout: any;

    return function (...args: any[]) {
        clearTimeout(timeout);

        timeout = setTimeout(() => fn(...args), time);
    }
}