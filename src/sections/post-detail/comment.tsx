import React from 'react';
import Image from 'next/image';
import { CommentIcon, HeartIcon } from '@/components/icons';
import { IComment } from '@/interfaces/comment';
import { cn } from 'tailwind-variants';
import { USER_AVATAR_PLACEHOLDER } from '@/constant';
import { ReactItem } from '@/components/post/react-item';
import { getComments } from '@/apis/comment';
import { likeAction } from '@/apis/like';
import { useUserProfile } from '@/context/user-context';
import { ILikes } from '@/interfaces/post';

interface CommentProps {
  data: IComment;
  className?: string;
  onUpdateComment?: (updatedComment: IComment) => void;
  setParentComment?: (parentComment: { id: string; fullname: string, username: string }) => void;
  openMoreOptionsId?: string | null;
  setOpenMoreOptionsId?: (id: string | null) => void;
  onDeleteSuccess?: (isDeleted: boolean) => void;
}

export default function Comment({
  data,
  className,
  setParentComment,
}: CommentProps) {
  const { userProfile } = useUserProfile();
  const [localData, setLocalData] = React.useState<IComment>(data);
  const [isLiked, setIsLiked] = React.useState<boolean>(false);
  const [childComments, setChildComments] = React.useState<IComment[]>([]);

  React.useEffect(() => {
    if (!userProfile?.id) return;
    setIsLiked(localData.likes?.some((like) => like.userId === userProfile.id));
  }, [localData.likes, userProfile?.id, data.id]);

  const handleLikeClick = async (commentId: string) => {
    if (!commentId) return;
    try {
      setIsLiked(!isLiked);
      const updatedLikes = isLiked
        ? localData.likes.filter((like) => like.userId !== userProfile?.id) // Unlike
        : [...localData.likes, { userId: userProfile?.id } as ILikes]; // Like

      setLocalData((prev) => ({
        ...prev,
        likes: updatedLikes,
      }));
      await likeAction('comment', commentId);
    } catch (error) {
      console.error('Failed to update like status:', error);
    }
  };

  const onLoadMore = (parentId: string) => {
    getComments(null, parentId, {
      startId: 0,
      offset: data._count?.children ?? 1,
      limit: 5,
    }).then((response) => {
      setChildComments((prev) => [...prev, ...response.data]);
    });
  };

  return (
    <div className={`${cn('group relative pl-4 flex gap-3', className)}`}>
      {!('parentId' in data) && (
        <div className="absolute left-10 top-8 bottom-0 w-px bg-neutral-300 dark:bg-neutral-600" />
      )}

      <div className="flex gap-3 rounded-lg transition-colors mt-5">
        {/* Avatar */}
        <div className="flex-shrink-0 z-10">
          <Image
            src={data.user?.photo?.url || USER_AVATAR_PLACEHOLDER}
            alt={data.user?.fullname}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
          />
        </div>

        {/* Content section */}
        <div className="flex-1 min-w-0">
          <div className="bg-neutral2-2 rounded-[1.25rem] p-4 hover:bg-neutral2-3 transition-colors">
            {/* User info */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-primary">
                  {data.user?.fullname}
                </span>
                <span className="text-xs text-tertiary">
                  {new Date(data.createdAt).toLocaleDateString('vi-VN', {
                    hour: 'numeric',
                    minute: 'numeric',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Comment content */}
            <p className="text-sm text-secondary break-words">{data.content}</p>
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-1">
            <ReactItem
              value={localData.likes?.length || 0}
              icon={<HeartIcon isActive={isLiked} />}
              onClick={() => handleLikeClick(localData.id)}
            />

            <ReactItem
              value={data._count?.children ?? 0}
              icon={<CommentIcon />}
              onClick={() =>
                setParentComment?.({
                  id: data.id,
                  fullname: data.user.fullname,
                  username: data.user.username,
                })
              }
              className="text-xs text-tertiary gap-1 hover:text-blue-500 transition-colors"
            />

            {(data._count?.children ?? 0) > childComments.length && (
              <button
                onClick={() => onLoadMore?.(data.id)}
                className="font-rubik font-semibold text-[0.8rem]/[1rem] opacity-80 text-secondary group-hover:text-primary"
              >
                View more {(data._count?.children ?? 0) - childComments.length}{' '}
                replies
              </button>
            )}
          </div>
          {childComments.length > 0 && (
            <div className="mt-2 space-y-2">
              {childComments.map((child) => (
                <Comment
                  key={child.id}
                  data={child}
                  className="ml-10"
                  setParentComment={setParentComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
