'use client';

import {
  Clock,
  Users,
  DollarSign,
  Award,
  AlertTriangle,
  Sword,
  Gem,
  Wallet,
  Hourglass,
  CalendarCheck,
  Vote,
  ScrollText,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { getEventDetail, hasVotedForEvent, voteForEvent } from '@/apis/event';
import { EventStatus, IEvent } from '@/interfaces/event';
import Custom404 from '@/pages/404';
import React from 'react';
import { Card, CardContent } from '@/components/card/card';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { useUserProfile } from '@/context/user-context';
import { USER_AVATAR_PLACEHOLDER } from '@/constant';
import Progress from '@/components/progress/progress';
import {
  ConnectWalletClient,
  ConnectPublicClient,
} from '@/apis/configs/client';

export default function EventDetailView({ id }: { id: string }) {
  const user = useUserProfile();
  const [data, setData] = React.useState<IEvent | null>(null);
  const [isOwner, setIsOwner] = React.useState(false);
  const [isVoted, setIsVoted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const walletClient = ConnectWalletClient();
  const publicClient = ConnectPublicClient();

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      const voteResponse = await hasVotedForEvent(id);
      setIsVoted(voteResponse.data);
    })();

    getEventDetail(id).then((response) => {
      setData(response.data);
      setIsOwner(response.data?.creator === user?.userProfile?.address);
    });
  }, [id, user, user?.userProfile?.address]);

  // handler vote for event
  const handleVote = async () => {
    setIsLoading(true);
    try {
      if (!data) return;
      console.log('Voting for event:', id);
      const response = await voteForEvent(Number(id));
      console.log('Vote response:', response);
      if (!response?.data.contractAddress || !response?.data.methodData) {
        throw new Error('Response invalid');
      }
      const { methodData, contractAddress } = response.data;
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
      setIsVoted(true);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          _count: {
            ...prev._count,
            votes: (prev._count?.votes || 0) + 1,
          },
        };
      });
    } catch (error) {
      console.error('Error voting for event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!data) return <Custom404 />;

  const handleBack = () => {
    window.history.back();
  };

  const renderActionButtons = () => {
    if (data.status === 'ENDED') {
      return (
        <Button
          className="bg-wine hover:bg-wine/90 text-primary w-full"
          child="Claim Deposit"
        >
          <Wallet className="mr-2 h-4 w-4" />
          Claim Deposit
        </Button>
      );
    }

    if (isOwner) {
      return (
        <div className="flex gap-3">
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            child="End Event"
          >
            <Sword className="mr-2 h-4 w-4" />
            End Event
          </Button>
          <Button
            className="bg-surface-3 text-primary hover:bg-surface-4"
            child="Edit Settings"
          >
            <ScrollText className="mr-2 h-4 w-4" />
            Edit Settings
          </Button>
        </div>
      );
    }

    if (data.status === 'UPCOMING') {
      return isVoted ? (
        <Button
          className="px-4 py-2 bg-success text-caption w-full text-secondary"
          child="You have already voted"
          disabled
        >
          You have already voted
        </Button>
      ) : (
        <Button
          className="px-4 py-2 bg-surface-2 hover:bg-surface-3 text-caption w-full text-secondary transition-colors"
          child="Vote for Event"
          onClick={handleVote}
          disabled={isLoading}
        >
          Vote for Event
        </Button>
      );
    }

    if (data.status === 'ONGOING') {
      return (
        <div className="flex gap-3">
          <Button
            className="bg-wine hover:bg-wine/90 text-primary w-full"
            child="Join Event"
          >
            <Gem className="mr-2 h-4 w-4" />
            Join Event (${data.entryFee})
          </Button>
          <Button className="w-full outline" child="Submit NFT">
            <Gem className="mr-2 h-4 w-4" />
            Submit NFT
          </Button>
        </div>
      );
    }

    return null;
  };

  const getStatusStyle = (status: EventStatus) => {
    const styles = {
      UPCOMING: 'bg-blue-100/20 text-blue-500 border border-blue-500/30',
      ONGOING: 'bg-green-100/20 text-green-500 border border-green-500/30',
      ENDED: 'bg-neutral2-10 text-tertiary border border-neutral2-20',
    };
    return styles[status];
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const getRiskDescription = (score: number) => {
    if (score < 30) return 'Low Risk';
    if (score < 70) return 'Medium Risk';
    return 'High Risk';
  };

  const calculateTimeProgress = (start: string, end: string) => {
    const now = Date.now();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    if (now < startTime) return 0;
    if (now > endTime) return 100;
    return ((now - startTime) / (endTime - startTime)) * 100;
  };

  const getTimeRemainingText = (start: string, end: string) => {
    const now = Date.now();
    const endTime = new Date(end).getTime();
    const startTime = new Date(start).getTime();

    if (now < startTime) {
      const days = Math.ceil((startTime - now) / (1000 * 3600 * 24));
      return `Starts in ${days} day${days > 1 ? 's' : ''}`;
    }
    if (now > endTime) return 'Event has ended';

    const days = Math.ceil((endTime - now) / (1000 * 3600 * 24));
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  };

  const getDurationDays = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  // Tính toán tỷ lệ vote
  const totalVotes = data._count.votes || 0;
  const votePercentage =
    totalVotes > 0 ? ((data._count.votes || 0) / (((data.maxParticipants || 0) + 1) / 2)) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <button
        onClick={handleBack}
        className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </button>

      {/* Main Layout: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scrollable */}
        <div className="lg:col-span-2 space-y-6 overflow-y-auto max-h-[calc(100vh-100px)]">
          {/* Event Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Avatar
                  className="rounded-full"
                  alt="avatar"
                  size={24}
                  src={data.user?.photo?.url || USER_AVATAR_PLACEHOLDER}
                />
                <span className="text-sm text-blue-600">
                  Proposed by: {data.user?.username}
                </span>
              </div>
              <span
                className={`px-4 py-1 rounded-full text-sm ${getStatusStyle(data.status)}`}
              >
                {data.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              #{id} - {data.user.username}&apos;s Event
            </h1>
          </div>

          {/* Description */}
          <Card className="bg-surface-1 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4 text-secondary">
                <FileText className="h-5 w-5" />
                <h2 className="text-title font-medium text-primary">
                  Description
                </h2>
              </div>
              <p className="text-base2 text-secondary whitespace-pre-line">
                {data.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>

          {/* Time Progress */}
          <Card className="bg-surface-1 shadow-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between text-caption text-secondary">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  <span>{new Date(data.startTime).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hourglass className="h-4 w-4" />
                  <span>{new Date(data.endTime).toLocaleDateString()}</span>
                </div>
              </div>
              <Progress
                value={calculateTimeProgress(data.startTime, data.endTime)}
                className="h-2 bg-neutral2-10"
                indicatorClass="bg-wine"
              />
              <div className="text-center text-caption text-secondary">
                {getTimeRemainingText(data.startTime, data.endTime)}
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card className="bg-surface-1 shadow-card">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-title font-medium text-primary mb-2">
                Event Details
              </h2>
              <DetailItem
                icon={<DollarSign className="h-5 w-5" />}
                label="Entry Fee"
                value={`$${parseFloat(data.entryFee).toFixed(2)}`}
              />
              <DetailItem
                icon={<Wallet className="h-5 w-5" />}
                label="Deposit Amount"
                value={`$${parseFloat(data.depositAmount).toFixed(2)}`}
              />
              <DetailItem
                icon={<Clock className="h-5 w-5" />}
                label="Duration"
                value={`${getDurationDays(data.startTime, data.endTime)} days`}
              />
              <DetailItem
                icon={<Users className="h-5 w-5" />}
                label="Participants"
                value={`${data._count?.participants}/${data.maxParticipants}`}
              />
            </CardContent>
          </Card>

          {/* AI Review (if applicable) */}
          {data.aiRiskScore > 0 && (
            <Card className="bg-surface-1 shadow-card">
              <CardContent className="p-6 flex items-center gap-4">
                <AlertTriangle
                  className={`h-8 w-8 ${getRiskColor(data.aiRiskScore)}`}
                />
                <div>
                  <h3 className="text-title text-primary mb-1">AI Review:</h3>
                  {data.aiReview && (
                    <div className="ml-auto">
                      <p className="text-base2 text-secondary">
                        {data.aiReview}
                      </p>
                    </div>
                  )}
                  <p className="text-base2 text-secondary">
                    AI Score: {data.aiRiskScore}/100 -{' '}
                    {getRiskDescription(data.aiRiskScore)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Fixed */}
        <div className="space-y-6 sticky top-6 self-start">
          {/* Requested Amount */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-primary mb-2">
              Requested amount:
            </h2>
            <p className="text-2xl font-bold text-primary">
              ${Number(data.depositAmount).toLocaleString()}
            </p>
          </div>

          {/* Voting Stats */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary">
                Votes ({data._count.votes || 0})
              </span>
              <span className="text-sm font-semibold text-primary">
                {votePercentage.toFixed(2)}%
              </span>
            </div>
            <Progress
              value={votePercentage}
              className="h-2 bg-neutral2-10"
              indicatorClass="bg-green-500"
            />
          </div>

          {/* Event Stats */}
          <Card className="bg-surface-1 shadow-card">
            <CardContent className="p-6 space-y-4">
              <StatItem
                icon={<Users className="h-5 w-5" />}
                label="Participants"
                value={`${data._count?.participants}/${data.maxParticipants}`}
              />
              <StatItem
                icon={<Award className="h-5 w-5" />}
                label="NFTs Submitted"
                value={data._count?.nftSubmissions || 0}
              />
              <StatItem
                icon={<DollarSign className="h-5 w-5" />}
                label="Total Pool"
                value={`$${(Number(data.depositAmount) * Number(data._count?.participants || 0)).toFixed(2)}`}
              />
              <StatItem
                icon={<Vote className="h-5 w-5" />}
                label="Total Votes"
                value={totalVotes}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-surface-1 shadow-card">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-title font-medium text-primary mb-2">
                Actions
              </h2>
              {renderActionButtons()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper components
const StatItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center gap-3">
    <div className="bg-neutral2-10 p-2 rounded-lg">{icon}</div>
    <div>
      <p className="text-caption text-secondary">{label}</p>
      <p className="text-title font-semibold text-primary">{value}</p>
    </div>
  </div>
);

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-3 text-secondary">
      {icon}
      <span className="text-base2">{label}</span>
    </div>
    <span className="text-base2 font-medium text-primary">{value}</span>
  </div>
);
