/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { BidItem, OfferItem } from '../../market/components/offer-item';
import { Pagination } from '@/components/pagination';
import { ViewMyBidModal } from '@/sections/market/components/my-bids-modal';
import { bytes32ToString, getStatusStyle } from '@/utils/helper';
import CountdownTimer from '@/sections/market/components/count-down/timer';

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
  const offersPerPage = 5;
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
  const [currentOfferPage, setCurrentOfferPage] = useState(1);
  const [isViewMyBidModalOpen, setIsViewMyBidModalOpen] = useState(false);

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
      setNft(response.data);
      const historyNft = response.data.activities?.filter((activity) =>
        [
          'LISTED_FOR_AUCTION',
          'LISTED_FOR_SALE',
          'MINTED',
          'SOLD',
          'UNLISTED',
          'TRANSFERRED',
        ].includes(activity.actionType)
      );
      setHistory(historyNft || []);
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
      const lastBid = Number(formatEther(auctionInfo[6]));
      const initialPrice = Number(formatEther(auctionInfo[4]));
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
  }, [auctionInfo]);

  const fetchAuctionStatus = useCallback(async () => {
    if (!publicClient || !auctionInfo) return;
    try {
      const status = (await publicClient.readContract({
        address: getAuctionAddress() as `0x${string}`,
        abi: getAuctionAbi(),
        functionName: 'getAuctionStatus',
        args: [BigInt(auctionInfo[1])],
      })) as string;
      setAuctionStatus(bytes32ToString(status));
    } catch (error) {
      console.error('Error fetching auction status:', error);
    }
  }, [auctionInfo, publicClient]);

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
    } catch (error) {
      console.error('Error buying NFT:', error);
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
      if (userOffer) {
        await handleEditOffer(userOffer.id, offerAmount);
        toast.success('Offer updated successfully!');
      } else {
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
        toast.success(`Offer made successfully! Tx: ${txHash}`);
      }
      await fetchNFT();
    } catch (error) {
      console.error('Error making/editing offer:', error);
      toast.error('Failed to process offer. Check console for details.');
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
        value: BigInt(0),
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
        account.toLowerCase() !== auctionData[7].toLowerCase() &&
        account.toLowerCase() !== auctionData[0].toLowerCase()
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
      if (modalType === 'LISTING' || modalType === 'AUCTION') {
        const operatorAddress =
          modalType === 'LISTING'
            ? getMarketplaceAddress()
            : getAuctionAddress();

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
          await publicClient.waitForTransactionReceipt({
            hash: approvalTxHash,
          });
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
        }
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

  const handleEditOffer = async (offerId: string, newPrice: number) => {
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerPrice: newPrice }),
      });
      if (!response.ok) throw new Error('Failed to edit offer');
      return await response.json();
    } catch (error) {
      console.error('Error editing offer:', error);
      throw error;
    }
  };

  const userBid = useMemo(() => {
    if (!userProfile || !nft?.activities) return [];
    return nft.activities.filter(
      (activity) =>
        activity.actionType === 'PLACE_BID' &&
        activity.fromAddress?.toLowerCase() ===
          userProfile.address.toLowerCase()
    );
  }, [nft?.activities, userProfile]);

  const userOffer = useMemo(() => {
    if (!userProfile || !nft?.offers) return null;
    return nft.offers.find(
      (offer) =>
        offer.userOfferId.toLowerCase() === userProfile.id.toLowerCase()
    );
  }, [nft?.offers, userProfile]);

  const userHasBid = useMemo(() => {
    if (!userProfile || !nft?.activities) return false;
    return nft.activities.some(
      (activity) =>
        activity.actionType === 'PLACE_BID' &&
        activity.fromAddress?.toLowerCase() ===
          userProfile.address.toLowerCase()
    );
  }, [nft?.activities, userProfile]);

  // const bidOffers = useMemo(() => {
  //   if (!nft?.offers || !nft.listing?.[0]?.auctionId) return [];
  //   return nft.offers.filter((offer) => offer.auctionId === nft.listing![0].id);
  // }, [nft?.offers, nft?.listing]);

  const bidActivities = useMemo(() => {
    if (!nft?.activities || !nft.listing?.[0]?.auctionId) return [];
    return nft.activities.filter(
      (activity) => activity.actionType === 'PLACE_BID'
    );
  }, [nft?.activities, nft?.listing]);

  const offerActivities = useMemo(() => {
    if (!nft?.activities || !nft.listing?.[0]?.saleId) return [];
    return nft.activities.filter((activity) =>
      [
        'CREATED_OFFER',
        'CANCELED_OFFER',
        'ACCEPTED_OFFER',
        'REJECTED_OFFER',
      ].includes(activity.actionType)
    );
  }, [nft?.activities, nft?.listing]);

  const paginatedOffers = useMemo(() => {
    const start = (currentOfferPage - 1) * offersPerPage;
    return offerActivities.slice(start, start + offersPerPage);
  }, [offerActivities, currentOfferPage]);

  // const handleOpenEditOfferModal = async (
  //   offerId: string,
  //   currentPrice: number
  // ) => {
  //   setModalType('OFFER');
  //   setIsListModalOpen(true);
  // };

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
      userProfile?.address.toLowerCase() === auctionInfo[7].toLowerCase());
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            {isAuction && (
              <span
                className={`px-4 py-1 rounded-full text-sm ${getStatusStyle(auctionStatus || '')}`}
              >
                {auctionStatus}
              </span>
            )}
          </div>

          {isListed && nft.listing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nft.listing[0].saleId ? (
                <DetailItem
                  title="Top Offer"
                  value={`${nft?.offers && nft?.offers[0]?.saleId ? nft.offers[0].offerPrice.toString() + ' INK' : '-'}`}
                />
              ) : (
                <>
                  <CountdownTimer
                    targetDate={auctionInfo ? Number(auctionInfo[9]) * 1000 : 0}
                  />
                  <DetailItem
                    title="Top Bid"
                    value={`${nft?.offers && nft?.offers[0]?.auctionId ? nft.offers[0].offerPrice.toString() + ' INK' : '-'}`}
                  />
                </>
              )}

              <DetailItem
                title="Initial Price"
                value={`${nft.listing ? nft.listing[0].price.toString() + ' INK' : '-'}`}
              />
            </div>
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
                      {isClaiming ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Claiming...
                        </span>
                      ) : (
                        'Claim NFT'
                      )}
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
                  <>
                    {userHasBid ? (
                      <button
                        onClick={() => setIsViewMyBidModalOpen(true)}
                        className="flex-1 min-w-[120px] px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        View My Bid
                      </button>
                    ) : ['ONGOING'].includes(auctionStatus || '') ? (
                      <button
                        onClick={handleOpenBidModal}
                        className={`flex-1 min-w-[120px] px-4 py-2 rounded-full shadow-lg transition-all duration-300 bg-gradient-to-r from-green-600 to-green-800 text-white hover:shadow-xl`}
                      >
                        Place Bid
                      </button>
                    ) : (
                      <button
                        className={`flex-1 min-w-[120px] px-4 py-2 rounded-full shadow-lg transition-all duration-300 bg-gray-600 cursor-not-allowed text-gray-400`}
                      >
                        Auction ended
                      </button>
                    )}
                  </>
                )}
                {canClaim && (
                  <button
                    onClick={handleClaimAuction}
                    disabled={isClaiming}
                    className="flex-1 min-w-[120px] px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-full shadow-card hover:shadow-wrapper disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isClaiming ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Claiming...
                      </span>
                    ) : (
                      'Claim NFT'
                    )}
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
                <div className="space-y-4">
                  {isSale && (
                    <div>
                      <Typography level="h4" className="text-gray-100 mb-4">
                        Sale Offers
                      </Typography>
                      {paginatedOffers.length > 0 ? (
                        <div className="space-y-3">
                          {paginatedOffers.map((offer) => (
                            <OfferItem
                              key={offer.id}
                              offer={offer}
                              isUserOffer={offer.id === userOffer?.id}
                              onEdit={handleEditOffer}
                            />
                          ))}
                          <Pagination
                            totalItems={offerActivities.length}
                            itemsPerPage={offersPerPage}
                            currentPage={currentOfferPage}
                            onPageChange={setCurrentOfferPage}
                          />
                        </div>
                      ) : (
                        <Typography level="base2r" className="text-gray-400">
                          No offers yet.
                        </Typography>
                      )}
                    </div>
                  )}
                  {isAuction && (
                    <div className="space-y-4">
                      {bidActivities.length > 0 ? (
                        <div className="space-y-4">
                          {bidActivities.map((activity) => (
                            <BidItem key={activity.id} activity={activity} />
                          ))}
                        </div>
                      ) : (
                        <Typography
                          level="base2r"
                          className="text-gray-400 italic"
                        >
                          No bids placed yet.
                        </Typography>
                      )}
                    </div>
                  )}
                  {!isSale && !isAuction && (
                    <Typography level="base2r" className="text-gray-400">
                      No active sale or auction.
                    </Typography>
                  )}
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
      <ViewMyBidModal
        isOpen={isViewMyBidModalOpen}
        onClose={() => setIsViewMyBidModalOpen(false)}
        bids={userBid}
      />
    </section>
  );
}
