/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { INftItem, INftActivity } from '@/interfaces/nft';
import { useUserProfile } from '@/context/user-context';
import { Typography } from '@/components/typography';
import ListModal from '@/sections/market/components/list-modal';
import { SuccessModal } from '@/components/success';
import { getNftDetail } from '@/apis/nft';
import TransactionHistory from '../components/transaction-history';
import { parseEther } from 'viem';
import {
  getMarketplaceAddress,
  getAuctionAddress,
  getCurrencyAddress,
} from '@/contracts/utils/getAddress';
import {
  getMarketplaceAbi,
  getAuctionAbi,
  getNftAbi,
  getCurrencyAbi,
} from '@/contracts/utils/getAbis';
import {
  ConnectPublicClient,
  ConnectWalletClient,
} from '@/apis/configs/client';
import { toast } from 'react-toastify';
import { formatEther } from 'ethers/lib/utils';

const DetailItem = ({ title, value }: { title: string; value: string }) => (
  <div className="py-2 space-y-2 bg-neutral2-3 rounded-[20px] transition-colors duration-200 shadow-card p-2 flex flex-col">
    <Typography level="baser" className="text-gray-400 text-center">
      {title}
    </Typography>
    <Typography level="baser" className="text-gray-100 text-center truncate">
      {value}
    </Typography>
  </div>
);

