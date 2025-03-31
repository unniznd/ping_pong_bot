import { JsonRpcProvider, Wallet, Contract, Provider } from "ethers";
import contractABI from "./contractABI";

export class ContractHandler {
    private providers: JsonRpcProvider[];
    private providerIndex: number = 0;
    private wallet: Wallet;
    private contract: Contract;
    private contractAddress: string;
    private privateKey: string;
    private currentProvider: JsonRpcProvider;

    constructor(
        primaryProviderUrl: string,
        secondaryProviderUrl: string,
        privateKey: string,
        contractAddress: string
    ) {
        this.providers = [
            new JsonRpcProvider(primaryProviderUrl),
            new JsonRpcProvider(secondaryProviderUrl)
        ];
        
        this.providerIndex = 0; 
        this.currentProvider = this.providers[this.providerIndex];
        this.privateKey = privateKey;
        this.contractAddress = contractAddress;
        this.wallet = new Wallet(this.privateKey, this.currentProvider);
        this.contract = new Contract(this.contractAddress, contractABI, this.wallet);
        this.updateProvider();

        setInterval(() => this.rotateProvider(), 3600000);
    }

    public async sendPong(txHash: string): Promise<boolean> {
        try {
            const tx = await this.contract.pong(txHash);
            await tx.wait();
            return true;
        } catch (error) {
            console.error(`Failed to send pong for txHash ${txHash}:, error`);
            return false;
        }
    }

    private updateProvider(): void {
        this.currentProvider = this.providers[this.providerIndex];
        this.wallet = new Wallet(this.privateKey, this.currentProvider);
        this.contract = new Contract(this.contractAddress, contractABI, this.wallet);
        console.log(`Switched to provider: ${this.providerIndex}`);
    }

    private async rotateProvider(): Promise<void> {
        console.log("Rotating provider...");
        
        this.providerIndex = (this.providerIndex + 1) % this.providers.length;
        
        this.updateProvider();

        if (this.onProviderChangeCallback) {
            this.onProviderChangeCallback(this.currentProvider);
        }
    }

    public getProvider(): Provider {
        return this.currentProvider;
    }

    public getContract(): Contract {
        return this.contract;
    }

    private onProviderChangeCallback?: (newProvider: Provider) => void;
    
    public setOnProviderChange(callback: (newProvider: Provider) => void): void {
        this.onProviderChangeCallback = callback;
    }
}
