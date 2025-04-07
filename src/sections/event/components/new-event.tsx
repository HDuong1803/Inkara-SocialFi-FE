'use client';

import React, { useRef, useState } from 'react';
import { IEventCreation } from '@/interfaces/event';
import { createEvent } from '@/apis/event';
import { useUserProfile } from '@/context/user-context';
import { Avatar } from '@/components/avatar';
import { CloseIcon } from '@/components/icons';
import { Typography } from '@/components/typography';
import { Button } from '@/components/button';
import {
  ConnectPublicClient,
  ConnectWalletClient,
} from '@/apis/configs/client';

interface ICreateEventModalProps {
  onClose: () => void;
}

export default function CreateEventModal({ onClose }: ICreateEventModalProps) {
  const { userProfile } = useUserProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventData, setEventData] = useState<IEventCreation>({
    duration: '',
    entryFee: '',
    depositAmount: '',
    maxParticipants: '',
    description: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof IEventCreation, string>>
  >({});

  const formRef = useRef<HTMLFormElement>(null);

  const walletClient = ConnectWalletClient();
  const publicClient = ConnectPublicClient();

  const getFormData = () => {
    if (!formRef.current) return null;
    const formData = new FormData(formRef.current);
    return {
      description: (formData.get('description') as string) || '',
      duration: (formData.get('duration') as string) || '0',
      maxParticipants: (formData.get('maxParticipants') as string) || '0',
      entryFee: (formData.get('entryFee') as string) || '0',
      depositAmount: (formData.get('depositAmount') as string) || '0',
    };
  };

  const validateField = (
    field: keyof IEventCreation,
    value: string
  ): string | undefined => {
    switch (field) {
      case 'description':
        return value.trim() === '' ? 'Description is required' : undefined;
      case 'duration':
        if (!/^\d+$/.test(value) || parseInt(value) <= 0) {
          return 'Duration must be a positive integer';
        }
        return undefined;
      case 'maxParticipants':
        if (!/^\d+$/.test(value) || parseInt(value) <= 0) {
          return 'Max participants must be a positive integer';
        }
        return undefined;
      case 'entryFee':
        if (!/^\d+(\.\d{1,2})?$/.test(value) || parseFloat(value) <= 0) {
          return 'Entry fee must be a positive number (up to 2 decimal places)';
        }
        return undefined;
      case 'depositAmount':
        if (!/^\d+(\.\d{1,2})?$/.test(value) || parseFloat(value) <= 0) {
          return 'Deposit amount must be a positive number (up to 2 decimal places)';
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const handleInputChange = (field: keyof IEventCreation, value: string) => {
    let cleanedValue = value;
    if (field === 'duration' || field === 'maxParticipants') {
      cleanedValue = value.replace(/[^0-9]/g, '');
    } else if (field === 'entryFee' || field === 'depositAmount') {
      cleanedValue = value.replace(/[^0-9.]/g, '');
      const parts = cleanedValue.split('.');
      if (parts.length > 2) {
        cleanedValue = parts[0] + '.' + parts[1];
      }
    }

    setEventData((prev) => ({
      ...prev,
      [field]: cleanedValue,
    }));

    const error = validateField(field, cleanedValue);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRef.current) return;

    try {
      setIsSubmitting(true);

      const formData = getFormData();
      console.log('Form data:', formData);
      if (!formData) return;

      const newEventData: IEventCreation = {
        description: formData.description,
        duration: formData.duration.replace(/[^0-9]/g, ''),
        maxParticipants: formData.maxParticipants.replace(/[^0-9]/g, ''),
        entryFee: formData.entryFee.replace(/[^0-9.]/g, ''),
        depositAmount: formData.depositAmount.replace(/[^0-9.]/g, ''),
      };

      const formatCurrency = (value: string) => {
        const parts = value.split('.');
        return parts.length === 2
          ? `${parts[0]}.${parts[1].slice(0, 2)}`
          : value;
      };
      newEventData.entryFee = formatCurrency(newEventData.entryFee);
      newEventData.depositAmount = formatCurrency(newEventData.depositAmount);

      const newErrors: Partial<Record<keyof IEventCreation, string>> = {};
      Object.keys(newEventData).forEach((key) => {
        const field = key as keyof IEventCreation;
        const error = validateField(field, newEventData[field]);
        if (error) newErrors[field] = error;
      });
      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        console.log('Validation errors:', newErrors);
        return;
      }

      const response = await createEvent(newEventData);
      if (!response?.data.contractAddress || !response?.data.methodData) {
        throw new Error('Response invalid');
      }

      const { contractAddress, methodData } = response.data;
      const [address] = await (await walletClient).requestAddresses();

      const transactionHash = await (
        await walletClient
      ).sendTransaction({
        account: address as `0x${string}`,
        to: contractAddress as `0x${string}`,
        data: methodData as `0x${string}`,
      });

      if (!transactionHash) throw new Error('Transaction hash is empty');

      let receipt = null;
      const maxRetries = 10;
      const interval = 3000;
      for (let i = 0; i < maxRetries; i++) {
        try {
          receipt = await publicClient.getTransactionReceipt({
            hash: transactionHash,
          });
          if (receipt) break;
        } catch (error) {
          console.error(error);
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
      }

      console.log('Transaction receipt:', receipt);
      onClose();
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const formData = getFormData();
    if (!formData) return false;

    return (
      formData.description.trim() !== '' &&
      parseFloat(formData.entryFee.replace(/[^0-9.]/g, '')) > 0 &&
      parseFloat(formData.depositAmount.replace(/[^0-9.]/g, '')) > 0 &&
      parseInt(formData.maxParticipants.replace(/[^0-9]/g, '')) > 0 &&
      parseInt(formData.duration.replace(/[^0-9]/g, '')) > 0
    );
  };

  return (
    <div className="fixed inset-0 bg-neutral4-95 z-20 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[40rem] bg-surface shadow-wrapper rounded-button border border-neutral1-20 backdrop-blur-50">
        <form ref={formRef} onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral1-20">
            <Typography level="h5" className="font-semibold text-primary">
              Create New Event
            </Typography>
            <Button
              className="w-10 h-10 p-2.5 bg-neutral3-20 hover:bg-neutral3-30 transition-colors rounded-full"
              child={<CloseIcon />}
              onClick={onClose}
            />
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <Avatar
                size={44}
                className="flex-shrink-0 border-2 border-neutral1-20"
                alt="avatar"
                src={userProfile?.photo?.url}
              />
              <div className="flex-1 space-y-6">
                {/* Event Description */}
                <div>
                  <Typography level="base2r" className="mb-2 text-secondary">
                    Event Description
                  </Typography>
                  <input
                    type="text"
                    name="description"
                    value={eventData.description}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    className="w-full bg-neutral3-20 border border-neutral1-30 text-primary placeholder:text-neutral1-60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-wine focus:border-wine hover:bg-neutral3-25 transition-colors"
                    placeholder="Describe your event..."
                  />
                  {errors.description && (
                    <Typography level="base2r" className="mt-1 text-wine">
                      {errors.description}
                    </Typography>
                  )}
                </div>

                {/* Grid of inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Duration */}
                  <div>
                    <Typography level="base2r" className="mb-2 text-secondary">
                      Duration (days)
                    </Typography>
                    <input
                      type="text"
                      name="duration"
                      value={eventData.duration}
                      onChange={(e) =>
                        handleInputChange('duration', e.target.value)
                      }
                      className="w-full bg-neutral3-20 border border-neutral1-30 text-primary placeholder:text-neutral1-60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-wine focus:border-wine hover:bg-neutral3-25 transition-colors"
                      placeholder="Enter duration in days"
                    />
                    {errors.duration && (
                      <Typography level="base2r" className="mt-1 text-wine">
                        {errors.duration}
                      </Typography>
                    )}
                  </div>

                  {/* Max Participants */}
                  <div>
                    <Typography level="base2r" className="mb-2 text-secondary">
                      Max Participants
                    </Typography>
                    <input
                      type="text"
                      name="maxParticipants"
                      value={eventData.maxParticipants}
                      onChange={(e) =>
                        handleInputChange('maxParticipants', e.target.value)
                      }
                      className="w-full bg-neutral3-20 border border-neutral1-30 text-primary placeholder:text-neutral1-60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-wine focus:border-wine hover:bg-neutral3-25 transition-colors"
                      placeholder="Enter max participants"
                    />
                    {errors.maxParticipants && (
                      <Typography level="base2r" className="mt-1 text-wine">
                        {errors.maxParticipants}
                      </Typography>
                    )}
                  </div>

                  {/* Entry Fee */}
                  <div>
                    <Typography level="base2r" className="mb-2 text-secondary">
                      Entry Fee ($)
                    </Typography>
                    <input
                      type="text"
                      name="entryFee"
                      value={eventData.entryFee}
                      onChange={(e) =>
                        handleInputChange('entryFee', e.target.value)
                      }
                      className="w-full bg-neutral3-20 border border-neutral1-30 text-primary placeholder:text-neutral1-60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-wine focus:border-wine hover:bg-neutral3-25 transition-colors"
                      placeholder="Enter entry fee"
                    />
                    {errors.entryFee && (
                      <Typography level="base2r" className="mt-1 text-wine">
                        {errors.entryFee}
                      </Typography>
                    )}
                  </div>

                  {/* Deposit Amount */}
                  <div>
                    <Typography level="base2r" className="mb-2 text-secondary">
                      Deposit Amount ($)
                    </Typography>
                    <input
                      type="text"
                      name="depositAmount"
                      value={eventData.depositAmount}
                      onChange={(e) =>
                        handleInputChange('depositAmount', e.target.value)
                      }
                      className="w-full bg-neutral3-20 border border-neutral1-30 text-primary placeholder:text-neutral1-60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-wine focus:border-wine hover:bg-neutral3-25 transition-colors"
                      placeholder="Enter deposit amount"
                    />
                    {errors.depositAmount && (
                      <Typography level="base2r" className="mt-1 text-wine">
                        {errors.depositAmount}
                      </Typography>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4 border-t border-neutral1-20">
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="px-6 py-3 rounded-button bg-neutral3-20 text-secondary hover:bg-neutral3-30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              child={
                <Typography level="base2r">
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </Typography>
              }
            />
          </div>
        </form>
      </div>
    </div>
  );
}
