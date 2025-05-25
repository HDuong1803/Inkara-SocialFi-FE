'use client';

import Image from 'next/image';
import React from 'react';

import { updateUserAvatar, updateUserProfile } from '@/apis/user';
import { useUserProfile } from '@/context/user-context';
import { IUserProfile } from '@/interfaces/user';

import AvatarProfile from '@/components/avatar/avatar-profile';

import { EditForm, HeaderEdit } from '../profile-edit-components';
import { AvatarUpdateDialog } from '@/components/avatar';
import { uploadFile } from '@/apis/media';
import { USER_AVATAR_PLACEHOLDER } from '@/constant';

//----------------------------------------------------------------

export default function ProfileEditView() {
  const { userProfile, setUserProfile } = useUserProfile();
  const [loading, setLoading] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    fullname: userProfile?.fullname || '',
    username: userProfile?.username || '',
    bio: userProfile?.bio || '',
    // websiteUrl: userProfile?.websiteUrl || '',
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const response = await updateUserProfile(profileData);
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (updatedData: Partial<IUserProfile>) => {
    setProfileData((prevData) => ({ ...prevData, ...updatedData }));
  };

  const handleAvatarUpdate = async (file: File) => {
    if (file) {
      try {
        if (!file.type.startsWith('image/')) {
          throw new Error('File type is not supported');
        }

        if (file.size > 512 * 1024) {
          throw new Error('File size is too large');
        }

        const response = await uploadFile(file);
        // Update user profile
        const updateResponse = await updateUserAvatar({
          avatarId: response.data.id,
        });
        const updatedProfile = updateResponse.data;

        // Update context with full profile
        setUserProfile(updatedProfile);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  return (
    <section className="relative w-full min-h-screen">
      <HeaderEdit
        onSave={handleUpdateProfile}
        onClickCamera={() => setIsDialogOpen(true)}
      />
      <div className="w-full relative">
        <Image
          width={1280}
          height={180}
          src={USER_AVATAR_PLACEHOLDER}
          className="max-h-[11.25rem] w-full object-cover"
          alt="avatar"
        />
        <AvatarProfile avatar={userProfile?.photo?.url} canEdit={true} />
      </div>
      {userProfile && (
        <EditForm
          userInfo={userProfile}
          onUpdateProfile={handleFieldChange}
          loading={loading}
        />
      )}

      <AvatarUpdateDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onUpdateAvatar={handleAvatarUpdate}
        currentAvatar={userProfile?.photo?.url || USER_AVATAR_PLACEHOLDER}
        type="avatar"
      />
    </section>
  );
}
