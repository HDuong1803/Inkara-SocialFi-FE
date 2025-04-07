import { createWalletClient, createPublicClient, custom, http } from 'viem';
import { polygonAmoy } from 'viem/chains';
import 'viem/window';

export async function ConnectWalletClient() {
  // Check for window.ethereum
  // window.ethereum is an object provided by MetaMask or other web3 wallets
  let transport;
  if (window.ethereum) {
    // If window.ethereum exists, create a custom transport using it
    transport = custom(window.ethereum);
  } else {
    // If window.ethereum is not available, throw an error
    const errorMessage =
      'MetaMask or another web3 wallet is not installed. Please install one to proceed.';
    throw new Error(errorMessage);
  }

  // Declare a Wallet Client
  // This creates a wallet client using the Sepolia chain and the custom transport
  const walletClient = createWalletClient({
    chain: polygonAmoy,
    transport: transport,
  });

  if (!walletClient.requestAddresses) {
    walletClient.requestAddresses = async () => {
      if (!window.ethereum) {
        throw new Error('MetaMask or another web3 wallet is not installed. Please install one to proceed.');
      }
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      return accounts.map((account: string) => `0x${account}`) as `0x${string}`[];
    };
  }

  // Return the wallet client
  return walletClient;
}

export function ConnectPublicClient() {
  // Declare a Public Client
  // This creates a public client using the Sepolia chain and an HTTP transport
  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(
      'https://rpc-amoy.polygon.technology'
    ),
  });

  // Return the public client
  return publicClient;
}
