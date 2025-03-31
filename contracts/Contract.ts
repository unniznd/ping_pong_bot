import { JsonRpcProvider, Wallet, Contract, FallbackProvider, Provider } from "ethers";
import contractABI from "./contractABI";

export class ContractHandler {
    private provider: Provider;
    private wallet: Wallet;
    private contract: Contract;

    constructor(
        primaryProviderUrl: string,
        secondayProviderUrl: string,
        privateKey: string,
        contractAddress: string
    ) {
        const primaryProvider = new JsonRpcProvider(primaryProviderUrl);

        const alchemyProvider = new JsonRpcProvider(secondayProviderUrl);

        this.provider = new FallbackProvider([
            primaryProvider,  
            alchemyProvider,
        ]);

        this.wallet = new Wallet(privateKey, this.provider);
        this.contract = new Contract(contractAddress, contractABI, this.wallet);
    }

    public async sendPong(txHash: string): Promise<boolean> {
        try {
            const tx = await this.contract.pong(txHash);
            await tx.wait();
            return true;
        } catch (error) {
            console.error(`Failed to send pong for txHash ${txHash}:`, error);
            return false;
        }
    }

    public getProvider(): Provider {
        return this.provider;
    }

    public getContract(): Contract {
        return this.contract;
    }
}