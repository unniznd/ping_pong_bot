export class Logger {
    static log(message: string): void {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }
}
