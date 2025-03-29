import { JsonRpcProvider, Wallet, Contract } from "ethers";
import contractABI from "./contractABI";


export class ContractHandler {
    private provider: JsonRpcProvider;
    private wallet: Wallet;
    private contract: Contract;

    constructor(providerUrl: string, privateKey: string, contractAddress: string) {
        this.provider = new JsonRpcProvider(providerUrl);
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

    public getProvider(): JsonRpcProvider {
        return this.provider;
    }

    public getContract(): Contract {
        return this.contract;
    }
}
