'use client';

import Image from 'next/image';
import React, { useState, useRef } from 'react';

import { uploadFile } from '@/apis/media';
import { useUserProfile } from '@/context/user-context';

import { Avatar } from '@/components/avatar';
import { ArrowBackIcon, CloseIcon } from '@/components/icons';
import { UploadImgButton } from '@/components/new-post/post-control';
import { Typography } from '@/components/typography';
import { Button } from '../button';
import { DebouncedInput } from '../input';
import {
  ConnectPublicClient,
  ConnectWalletClient,
} from '@/apis/configs/client';
import { getNftAddress } from '@/contracts/utils/getAddress';
import { getNftAbi } from '@/contracts/utils/getAbis';
import { SuccessModal } from '../success';

interface INewNftProps {
  onBack?: () => void;
}

interface Attribute {
  trait_type: string;
  value: string;
}

export default function NewNft({ onBack }: INewNftProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { userProfile } = useUserProfile();
  const walletClient = ConnectWalletClient();
  const publicClient = ConnectPublicClient();

  // NFT metadata states
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [feeNumerator, setFeeNumerator] = useState<string>('500'); // Default 5% royalties
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  const handleMintNft = async () => {
    try {
      setIsSubmitting(true);
      setIsUploading(true);

      // Validate inputs
      if (!selectedFile) {
        throw new Error('NFT image is required');
      }
      if (!name.trim()) {
        throw new Error('NFT name is required');
      }
      const royaltyFee = parseInt(feeNumerator);
      if (isNaN(royaltyFee) || royaltyFee < 0 || royaltyFee > 1000) {
        throw new Error('Royalty fee must be between 0 and 10%');
      }

      const [address] = await (await walletClient).requestAddresses();

      // Upload NFT image
      const uploadResponse = await uploadFile(selectedFile);
      const photoUrl = uploadResponse.data.url;
      if (!photoUrl) {
        throw new Error('Failed to upload NFT image');
      }

      // Create and upload metadata
      const metadata = {
        name: name.trim(),
        description: description.trim(),
        image: photoUrl,
        attributes: attributes.filter(
          (attr) => attr.trait_type.trim() && attr.value.trim()
        ),
      };

      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: 'application/json',
      });
      const metadataFile = new File(
        [metadataBlob],
        `${name.trim() || 'nft'}.json`,
        {
          type: 'application/json',
        }
      );

      const metadataUploadResponse = await uploadFile(metadataFile);
      const tokenUri = metadataUploadResponse.data.url;
      if (!tokenUri) {
        throw new Error('Failed to upload metadata to Arweave');
      }

      // Mint NFT
      const { request } = await publicClient.simulateContract({
        address: getNftAddress() as `0x${string}`,
        abi: getNftAbi(),
        functionName: 'mint',
        args: [tokenUri, feeNumerator],
        account: address as `0x${string}`,
      });
      const txHash = await (await walletClient).writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      setTxHash(txHash);

      // Reset form
      setName('');
      setDescription('');
      setFeeNumerator('500');
      setAttributes([]);
      setPreviewUrl('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('NFT minting failed:', error);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddAttribute = () => {
    setAttributes((prev) => [...prev, { trait_type: '', value: '' }]);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateAttribute = (
    index: number,
    field: 'trait_type' | 'value',
    value: string
  ) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr))
    );
  };

  return (
    <section>
      <div className="fixed w-full h-full top-0 left-0 bg-[#444444] z-20 md:bg-[#12121299] shadow-stack">
        <div className="hidden md:block absolute top-4 right-4 z-20">
          <Button
            className="size-10 p-2.5 bg-neutral2-3 rounded-full"
            child={<CloseIcon />}
            onClick={onBack}
            aria-label="Close form"
          />
        </div>
        <div className="w-full h-full relative bg-[#1a1a1ab3] backdrop-blur-[50px] border border-[#ffffff1a] md:mx-auto md:w-[40rem] md:max-w-[90vw] md:min-h-[60vh] md:max-h-[85vh] md:mt-[5%] md:rounded-2xl">
          <div className="md:hidden w-full flex items-center justify-between p-4 bg-neutral2-3">
            <Button
              className="size-10 p-2.5"
              child={<ArrowBackIcon />}
              onClick={onBack}
              aria-label="Go back"
            />
            <Button
              className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              child={<Typography level="base2sm">Mint NFT</Typography>}
              onClick={handleMintNft}
              disabled={
                !selectedFile || !name.trim() || isUploading || isSubmitting
              }
              aria-label="Mint NFT"
            />
          </div>

          <div className="w-full h-full flex flex-col md:rounded-2xl overflow-y-auto ">
            <div className="w-full p-4 sm:p-6 space-y-6">
              <div>
                <Typography level="h3" className="text-white mb-2">
                  Create Your NFT
                </Typography>
                <Typography level="baser" className="text-gray-400">
                  Mint a unique NFT by uploading an image and defining its
                  details.
                </Typography>
              </div>

              <div className="flex items-start gap-4">
                <Avatar
                  size={44}
                  className="max-h-[44px] rounded-full"
                  alt="User avatar"
                  src={userProfile?.photo?.url}
                />
                <div className="flex-1 space-y-4">
                  {/* Name */}
                  <div>
                    <Typography level="baser" className="text-gray-200 mb-1">
                      NFT Name *
                    </Typography>
                    <DebouncedInput
                      type="text"
                      placeholder="Enter NFT name"
                      value={name}
                      onChange={(value: string) => setName(value)}
                      className="w-full p-3 rounded-lg bg-neutral2-3 text-white placeholder-gray-400 border border-neutral2-20 focus:border-purple-500"
                      aria-label="NFT name"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Typography level="baser" className="text-gray-200 mb-1">
                      Description
                    </Typography>
                    <DebouncedInput
                      type="textarea"
                      placeholder="Describe your NFT"
                      value={description}
                      onChange={(value: string) => setDescription(value)}
                      className="w-full p-3 rounded-lg bg-neutral2-3 text-white placeholder-gray-400 border border-neutral2-20 focus:border-purple-500"
                      aria-label="NFT description"
                    />
                  </div>

                  {/* Royalty Fee */}
                  <div>
                    <Typography level="baser" className="text-gray-200 mb-1">
                      Royalty Fee (%)
                    </Typography>
                    <DebouncedInput
                      type="number"
                      placeholder="Enter royalty fee (e.g., 5 for 5%)"
                      value={feeNumerator}
                      onChange={(value: string) => setFeeNumerator(value)}
                      className="w-full p-3 rounded-lg bg-neutral2-3 text-white placeholder-gray-400 border border-neutral2-20 focus:border-purple-500"
                      min="0"
                      max="1000"
                      aria-label="Royalty fee"
                    />
                    <Typography level="small" className="text-gray-500 mt-1">
                      Max 10% (1000 basis points)
                    </Typography>
                  </div>

                  {/* Attributes */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Typography level="baser" className="text-gray-200">
                        Attributes
                      </Typography>
                      <Button
                        className="px-4 py-2 rounded-lg bg-neutral2-5 text-white hover:bg-neutral2-10"
                        child={
                          <Typography level="baser">Add Attribute</Typography>
                        }
                        onClick={handleAddAttribute}
                      />
                    </div>
                    <div className="max-h-[20rem] overflow-y-auto pr-2">
                      {attributes.map((attr, index) => (
                        <div
                          key={index}
                          className="flex gap-2 mb-3 sm:flex-row flex-col"
                        >
                          <DebouncedInput
                            type="text"
                            placeholder="Trait Type (e.g., Color)"
                            value={attr.trait_type}
                            onChange={(value: string) =>
                              handleUpdateAttribute(index, 'trait_type', value)
                            }
                            className="w-full p-3 rounded-lg bg-neutral2-3 text-white placeholder-gray-400 border border-neutral2-20 focus:border-purple-500"
                            aria-label={`Trait type ${index + 1}`}
                          />
                          <DebouncedInput
                            type="text"
                            placeholder="Value (e.g., Blue)"
                            value={attr.value}
                            onChange={(value: string) =>
                              handleUpdateAttribute(index, 'value', value)
                            }
                            className="w-full p-3 rounded-lg bg-neutral2-3 text-white placeholder-gray-400 border border-neutral2-20 focus:border-purple-500"
                            aria-label={`Trait value ${index + 1}`}
                          />
                          <Button
                            className="p-3 bg-red-500 rounded-lg sm:self-start"
                            child={<CloseIcon />}
                            onClick={() => handleRemoveAttribute(index)}
                            aria-label={`Remove attribute ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image Preview */}
                  {previewUrl && (
                    <div className="relative mt-4 rounded-lg overflow-hidden group">
                      <div className="relative bg-neutral2-1 p-2 rounded-lg">
                        <Image
                          src={previewUrl}
                          alt="NFT Preview"
                          className="w-full h-48 sm:h-64 object-cover rounded"
                          width={300}
                          height={200}
                        />
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-4 right-4 p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-opacity opacity-0 group-hover:opacity-100"
                          disabled={isUploading}
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="fixed bottom-4 w-full mx-auto rounded-[1.25rem] p-2 flex gap-2 items-center bg-neutral2-3 z-20 md:p-4 md:w-full md:bg-transparent md:relative md:mx-0 md:justify-end md:bottom-0">
              <UploadImgButton
                fileInputRef={fileInputRef}
                setPreviewUrl={setPreviewUrl}
                setSelectedFile={setSelectedFile}
                setIsUploading={setIsUploading}
              />
              <Button
                disabled={
                  !selectedFile || !name.trim() || isUploading || isSubmitting
                }
                className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleMintNft}
                child={<Typography level="base2sm">Mint NFT</Typography>}
              />
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          if (onBack) onBack();
        }}
        hash={txHash}
        title="NFT Minted Successfully"
      />
    </section>
  );
}
