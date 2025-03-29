import { PingPongBot } from "./services/PingPongBot";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    const bot = new PingPongBot();
    await bot.start();
}

process.on("SIGINT", () => {
    console.log("Shutting down gracefully...");
    process.exit(0);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
});

main().catch(console.error);
