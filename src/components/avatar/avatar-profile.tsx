import React from 'react';
import { uploadFile } from '@/apis/media';
import { updateUserAvatar } from '@/apis/user';
import { useUserProfile } from '@/context/user-context';

import { CameraIcon } from '../icons';
import { USER_AVATAR_PLACEHOLDER } from '@/constant';
import Avatar from './avatar';
import AvatarUpdateDialog from './avatar-profile-dialog';

interface AvatarProfileProps {
  avatar?: string;
  canEdit: boolean;
}

const AvatarProfile = ({ avatar, canEdit }: AvatarProfileProps) => {
  const { setUserProfile } = useUserProfile();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleUpdateAvatar = async (file: File) => {
    if (!file) return;

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File type is not supported');
      }
      if (file.size > 512 * 1024) {
        throw new Error('File size is too large');
      }

      // Upload image
      const uploadResponse = await uploadFile(file);

      // Update user profile
      const updateResponse = await updateUserAvatar({
        avatarId: uploadResponse.data.id,
      });
      const updatedProfile = updateResponse.data;

      // Update context with full profile
      setUserProfile(updatedProfile);

      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to update avatar:', error);
      // TODO: Thêm thông báo lỗi cho người dùng (toast)
    }
  };

  return (
    <>
      <div
        className={`w-fit absolute flex justify-center items-center left-[20px] -bottom-[36px] z-1 rounded-full border-[4px] border-[#303030] overflow-hidden ${canEdit && 'after:content-[""] after:absolute after:bg-[#12121299] after:inset-0'}`}
      >
        <Avatar
          size={80}
          src={avatar || USER_AVATAR_PLACEHOLDER}
          alt="Avatar"
        />

        {canEdit && (
          <button
            className="absolute z-[2]"
            onClick={() => setIsDialogOpen(true)}
          >
            <CameraIcon />
          </button>
        )}
      </div>

      <AvatarUpdateDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onUpdateAvatar={handleUpdateAvatar}
        currentAvatar={avatar || USER_AVATAR_PLACEHOLDER}
        type="avatar"
      />
    </>
  );
};

export default AvatarProfile;
