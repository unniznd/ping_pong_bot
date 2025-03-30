import { ContractHandler } from "../contracts/Contract";
import { FileManager } from "../utils/FileManager";
import { Logger } from "../utils/Logger";

export class PingPongBot {
    private contractHandler: ContractHandler;
    private processedHashesSet: Set<string>;
    private pendingTxHashes: Set<string>; 
    private config: any;
    private HASH_LIMIT = 1000;
    private CLEANUP_INTERVAL = 100;
    private MAX_RETRIES = 3;
    private RETRY_DELAY = 5000; 

    constructor() {
        this.config = FileManager.loadConfig();
        this.processedHashesSet = new Set(FileManager.loadProcessedHashes());
        this.pendingTxHashes = new Set();
        this.contractHandler = new ContractHandler(
            process.env.PROVIDER_URL!,
            process.env.PRIVATE_KEY!,
            this.config.contractAddress
        );
    }

    public async start(): Promise<void> {
        Logger.log(`Starting bot from block ${this.config.lastProcessedBlock}`);

        const provider = this.contractHandler.getProvider();
        provider.on("block", async (blockNumber) => {
            await this.processBlocks(this.config.lastProcessedBlock + 1, blockNumber);
            this.config.lastProcessedBlock = blockNumber;
            FileManager.saveConfig(this.config);
        });

        const currentBlock = await provider.getBlockNumber();
        if (currentBlock > this.config.lastProcessedBlock) {
            await this.processBlocks(this.config.lastProcessedBlock + 1, currentBlock);
            this.config.lastProcessedBlock = currentBlock;
            FileManager.saveConfig(this.config);
        }
    }

    private async processBlocks(fromBlock: number, toBlock: number): Promise<void> {
        Logger.log(`Processing blocks ${fromBlock} to ${toBlock}`);

        const contract = this.contractHandler.getContract();
        const events = await contract.queryFilter(contract.filters.Ping(), fromBlock, toBlock);

        for (const event of events) {
            const txHash = event.transactionHash;
            
            if (!txHash 
                || this.processedHashesSet.has(txHash) 
                || this.pendingTxHashes.has(txHash)) continue;

            try {
                Logger.log(`Processing Ping event with txHash: ${txHash}`);
                this.pendingTxHashes.add(txHash);

                const success = await this.sendPongWithRetry(txHash);
                if (success) {
                    this.processedHashesSet.add(txHash);
                    this.pendingTxHashes.delete(txHash); 
                }

                if (this.processedHashesSet.size % this.CLEANUP_INTERVAL === 0) {
                    this.cleanupProcessedHashes();
                }

                FileManager.saveProcessedHashes(Array.from(this.processedHashesSet));
            } catch (error) {
                Logger.log(`Error processing txHash ${txHash}: ${error}`);
                this.pendingTxHashes.delete(txHash);
            }
        }
    }

    private async sendPongWithRetry(txHash: string, retryCount = 0): Promise<boolean> {
        try {
            const success = await this.contractHandler.sendPong(txHash);
            return success;
        } catch (error) {
            if (retryCount < this.MAX_RETRIES) {
                Logger.log(`Retry attempt ${retryCount + 1} for txHash ${txHash} after error: ${error}`);
                await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
                return await this.sendPongWithRetry(txHash, retryCount + 1);
            }
            Logger.log(`Max retries reached for txHash ${txHash}: ${error}`);
            return false;
        }
    }

    private cleanupProcessedHashes(): void {
        if (this.processedHashesSet.size > this.HASH_LIMIT) {
            const excess = this.processedHashesSet.size - this.HASH_LIMIT;
            const updatedHashes = Array.from(this.processedHashesSet).slice(-this.HASH_LIMIT); 
            this.processedHashesSet = new Set(updatedHashes);

            Logger.log(`Removed ${excess} old transaction hashes`);
            FileManager.saveProcessedHashes(updatedHashes);
        }
    }
}