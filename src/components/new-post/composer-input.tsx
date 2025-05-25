'use client';

import Image from 'next/image';
import React from 'react';

import { createComment } from '@/apis/comment';
import { createPost } from '@/apis/post';
import { usePost } from '@/context/post-context';
import { useUserProfile } from '@/context/user-context';
import { createPostSchema } from '@/schema/posts-schema';

import { Avatar } from '@/components/avatar';
import { EmojiButton, UploadImgButton } from '@/components/new-post/post-control';
import { Typography } from '@/components/typography';

import { cn } from '@/lib';

import { Button } from '../button';
import { CloseIcon } from '../icons';
import { uploadFile } from '@/apis/media';

interface PostContentProps {
  usedBy: 'post' | 'reply';
  className?: string;
  onCreated?: (isCreate: boolean) => void;
  postId?: string;
  parentComment?: { id: string; fullname: string; username: string };
}

export default function ComposerInput({
  usedBy,
  className,
  onCreated,
  postId,
  parentComment,
}: PostContentProps) {
  const { userProfile } = useUserProfile();
  const { addPost } = usePost();
  const [isInputFocused, setInputFocused] = React.useState<boolean>(false);

  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);

  const [content, setContent] = React.useState<string>('');
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      let photoId: string | null = null;
      if (selectedFile) {
        setIsUploading(true);
        const uploadResponse = await uploadFile(selectedFile);
        photoId = uploadResponse.data.id;
        setIsUploading(false);
      }

      const postData = {
        content,
        photoId,
      };

      const validatedData = createPostSchema.parse(postData);

      if (usedBy === 'reply') {
        const commentData = {
          parentId: parentComment?.id ?? null,
          content: validatedData.content,
        };

        await createComment(
          postId as string,
          parentComment?.id ? commentData : { ...commentData, parentId: null }
        );
        setContent('');
        setPreviewUrl('');
        setSelectedFile(null);
        setInputFocused(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onCreated?.(true);
        return;
      }

      const posts = await createPost(validatedData);
      addPost(posts.data);

      setContent('');
      setPreviewUrl('');
      setSelectedFile(null);
      setInputFocused(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to create post:', error);
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

  React.useEffect(() => {
    if (parentComment?.fullname) {
      setContent(`@${parentComment.username} `);
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = inputRef.current.value.length;
        inputRef.current.selectionEnd = inputRef.current.value.length;
      }
    }
  }, [parentComment]);

  return (
    <div
      className={cn(
        `w-full flex gap-3 h-[64px] z-10 overflow-hidden items-center justify-between p-3 absolute left-0 bottom-0 rounded-[1.25rem] ${
          isInputFocused
            ? 'h-fit flex-col justify-start bg-neutral3-70 hover:bg-neutral2-5'
            : 'flex-row bg-neutral2-2'
        } transition-all duration-[0.2s]`,
        className
      )}
    >
      <div
        className={`w-full flex justify-between items-start gap-3 grow ${
          isInputFocused ? 'items-start' : 'items-center'
        }`}
      >
        <Avatar
          className="rounded-full"
          alt="avatar"
          size={40}
          src={userProfile?.photo?.url}
        />

        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              usedBy === 'post' ? 'Start a post...' : 'Post your reply...'
            }
            className={`min-w-full p-0 text-left min-h-fit max-h-fit !bg-transparent text-tertiary placeholder:text-tertiary grow opacity-50 focus:outline-none focus:bg-transparent focus:opacity-100 ${
              isInputFocused ? 'pt-[0px]' : 'pt-[30px]'
            }`}
            onFocus={() => setInputFocused(true)}
          />
          {previewUrl && (
            <div className="relative mt-2 rounded-lg overflow-hidden group">
              <div className="relative bg-neutral2-1 p-2 rounded-lg">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={600}
                  height={300}
                  style={{ objectFit: 'contain' }}
                  className="w-full h-auto max-h-[18rem] rounded"
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

      <div
        className={`${isInputFocused ? 'w-full' : 'hidden'} flex items-center mt-3`}
      >
        {isInputFocused && usedBy === 'post' ? (
          <div id="tool-reply" className="flex gap-1 items-center mt-3">
            <EmojiButton />
            <UploadImgButton
              fileInputRef={fileInputRef}
              setPreviewUrl={setPreviewUrl}
              setSelectedFile={setSelectedFile}
              setIsUploading={setIsUploading}
            />
          </div>
        ) : (
          ''
        )}

        <Button
          disabled={
            (!content.trim() && !selectedFile) || isUploading || isSubmitting
          }
          className="px-[1.5rem] py-[0.75rem] ml-auto"
          onClick={handleSubmit}
          child={
            <Typography className="text-secondary" level="base2sm">
              {isSubmitting
                ? 'Posting...'
                : usedBy === 'post'
                ? 'Post'
                : 'Reply'}
            </Typography>
          }
        />
      </div>
    </div>
  );
}