export default function NftDetailView({ id }: { id: string }) {
  const { userProfile } = useUserProfile();
  const [nft, setNft] = useState<INftItem | null>(null);
  const [history, setHistory] = useState<INftActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<
    'LISTING' | 'AUCTION' | 'OFFER' | 'BID'
  >('LISTING');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'details' | 'orders'>('details');
  const [account, setAccount] = useState<string | null>(null);
  const [isListing, setIsListing] = useState(false);
  const [minimumBid, setMinimumBid] = useState<number | null>(null);
  const [auctionStatus, setAuctionStatus] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [auctionInfo, setAuctionInfo] = useState<any>(null);

  const walletClient = ConnectWalletClient();
  const publicClient = ConnectPublicClient();

  const connectWallet = useCallback(async () => {
    if (!walletClient) {
      return false;
    }
    try {
      const [address] = await (await walletClient).requestAddresses();
      if (address) {
        setAccount(address);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error(
        'Failed to connect wallet. Please ensure MetaMask is installed.'
      );
      return false;
    }
  }, [walletClient]);

  const fetchNFT = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getNftDetail(id);
      console.log('NFT Detail:', response.data);
      setNft(response.data);
      setHistory(response.data.activities || []);
    } catch (error) {
      console.error('Error fetching NFT:', error);
      toast.error('Failed to fetch NFT details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMinimumBid = useCallback(async () => {
    if (!publicClient || !auctionInfo) return;
    try {
      const lastBid = Number(formatEther(auctionInfo.lastBid));
      const initialPrice = Number(formatEther(auctionInfo.initialPrice));
      const minimumBidRate =
        Number(
          await publicClient.readContract({
            address: getAuctionAddress() as `0x${string}`,
            abi: getAuctionAbi(),
            functionName: 'minimumBidRate',
          })
        ) / 100;
      const minBid =
        lastBid > 0 ? lastBid * minimumBidRate : initialPrice * minimumBidRate;
      setMinimumBid(Number(minBid.toFixed(4)));
    } catch (error) {
      console.error('Error fetching minimum bid:', error);
    }
  }, []);

  const fetchAuctionStatus = useCallback(async () => {
    if (!publicClient || !auctionInfo) return;
    try {
      const status = (await publicClient.readContract({
        address: getAuctionAddress() as `0x${string}`,
        abi: getAuctionAbi(),
        functionName: 'getAuctionStatus',
        args: [BigInt(auctionInfo.id)],
      })) as string;
      setAuctionStatus(status);
    } catch (error) {
      console.error('Error fetching auction status:', error);
    }
  }, [publicClient]);

  const fetchAuctionInfo = useCallback(async (auctionId: string) => {
    if (!publicClient || !auctionId) return;
    try {
      const auctionData = (await publicClient.readContract({
        address: getAuctionAddress() as `0x${string}`,
        abi: getAuctionAbi(),
        functionName: 'auctions',
        args: [BigInt(auctionId)],
      })) as any;
      setAuctionInfo(auctionData);
    } catch (error) {
      console.error('Error fetching auction info:', error);
    }
  }, []);

  useEffect(() => {
    connectWallet().then((connected) => {
      if (connected) {
        fetchNFT();
      }
    });
  }, []);

  useEffect(() => {
    if (nft?.listing?.[0]?.auctionId) {
      fetchAuctionInfo(nft.listing[0].auctionId);
      fetchMinimumBid();
      fetchAuctionStatus();
    }
  }, [nft]);

  const handleListForSale = async () => {
    if (!walletClient || !publicClient) {
      await connectWallet();
      return;
    }
    setModalType('LISTING');
    setIsListModalOpen(true);
  };

  const handleListForAuction = async () => {
    if (!walletClient || !publicClient) {
      await connectWallet();
      return;
    }
    setModalType('AUCTION');
    setIsListModalOpen(true);
  };

  const handleOpenOfferModal = async () => {
    if (!walletClient || !publicClient) {
      await connectWallet();
      return;
    }
    setModalType('OFFER');
    setIsListModalOpen(true);
  };

  const handleOpenBidModal = async () => {
    if (!walletClient || !publicClient || !nft?.listing?.[0]?.auctionId) {
      await connectWallet();
      return;
    }
    setModalType('BID');
    setIsListModalOpen(true);
  };

  const handleUnlist = async () => {
    if (!nft || !userProfile || !walletClient || !publicClient || !account) {
      await connectWallet();
      return;
    }

    try {
      let txHash;
      if (nft.listing?.[0]?.saleId) {
        const { request } = await publicClient.simulateContract({
          address: getMarketplaceAddress() as `0x${string}`,
          abi: getMarketplaceAbi(),
          functionName: 'cancelSale',
          args: [BigInt(nft.listing[0].saleId)],
          account: account as `0x${string}`,
        });
        txHash = await (await walletClient).writeContract(request);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      } else if (nft.listing?.[0]?.auctionId) {
        const { request } = await publicClient.simulateContract({
          address: getAuctionAddress() as `0x${string}`,
          abi: getAuctionAbi(),
          functionName: 'cancelAuction',
          args: [BigInt(nft.listing[0].auctionId)],
          account: account as `0x${string}`,
        });
        txHash = await (await walletClient).writeContract(request);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      if (txHash) {
        setTxHash(txHash);
        setIsSuccessModalOpen(true);
        setNft((prevNft) => {
          if (!prevNft) return null;
          return {
            ...prevNft,
            listing: prevNft.listing?.map((l) => ({
              ...l,
              status: 'INACTIVE',
            })),
          };
        });
      }
    } catch (error) {
      console.error('Error unlisting NFT:', error);
    }
  };

  const handleBuy = async () => {
    if (
      !nft ||
      !userProfile ||
      !nft.listing?.[0]?.saleId ||
      !walletClient ||
      !publicClient ||
      !account
    ) {
      await connectWallet();
      return;
    }

    try {
      const operatorAddress = getMarketplaceAddress() as `0x${string}`;
      const tokenAddress = getCurrencyAddress() as `0x${string}`;
      const tokenAbi = getCurrencyAbi();
      const saleId = BigInt(nft.listing[0].saleId);
      const price = parseEther(nft.listing[0].price.toString());

      const allowance = (await publicClient.readContract({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: 'allowance',
        args: [account as `0x${string}`, operatorAddress],
      })) as bigint;

      if (allowance < price) {
        const { request: approvalRequest } =
          await publicClient.simulateContract({
            address: tokenAddress,
            abi: tokenAbi,
            functionName: 'approve',
            args: [operatorAddress, price],
            account: account as `0x${string}`,
          });
        const approvalTxHash = await (
          await walletClient
        ).writeContract(approvalRequest);
        await publicClient.waitForTransactionReceipt({ hash: approvalTxHash });
      }

      const { request } = await publicClient.simulateContract({
        address: getMarketplaceAddress() as `0x${string}`,
        abi: getMarketplaceAbi(),
        functionName: 'buy',
        args: [saleId, account],
        account: account as `0x${string}`,
        value: BigInt(0),
      });
      const txHash = await (await walletClient).writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      setTxHash(txHash);
      setIsSuccessModalOpen(true);
      await fetchNFT();
      toast.success(`NFT purchased successfully! Tx: ${txHash}`);
    } catch (error) {
      console.error('Error buying NFT:', error);
      toast.error('Failed to buy NFT. Check console for details.');
    }
  };

  const handleMakeOffer = async (offerAmount: number) => {
    if (
      !nft ||
      !userProfile ||
      !nft.listing?.[0]?.saleId ||
      !walletClient ||
      !publicClient ||
      !account
    ) {
      await connectWallet();
      return;
    }

    try {
      const price = parseEther(offerAmount.toString());
      const { request } = await publicClient.simulateContract({
        address: getMarketplaceAddress() as `0x${string}`,
        abi: getMarketplaceAbi(),
        functionName: 'makeOffer',
        args: [
          BigInt(nft.listing[0].saleId),
          price,
          BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 3600),
        ],
        account: account as `0x${string}`,
        value: price,
      });
      const txHash = await (await walletClient).writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      setTxHash(txHash);
      setIsSuccessModalOpen(true);
      await fetchNFT();
      toast.success(`Offer made successfully! Tx: ${txHash}`);
    } catch (error) {
      console.error('Error making offer:', error);
      toast.error('Failed to make offer. Check console for details.');
    }
  };

  const handleBid = async (bidAmount: number) => {
    if (
      !nft ||
      !userProfile ||
      !nft.listing?.[0]?.auctionId ||
      !walletClient ||
      !publicClient ||
      !account
    ) {
      await connectWallet();
      return;
    }

    try {
      const bidValue = parseEther(bidAmount.toString());
      const operatorAddress = getAuctionAddress() as `0x${string}`;
      const tokenAddress = getCurrencyAddress() as `0x${string}`;
      const tokenAbi = getCurrencyAbi();
      const allowance = (await publicClient.readContract({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: 'allowance',
        args: [account as `0x${string}`, operatorAddress],
      })) as bigint;

      if (allowance < bidValue) {
        const { request: approvalRequest } =
          await publicClient.simulateContract({
            address: tokenAddress,
            abi: tokenAbi,
            functionName: 'approve',
            args: [operatorAddress, bidValue],
            account: account as `0x${string}`,
          });
        const approvalTxHash = await (
          await walletClient
        ).writeContract(approvalRequest);
        await publicClient.waitForTransactionReceipt({ hash: approvalTxHash });
      }

      const { request } = await publicClient.simulateContract({
        address: getAuctionAddress() as `0x${string}`,
        abi: getAuctionAbi(),
        functionName: 'bid',
        args: [BigInt(nft.listing[0].auctionId), bidValue],
        account: account as `0x${string}`,
        value: bidValue,
      });
      const txHash = await (await walletClient).writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      setTxHash(txHash);
      setIsSuccessModalOpen(true);
      await fetchNFT();
    } catch (error) {
      console.error('Error placing bid:', error);
    }
  };

  const handleClaimAuction = async () => {
    if (
      !nft ||
      !userProfile ||
      !nft.listing?.[0]?.auctionId ||
      !walletClient ||
      !publicClient ||
      !account
    ) {
      await connectWallet();
      return;
    }

    setIsClaiming(true);
    try {
      const auctionData = (await publicClient.readContract({
        address: getAuctionAddress() as `0x${string}`,
        abi: getAuctionAbi(),
        functionName: 'auctions',
        args: [BigInt(nft.listing[0].auctionId)],
      })) as any;

      if (
        account.toLowerCase() !== auctionData.lastBidder.toLowerCase() &&
        account.toLowerCase() !== auctionData.auctioneer.toLowerCase()
      ) {
        return;
      }

      const { request } = await publicClient.simulateContract({
        address: getAuctionAddress() as `0x${string}`,
        abi: getAuctionAbi(),
        functionName: 'resolveAuction',
        args: [BigInt(nft.listing[0].auctionId)],
        account: account as `0x${string}`,
      });
      const txHash = await (await walletClient).writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      setTxHash(txHash);
      setIsSuccessModalOpen(true);
      await fetchNFT();
    } catch (error) {
      console.error('Error claiming auction:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleList = async (amount: number, expireDate?: Date | null) => {
    if (!nft || !userProfile || !walletClient || !publicClient || !account) {
      await connectWallet();
      return;
    }
    if (isListing) return;
    setIsListing(true);
    try {
      const operatorAddress =
        modalType === 'LISTING' ? getMarketplaceAddress() : getAuctionAddress();

      const isApproved = await publicClient.readContract({
        address: nft.contractAddress as `0x${string}`,
        abi: getNftAbi(),
        functionName: 'isApprovedForAll',
        args: [account as `0x${string}`, operatorAddress as `0x${string}`],
      });

      if (!isApproved) {
        const { request: approvalRequest } =
          await publicClient.simulateContract({
            address: nft.contractAddress as `0x${string}`,
            abi: getNftAbi(),
            functionName: 'setApprovalForAll',
            args: [operatorAddress as `0x${string}`, true],
            account: account as `0x${string}`,
          });
        const approvalTxHash = await (
          await walletClient
        ).writeContract(approvalRequest);
        await publicClient.waitForTransactionReceipt({ hash: approvalTxHash });
      }

      const startTime = BigInt(Math.floor(Date.now() / 1000));
      const endTime = expireDate
        ? BigInt(Math.floor(expireDate.getTime() / 1000))
        : startTime + BigInt(7 * 24 * 3600);
      const price = parseEther(amount.toString());
      let txHash;

      if (modalType === 'LISTING') {
        const { request } = await publicClient.simulateContract({
          address: getMarketplaceAddress() as `0x${string}`,
          abi: getMarketplaceAbi(),
          functionName: 'createSale',
          args: [
            BigInt(nft.tokenId),
            nft.contractAddress as `0x${string}`,
            startTime,
            endTime,
            price,
          ],
          account: account as `0x${string}`,
        });
        txHash = await (await walletClient).writeContract(request);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      } else if (modalType === 'AUCTION') {
        const { request } = await publicClient.simulateContract({
          address: getAuctionAddress() as `0x${string}`,
          abi: getAuctionAbi(),
          functionName: 'createAuction',
          args: [
            nft.contractAddress as `0x${string}`,
            BigInt(nft.tokenId),
            price,
            startTime,
            endTime,
          ],
          account: account as `0x${string}`,
        });
        txHash = await (await walletClient).writeContract(request);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      } else if (modalType === 'OFFER') {
        await handleMakeOffer(amount);
        return;
      } else if (modalType === 'BID') {
        await handleBid(amount);
        return;
      }

      setTxHash(txHash);
      setIsListModalOpen(false);
      setIsSuccessModalOpen(true);
      await fetchNFT();
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast.error('Failed to list NFT. Check console for details.');
    } finally {
      setIsListing(false);
    }
  };

  if (loading) {
    return (
      <section className="relative w-full h-fit min-h-screen overflow-hidden px-3 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-[20px] bg-neutral2-3 p-4 animate-pulse shadow-card">
            <div className="w-full h-96 bg-neutral2-10 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-neutral2-10 rounded" />
            <div className="h-4 w-1/2 bg-neutral2-10 rounded" />
            <div className="h-4 w-2/3 bg-neutral2-10 rounded" />
            <div className="h-10 w-full bg-neutral2-10 rounded-full" />
          </div>
        </div>
      </section>
    );
  }

  if (!nft) {
    return (
      <section className="relative w-full h-fit min-h-screen overflow-hidden px-3 py-6">
        <Typography level="baser" className="text-gray-400">
          NFT not found.
        </Typography>
      </section>
    );
  }

  const isOwner =
    userProfile?.address.toLowerCase() === nft?.ownerAddress.toLowerCase() ||
    (nft?.listing &&
      nft.listing.length > 0 &&
      userProfile?.id === nft.listing[0]?.sellerId);
  const isListed =
    nft.listing && nft.listing.length > 0 && nft.listing[0].status === 'ACTIVE';
  const isSale =
    isListed && nft.listing && nft.listing[0] ? !!nft.listing[0].saleId : false;
  const isAuction =
    isListed && nft.listing && nft.listing[0]
      ? !!nft.listing[0].auctionId
      : false;
  const canClaim =
    isAuction &&
    ['ENDED', 'CANCELLED'].includes(auctionStatus || '') &&
    (userProfile?.id === nft.listing?.[0]?.sellerId ||
      userProfile?.address.toLowerCase() ===
        auctionInfo.lastBidder?.toLowerCase());

  const shortenAddress = (address: string) =>
    address ? `${address.slice(0, 8)}...${address.slice(-8)}` : '-';

  return (
    <section className="relative w-full h-fit min-h-screen overflow-hidden px-3 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative rounded-[20px] bg-neutral2-3 p-4 shadow-card">
          <div className="relative w-full h-96 overflow-hidden rounded-xl">
            <Image
              src={nft.image || '/svg/list-empty.svg'}
              fill
              alt={nft.name}
              className="object-cover"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Typography
            level="h3"
            className="text-gray-100 flex items-center gap-2"
          >
            <span>
              {nft.name} #{nft.tokenId}
            </span>
            {nft.tokenId && (
              <a
                href={`https://amoy.polygonscan.com/token/${nft.contractAddress}?a=${nft.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-gray-100 hover:text-cherry inline-flex items-center"
                title="View NFT"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </Typography>

          {isListed && nft.listing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem title="Top Offer" value={'0.1 INK'} />
              <DetailItem title="Collection Floor" value={'0.1 INK'} />
              <DetailItem
                title="Last Sale"
                value={`${nft.listing ? nft.listing[0].price.toString() : 0} INK`}
              />
            </div>
          )}

          {isAuction && auctionStatus && (
            <Typography level="baser" className="text-gray-100">
              Status Auction: {auctionStatus}
            </Typography>
          )}

          <div className="flex flex-wrap gap-3">
            {isOwner ? (
              isListed ? (
                <>
                  <button
                    onClick={handleUnlist}
                    className="flex-1 min-w-[120px] px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-gray-300 font-semibold rounded-full shadow-card hover:shadow-wrapper transition-all duration-300"
                  >
                    {isSale ? 'Cancel Sale' : 'Cancel Auction'}
                  </button>
                  {canClaim && (
                    <button
                      onClick={handleClaimAuction}
                      disabled={isClaiming}
                      className="flex-1 min-w-[120px] px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-full shadow-card hover:shadow-wrapper disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isClaiming ? 'Đang Claim...' : 'Claim NFT'}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleListForSale}
                    className="flex-1 min-w-[120px] px-4 py-2 bg-gradient-to-r from-cherry to-black-600 text-white font-semibold rounded-full shadow-card hover:shadow-wrapper transition-all duration-300"
                  >
                    List for Sale
                  </button>
                  <button
                    onClick={handleListForAuction}
                    className="flex-1 min-w-[120px] px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-gray-300 font-semibold rounded-full shadow-card hover:shadow-wrapper transition-all duration-300"
                  >
                    List for Auction
                  </button>
                </>
              )
            ) : isListed ? (
              <>
                {isSale && (
                  <>
                    <button
                      onClick={handleBuy}
                      className="flex-1 min-w-[120px] px-4 py-2 bg-gradient-to-r from-cherry to-black-600 text-white font-semibold rounded-full shadow-card hover:shadow-wrapper transition-all duration-300"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={handleOpenOfferModal}
                      className="flex-1 min-w-[120px] px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-full shadow-card hover:shadow-wrapper transition-all duration-300"
                    >
                      Make Offer
                    </button>
                  </>
                )}
                {isAuction && (
                  <button
                    onClick={handleOpenBidModal}
                    className="flex-1 min-w-[120px] px-4 py-2 bg-gradient-to-r from-green-600 to-green-800 text-white font-semibold rounded-full shadow-card hover:shadow-wrapper transition-all duration-300"
                  >
                    Place Bid
                  </button>
                )}
                {canClaim && (
                  <button
                    onClick={handleClaimAuction}
                    disabled={isClaiming}
                    className="flex-1 min-w-[120px] px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-full shadow-card hover:shadow-wrapper disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isClaiming ? 'Đang Claim...' : 'Claim NFT'}
                  </button>
                )}
              </>
            ) : (
              <Typography level="base2r" className="text-gray-400">
                Not for sale
              </Typography>
            )}
          </div>

          <div className="mt-6">
            <div className="flex border-b border-neutral2-20">
              <button
                className={`px-4 py-2 ${
                  activeTab === 'details'
                    ? 'text-gray-100 border-b-2 border-cherry'
                    : 'text-gray-400 hover:text-gray-100'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === 'orders'
                    ? 'text-gray-100 border-b-2 border-cherry'
                    : 'text-gray-400 hover:text-gray-100'
                }`}
                onClick={() => setActiveTab('orders')}
              >
                Orders
              </button>
            </div>
            <div className="mt-4">
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DetailItem
                    title="Owned By"
                    value={shortenAddress(nft.ownerAddress)}
                  />
                  <DetailItem
                    title="Token Type"
                    value={nft.nftType || 'ERC721'}
                  />
                  <DetailItem title="Token ID" value={nft.tokenId} />
                  <DetailItem
                    title="Contract Address"
                    value={shortenAddress(nft.contractAddress || '')}
                  />
                  <DetailItem
                    title="Chain"
                    value={nft.network || 'Polygon Amoy'}
                  />
                  <DetailItem
                    title="Views"
                    value={nft.viewCount ? nft.viewCount.toString() : '0'}
                  />
                </div>
              )}
              {activeTab === 'orders' && (
                <div className="space-y-2">
                  <Typography level="baser" className="text-gray-100">
                    {nft.offers && nft.offers.length > 0 ? (
                      <div className="space-y-2">
                        {nft.offers.map((order, index: number) => (
                          <div
                            key={index}
                            className="bg-neutral2-5 p-2 rounded-md shadow-card"
                          >
                            <Typography level="h3" className="text-gray-400">
                              {order ? 'Sale' : 'Auction'} #{index + 1}
                            </Typography>
                            <Typography level="baser" className="text-gray-100">
                              Price: {order.offerPrice || 0} INK
                            </Typography>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400">No active offers</div>
                    )}
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TransactionHistory history={history} owner={nft.ownerAddress || ''} />

      <ListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        type={modalType}
        nft={nft}
        isListing={isListing}
        onList={handleList}
        minimumBid={minimumBid}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        hash={txHash}
        title="SUCCESS"
      />
    </section>
  );
}
