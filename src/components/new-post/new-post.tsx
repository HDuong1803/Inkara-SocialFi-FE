import Image from 'next/image';
import React from 'react';

import { createPost } from '@/apis/post';
import { uploadFile } from '@/apis/media';
import { usePost } from '@/context/post-context';
import { useUserProfile } from '@/context/user-context';
import { createPostSchema } from '@/schema/posts-schema';

import { Avatar } from '@/components/avatar';
import { ArrowBackIcon } from '@/components/icons';
import { CloseIcon } from '@/components/icons';
import { UploadImgButton } from '@/components/new-post/post-control';
import { Typography } from '@/components/typography';

import { Button } from '../button';
import { DebouncedInput } from '../input';

interface INewPostProps {
  onBack?: () => void;
}

export default function NewPost({ onBack }: INewPostProps) {
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const { userProfile } = useUserProfile();
  const { addPost } = usePost();

  const [content, setContent] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      let photoId: string | null = null;
      if (selectedFile) {
        setIsUploading(true);
        const uploadResponse = await uploadFile(selectedFile);
        photoId = uploadResponse.data.id;
      }

      const postData = {
        content: content.trim(),
        photoId,
      };

      const validatedData = createPostSchema.parse(postData);

      const posts = await createPost(validatedData);
      addPost(posts.data);

      // Reset form
      setContent('');
      setPreviewUrl('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      if (onBack) onBack();
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed w-full h-full top-0 left-0 bg-[#444444] z-20 md:bg-[#12121299] shadow-stack">
      <div className="hidden md:block absolute top-2 right-2 z-20">
        <Button
          className="size-[40px] p-2.5"
          child={<CloseIcon />}
          onClick={onBack}
        />
      </div>
      <div className="w-full h-full relative shadow-button bg-[#282828b3] backdrop-blur-[50px] before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:border-[1.5px] before:border-[#ffffff1a] before:[mask-image:linear-gradient(175deg,#000,transparent_50%)] md:mx-auto md:w-[40rem] md:h-[16rem] md:mt-[10%] md:rounded-button md:before:rounded-button ">
        <div className="md:hidden w-full flex items-center justify-between p-3">
          <Button
            className="size-10 p-2.5"
            child={<ArrowBackIcon />}
            onClick={onBack}
          />
          <Button
            className="px-[1.5rem] py-[0.75rem] rounded-[2rem] text-secondary"
            child={<Typography level="base2sm">Post</Typography>}
          />
        </div>

        <div className="w-full max-h-screen mx-auto flex flex-col justify-between items-center md:h-full md:items-start md:justify-between md:static md:rounded-[2rem]">
          <div className="w-full p-3 rounded-[1.25rem]">
            <div className="flex items-start gap-3">
              <Avatar
                size={44}
                className="max-h-[44px]"
                alt="avatar"
                src={userProfile?.photo?.url}
              />
              <div className="flex-1">
                <DebouncedInput
                  type="text"
                  placeholder="Start a post..."
                  value={content}
                  onChange={(value: string) => setContent(value)}
                />
                {previewUrl && (
                  <div className="relative mt-2 rounded-lg overflow-hidden group">
                    <div className="relative bg-neutral2-1 p-2 rounded-lg">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded"
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
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="fixed bottom-4 w-fit mx-auto rounded-[1.25rem] p-2 flex gap-2 items-center bg-neutral2-3 z-20 md:p-3 md:w-full md:bg-transparent md:relative md:mx-0 md:justify-between md:bottom-0">
            <UploadImgButton
              fileInputRef={fileInputRef}
              setPreviewUrl={setPreviewUrl}
              setSelectedFile={setSelectedFile}
              setIsUploading={setIsUploading}
            />

            <Button
              disabled={!content.trim() || isUploading || isSubmitting}
              type="submit"
              className="flex px-[1.5rem] py-[0.75rem] rounded-[2rem] text-secondary ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              child={<Typography level="base2sm">Post</Typography>}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
