declare global {
    interface Window {
        electronAPI: {
            send: (channel: string, data?: any) => void;
            on: (channel: string, func: (...args: any[]) => void) => void;
            removeListener: (channel: string, func: (...args: any[]) => void) => void;
        };
    }
}
export {};
