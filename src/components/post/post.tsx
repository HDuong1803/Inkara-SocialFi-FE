'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { deletePost } from '@/apis/post';
import { ILikes, IPost } from '@/interfaces/post';
import { IUserProfile } from '@/interfaces/user';
import { useUserProfile } from '@/context/user-context';

import { cn } from '@/lib/utils';

import { Avatar } from '../avatar';
import { CommentIcon, HeartIcon, MoreIcon } from '../icons';
import UpdatePost from '../new-post/update-post';
import { Portal } from '../portal';
import { Typography } from '../typography';
import { MoreOptions } from './components/more-options';
import { ReactItem } from './react-item';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '../alert-dialog';
import { Button } from '../button';
import { likeAction } from '@/apis/like';
import CommentList from '@/sections/post-detail/comment-list';
import { ComposerInput } from '../new-post';
import { getComments } from '@/apis/comment';

//-------------------------------------------------------------------------

interface PostProps {
  data: IPost;
  className?: string;
  onUpdatePost?: (updatedPost: IPost) => void;
  setParentComment?: (parentComment: { id: string; username: string }) => void;
  onDeleteSuccess?: (isDeleted: boolean) => void;
  type?: string;
  openMoreOptionsId?: string | null;
  setOpenMoreOptionsId?: (id: string | null) => void;
  showComments?: boolean;
  onToggleComments?: (postId: string) => void;
}

