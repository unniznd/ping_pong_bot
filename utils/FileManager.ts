import * as fs from "fs";
import * as path from "path";

export class FileManager {
    private static configPath = path.join(__dirname, "../config/config.json");
    private static hashesPath = path.join(__dirname, "../config/processedHashes.json");

    static loadConfig(): any {
        try {
            return JSON.parse(fs.readFileSync(this.configPath, "utf8"));
        } catch (error) {
            console.error("Error loading config:", error);
            return null;
        }
    }

    static saveConfig(config: any): void {
        fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    }

    static loadProcessedHashes(): string[] {
        try {
            if (fs.existsSync(this.hashesPath)) {
                return JSON.parse(fs.readFileSync(this.hashesPath, "utf8"));
            }
        } catch (error) {
            console.error("Error loading processed hashes:", error);
        }
        return [];
    }

    static saveProcessedHashes(hashes: string[]): void {
        fs.writeFileSync(this.hashesPath, JSON.stringify(hashes, null, 2));
    }
}
