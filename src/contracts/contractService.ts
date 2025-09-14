import { ethers } from 'ethers';
import { CONTRACT_CONFIG, CONTRACT_ABI, ERC20_ABI, ShopId, FrontendAmount } from './contractConfig';

export class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private paymentToken: ethers.Contract | null = null;

  async initialize() {
    console.log('Initializing contract service...');
    console.log('Contract address from config:', CONTRACT_CONFIG.address);
    console.log('Environment variable:', process.env.REACT_APP_CONTRACT_ADDRESS);
    
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum as any);
    await this.provider.send('eth_requestAccounts', []);
    this.signer = await this.provider.getSigner();

    if (!CONTRACT_CONFIG.address) {
      console.error('Contract address is empty!');
      throw new Error('Contract address not configured');
    }

    this.contract = new ethers.Contract(
      CONTRACT_CONFIG.address,
      CONTRACT_ABI,
      this.signer
    );
    
    // Initialize payment token contract with hardcoded testnet token address
    console.log('Payment token address:', CONTRACT_CONFIG.paymentTokenAddress);
    this.paymentToken = new ethers.Contract(CONTRACT_CONFIG.paymentTokenAddress, ERC20_ABI, this.signer);

    // Check if we're on the correct network
    const network = await this.provider.getNetwork();
    console.log('Current network:', network.chainId, 'Required:', CONTRACT_CONFIG.chainId);
    
    if (network.chainId !== BigInt(CONTRACT_CONFIG.chainId)) {
      // Try to switch to Kairos testnet automatically
      try {
        await (window.ethereum as any).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CONTRACT_CONFIG.chainId.toString(16)}` }], // Convert 1001 to 0x3E9
        });
      } catch (switchError: any) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            await (window.ethereum as any).request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${CONTRACT_CONFIG.chainId.toString(16)}`,
                chainName: 'Kairos Testnet',
                rpcUrls: [CONTRACT_CONFIG.rpcUrl],
                nativeCurrency: {
                  name: 'KAIA',
                  symbol: 'KAIA',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://kairos.kaiascope.com'],
              }],
            });
          } catch (addError) {
            throw new Error('Failed to add Kairos testnet to your wallet. Please add it manually.');
          }
        } else {
          throw new Error(`Please switch to Kairos testnet (Chain ID: ${CONTRACT_CONFIG.chainId})`);
        }
      }
    }
  }

  async buyGiftCard(shopId: ShopId, amount: FrontendAmount): Promise<string> {
    if (!this.contract || !this.signer || !this.paymentToken) {
      throw new Error('Contract not initialized');
    }

    try {
      // Map frontend values to contract values
      const contractShopId = CONTRACT_CONFIG.shopIdMapping[shopId];
      const contractAmount = CONTRACT_CONFIG.amountMapping[amount];

      console.log('=== PURCHASE DEBUG INFO ===');
      console.log('Frontend shopId:', shopId);
      console.log('Contract shopId:', contractShopId);
      console.log('Frontend amount:', amount);
      console.log('Contract amount:', contractAmount);
      console.log('Wallet address:', await this.signer.getAddress());
      console.log('Contract address:', this.contract.target);
      
      if (!contractShopId) {
        throw new Error(`Invalid shop ID: ${shopId}. Valid shops: ${Object.keys(CONTRACT_CONFIG.shopIdMapping).join(', ')}`);
      }
      
      if (!contractAmount) {
        throw new Error(`Invalid amount: ${amount}. Valid amounts: ${Object.keys(CONTRACT_CONFIG.amountMapping).join(', ')}`);
      }

      // Calculate token amount (amount in USD * 10^18 for token decimals)
      const tokenAmount = ethers.parseEther(contractAmount.toString());
      console.log('Token amount needed:', ethers.formatEther(tokenAmount), 'tokens');
      
      // Check token balance
      const userAddress = await this.signer.getAddress();
      const balance = await this.paymentToken.balanceOf(userAddress);
      console.log('User token balance:', ethers.formatEther(balance));
      
      if (balance < tokenAmount) {
        throw new Error(`Insufficient token balance. You have ${ethers.formatEther(balance)} tokens but need ${ethers.formatEther(tokenAmount)}`);
      }
      
      // Check current allowance
      const currentAllowance = await this.paymentToken.allowance(userAddress, this.contract.target);
      console.log('Current allowance:', ethers.formatEther(currentAllowance));
      
      // If allowance is insufficient, request approval
      if (currentAllowance < tokenAmount) {
        console.log('Requesting token approval...');
        try {
          const approveTx = await this.paymentToken.approve(this.contract.target, tokenAmount);
          console.log('Approval transaction sent:', approveTx.hash);
          await approveTx.wait();
          console.log('Token approval confirmed');
        } catch (approveError: any) {
          console.error('Token approval failed:', approveError);
          throw new Error(`Token approval failed: ${approveError.message}`);
        }
      }
      
      console.log(`Attempting to buy gift card for shop: ${contractShopId}, amount: ${contractAmount}`);

      // First, let's try to estimate gas to get a better error message
      try {
        const gasEstimate = await this.contract.buyGiftCard.estimateGas(contractShopId, contractAmount);
        console.log('Gas estimate successful:', gasEstimate.toString());
      } catch (estimateError: any) {
        console.error('Gas estimation failed:', estimateError);
        
        // Try to decode the error
        if (estimateError.data) {
          console.log('Error data:', estimateError.data);
        }
        
        // Provide more specific error messages
        if (estimateError.message.includes('Shop not active')) {
          throw new Error(`Shop "${contractShopId}" is not active or not whitelisted in the contract`);
        } else if (estimateError.message.includes('Invalid gift card amount')) {
          throw new Error(`Amount $${contractAmount} is not valid. Valid amounts are: 5, 10, 25, 50, 100`);
        } else {
          throw new Error(`Transaction will fail: ${estimateError.shortMessage || estimateError.message}`);
        }
      }

      // Call the buyGiftCard function
      const tx = await this.contract.buyGiftCard(contractShopId, contractAmount);
      console.log('Transaction sent:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Find the GiftCardPurchased event to get the purchaseId
      const purchaseEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = this.contract!.interface.parseLog(log);
          return parsedLog?.name === 'GiftCardPurchased';
        } catch {
          return false;
        }
      });

      if (purchaseEvent) {
        const parsedEvent = this.contract.interface.parseLog(purchaseEvent);
        const purchaseId = parsedEvent?.args.purchaseId;
        console.log('Purchase ID:', purchaseId);
        return purchaseId;
      }

      throw new Error('Failed to get purchase ID from transaction');

    } catch (error: any) {
      console.error('Error buying gift card:', error);
      
      // Handle common errors
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds for this transaction');
      } else if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction cancelled by user');
      } else if (error.message?.includes('Shop not active')) {
        throw new Error('This shop is not currently available');
      } else if (error.message?.includes('Invalid gift card amount')) {
        throw new Error(`Amount $${amount} is not supported by this shop`);
      } else {
        throw new Error(`Transaction failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  async confirmGiftCardDelivery(purchaseId: string): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.confirmGiftCardDelivery(purchaseId);
      console.log('Confirmation transaction sent:', tx.hash);
      
      await tx.wait();
      console.log('Gift card delivery confirmed');
    } catch (error: any) {
      console.error('Error confirming delivery:', error);
      throw new Error(`Failed to confirm delivery: ${error.message || 'Unknown error'}`);
    }
  }

  async getPurchaseDetails(purchaseId: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const details = await this.contract.getPurchaseDetails(purchaseId);
      return {
        buyer: details[0],
        shopId: details[1], 
        amount: Number(details[2]),
        tokenAmount: details[3],
        status: Number(details[4]), // 0: Pending, 1: Confirmed, 2: Refunded
        createdAt: Number(details[5])
      };
    } catch (error: any) {
      console.error('Error getting purchase details:', error);
      throw new Error(`Failed to get purchase details: ${error.message || 'Unknown error'}`);
    }
  }

  async getWalletAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return await this.signer.getAddress();
  }

  async getBalance(): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error('Wallet not connected');
    }
    const balance = await this.provider.getBalance(await this.signer.getAddress());
    return ethers.formatEther(balance);
  }

  async checkShopStatus(shopId: string): Promise<{ name: string; isActive: boolean; addedAt: number }> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    try {
      const details = await this.contract.getShopDetails(shopId);
      return {
        name: details[0],
        isActive: details[1],
        addedAt: Number(details[2])
      };
    } catch (error) {
      console.error('Error checking shop status:', error);
      throw error;
    }
  }

}

// Singleton instance
export const contractService = new ContractService();