export default function Post({
  data,
  className,
  onUpdatePost,
  onDeleteSuccess,
  openMoreOptionsId,
  setOpenMoreOptionsId,
  showComments,
  onToggleComments,
}: PostProps) {
  const { userProfile } = useUserProfile();
  const [localData, setLocalData] = React.useState(data);
  const [loadedCommentsCount, setLoadedCommentsCount] = React.useState(5);
  const [isEdit, setIsEdit] = React.useState<boolean>(false);
  const [isConfirm, setIsConfirm] = React.useState<boolean>(false);
  const [isLiked, setIsLiked] = React.useState<boolean>(false);
  const [isCreated, setIsCreated] = React.useState(false);

  React.useEffect(() => {
    if (isCreated) {
      setLoadedCommentsCount((prev) => prev + 1);
      setIsCreated(false);
    }
  }, [isCreated]);

  const [parentComment, setParentComment] = React.useState<{
    id: string;
    fullname: string;
    username: string;
  }>({ id: '', fullname: '', username: '' });
  const isPostType = data.type === 'text' || data.type === 'media';

  React.useEffect(() => {
    if (!userProfile?.id) return;
    setIsLiked(localData.likes?.some((like) => like.userId === userProfile.id));
  }, [localData.likes, userProfile?.id, data.id]);

  const handleLikeClick = async (postId: string) => {
    if (!postId) return;
    try {
      setIsLiked(!isLiked);
      const updatedLikes = isLiked
        ? localData.likes.filter((like) => like.userId !== userProfile?.id) // Unlike
        : [...localData.likes, { userId: userProfile?.id } as ILikes]; // Like

      setLocalData((prev) => ({
        ...prev,
        likes: updatedLikes,
        _count: {
          ...prev._count,
          likes: updatedLikes.length,
        },
      }));
      await likeAction('post', postId);
    } catch (error) {
      console.error('Failed to update like status:', error);
    }
  };

  const handleMoreOptions = () => {
    setOpenMoreOptionsId?.(openMoreOptionsId === data.id ? null : data.id);
  };

  const handleCommentClick = () => {
    onToggleComments?.(data.id);
  };

  const handleLoadMoreComments = async () => {
    try {
      const response = await getComments(data.id, null, {
        startId: 1,
        offset: loadedCommentsCount,
        limit: 5,
      });

      if (response.data.length > 0) {
        setLocalData((prev) => ({
          ...prev,
          comments: [...prev.comments, ...response.data],
        }));
        setLoadedCommentsCount((prevOffset) => prevOffset + 5);
      }
    } catch (error) {
      console.error('Failed to load more comments:', error);
    }
  };

  const handleUpdatePost = (updatedPost: IPost) => {
    setLocalData(updatedPost);
    onUpdatePost?.(updatedPost);
    setIsEdit(false);
    handleMoreOptions();
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(data.id);
      onDeleteSuccess?.(true);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
    setIsConfirm(false);
  };

  const handleConfirmDelete = () => {
    setIsConfirm(true);
  };

  const handleCancelDelete = () => {
    setIsConfirm(false);
  };

  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isEdit) {
        setIsEdit(false);
      }
    };

    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isEdit]);

  return (
    <div
      className={cn(
        'relative w-full h-fit flex flex-col rounded-[1.25rem] p-3 bg-neutral2-2 gap-3 [transition:background_.2s] hover:bg-neutral2-5',
        className
      )}
    >
      <div className="flex items-start gap-5">
        <Link
          href={
        localData.creatorId === userProfile?.id
          ? '/profile'
          : `/profile/${localData.creatorId}`
          }
          className="cursor-pointer"
        >
          <Avatar
        alt="avatar"
        src={localData?.user?.photo?.url || ''}
        size={44}
          />
        </Link>
        <div className="w-full flex flex-col gap-2">
          <div className="relative z-0 flex justify-items-auto items-center">
        <Link
          href={
            localData.creatorId === userProfile?.id
          ? '/profile'
          : `/profile/${localData.creatorId}`
          }
          className="cursor-pointer"
        >
          <Typography
            level="base2m"
            className="text-primary font-bold justify-self-start opacity-80 mr-4"
          >
            {localData?.user?.fullname}
          </Typography>
        </Link>
        <Typography
          level="captionr"
          className="text-tertiary justify-self-start grow opacity-45"
        >
          {new Date(localData.createdAt).toLocaleDateString('vi-VN', {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Typography>

        {data.creatorId === (userProfile as IUserProfile)?.id && (
          <MoreIcon onClick={handleMoreOptions} />
        )}
        {openMoreOptionsId === data.id && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpenMoreOptionsId?.(null)}
          />
        )}
          </div>
          <Link href={`/posts/${localData.id}`} className="cursor-pointer">
        <Typography level="body2r" className="text-secondary opacity-80">
          {localData.content}
        </Typography>
          </Link>

          {(localData as IPost).photo?.url && (
        <Link href={`/posts/${localData.id}`}>
          <Image
            width={400}
            height={400}
            src={localData?.photo?.url || ''}
            alt="post-image"
            className="max-h-[400px] w-full rounded-[1.5rem] object-cover"
          />
        </Link>
          )}
        </div>
        {openMoreOptionsId === data.id && (
          <MoreOptions
        onEdit={() => setIsEdit(true)}
        onDelete={handleConfirmDelete}
          />
        )}
      </div>

      <div className="flex justify-end items-center md:justify-start md:pl-[48px]">
        <ReactItem
          value={(localData as IPost)._count?.likes || 0}
          icon={<HeartIcon isActive={isPostType && isLiked} />}
          onClick={() => handleLikeClick(localData.id)}
        />

        <ReactItem
          value={(localData as IPost)._count?.comments || 0}
          icon={<CommentIcon />}
          onClick={handleCommentClick}
        />
      </div>

      {showComments && (
        <div className="mt-4 pl-14">
          <CommentList
            comments={localData.comments.slice(0, loadedCommentsCount)}
            setParentComment={setParentComment}
            onLoadMore={() => handleLoadMoreComments()}
            className="space-y-2"
          />
          {localData._count.comments > loadedCommentsCount && (
            <div className="flex justify-center">
              <button
                onClick={handleLoadMoreComments}
                className="w-full sm:w-auto font-rubik font-semibold text-[0.9rem]/[1rem] opacity-80 group-hover:text-primary p-3 text-tertiary"
              >
                View more
              </button>
            </div>
          )}
          <ComposerInput
            className="bg-neutral3-70 relative top-1 bottom-0"
            usedBy="reply"
            postId={data?.id}
            onCreated={setIsCreated}
            parentComment={parentComment}
          />
        </div>
      )}

      {isEdit && (
        <Portal>
          <UpdatePost
            postId={data.id}
            onUpdateSuccess={handleUpdatePost}
            onClose={() => setIsEdit(false)}
          />
        </Portal>
      )}

      <AlertDialog open={isConfirm} onOpenChange={handleCancelDelete}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <Typography level="base2sm" className="text-tertiary">
              Are you sure you want to delete this post?
            </Typography>
          </AlertDialogDescription>

          <AlertDialogFooter>
            <Button
              onClick={handleCancelDelete}
              className="w-full sm:w-auto"
              child={
                <Typography level="base2sm" className="p-3 text-tertiary">
                  Cancel
                </Typography>
              }
            />

            <Button
              onClick={handleDeletePost}
              className="w-full sm:w-auto"
              child={
                <Typography level="base2sm" className="p-3 text-tertiary">
                  Confirm
                </Typography>
              }
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
