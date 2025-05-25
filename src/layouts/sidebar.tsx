import { useRouter } from 'next/navigation';
import React from 'react';

import useBreakPoint from '@/hooks/use-breakpoint';

import { paths } from '@/routes/paths';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import {
  AddIcon,
  ChevronRight,
  ExpandControl,
  Leave,
  Logo,
  MoreIcon,
  SettingSlider,
} from '@/components/icons';
import { Typography } from '@/components/typography';

import { useUserProfile } from '@/context/user-context';
import useUnreadNoti from '@/hooks/use-unread-noti';

import { NAVIGATION_ITEMS } from './navigation-items';
import NavigationBar from './navigationbar';

import { USER_AVATAR_PLACEHOLDER } from '@/constant/contants';
import { cn } from '@/lib/utils';
import { IUserProfile } from '@/interfaces/user';
import { logout } from '@/apis/auth';
import { NewNftModal } from '@/components/nft';

//-----------------------------------------------------------------------------------------------

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { breakpoint } = useBreakPoint();
  const unreadCount = useUnreadNoti();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isCreateNft, setIsCreateNft] = React.useState(false);

  const navItems = NAVIGATION_ITEMS.map((item) =>
    item.title === 'Notifications'
      ? { ...item, update: { status: true, count: unreadCount } }
      : item
  );

  const { userProfile } = useUserProfile();

  React.useEffect(() => {
    setIsExpanded(
      !(breakpoint === 'sm' || breakpoint === 'md' || breakpoint === 'lg')
    );
  }, [breakpoint]);

  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isCreateNft) {
        setIsCreateNft(false);
      }
    };

    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isCreateNft]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCreateNft = () => {
    setIsCreateNft(!isCreateNft);
  };

  return (
    <aside
      className={cn(
        `group/sidebar flex flex-col h-screen bg-surface-3 transition-[width] duration-300 ease-in-out ${
          isExpanded ? 'w-70 2xl:w-80' : 'w-18'
        }`,
        className
      )}
    >
      <section className="w-full flex justify-between items-center p-3">
        <div className=" h-[44px] w-fit relative flex items-center">
          <Logo
            className={`mx-auto transition-all transform ${
              isExpanded
                ? 'opacity-100 translate-x-0'
                : 'group-hover/sidebar:-translate-x-5 group-hover/sidebar:opacity-0'
            }`}
          />
          {!isExpanded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                className={`group p-2.5 transition-all  transform group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100  ${
                  isExpanded ? 'opacity-0' : 'translate-x-5 opacity-0'
                }`}
                onClick={toggleSidebar}
                child={
                  <ChevronRight className="h-6 w-6 stroke-secondary group-hover:stroke-primary group-active:stroke-primary group-[.disabled]:stroke-tertiary" />
                }
              />
            </div>
          )}
        </div>
        {isExpanded && (
          <Button
            className={'p-2.5'}
            onClick={toggleSidebar}
            child={
              <ExpandControl className="h-6 w-6 fill-secondary group-hover:fill-primary group-active:fill-primary group-[.disabled]:fill-tertiary" />
            }
          />
        )}
      </section>

      <section id="navigation" className="p-3 flex-1">
        <NavigationBar
          expanded={isExpanded}
          navigationItems={navItems}
          className="flex-1"
        />
      </section>
      <section className="p-3 flex flex-col gap-2 items-center justify-center">
        {userProfile && (
          <UserSection isExpanded={isExpanded} user={userProfile} />
        )}
        <Button
          className={`${isExpanded ? 'px-6 py-3 w-full' : 'size-[44px]'}`}
          onClick={() => {
            handleCreateNft();
          }}
          child={
            isExpanded ? (
              <Typography
                level="base2sm"
                className="text-secondary select-none "
              >
                Mint NFT
              </Typography>
            ) : (
              <AddIcon />
            )
          }
        />
      </section>

      {isCreateNft && <NewNftModal onBack={handleCreateNft} />}
    </aside>
  );
}

interface UserSectionProps {
  isExpanded: boolean;
  user: IUserProfile;
}

export function UserSection({ isExpanded, user }: UserSectionProps) {
  const [isMoreOptions, setIsMoreOptions] = React.useState(false);
  const router = useRouter();

  const toggleMoreOptions = () => {
    setIsMoreOptions(!isMoreOptions);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      <div
        onClick={toggleMoreOptions}
        className={`relative z-20 flex p-1.5 gap-3 w-full items-center justify-center backdrop-blur-16  hover:bg-neutral1-5 active:bg-neutral4-30 ${isExpanded ? 'rounded-xl' : 'rounded-full '}`}
      >
        <Avatar
          src={user.photo?.url || USER_AVATAR_PLACEHOLDER}
          alt={user.fullname}
          size={32}
        />

        {isExpanded && (
          <div className="flex flex-1 items-center">
            <span className="flex-grow">
              <Typography
                level="base2sm"
                className="text-secondary opacity-80 select-none"
              >
                {user.fullname}
              </Typography>
              <br />
              <Typography
                level="captionr"
                className="text-tertiary opacity-45 select-none"
              >
                {`${user.address.slice(0, 12)}...${user.address.slice(-12)}`}
              </Typography>
            </span>
            <span className="p-1">
              <MoreIcon />
            </span>
          </div>
        )}
        {isMoreOptions && (
          <>
            <div className="absolute -top-[96px] right-0 z-50 mr-0.5 bg-neutral2-5 rounded-[32px] shadow-dropup border border-neutral1-20">
              <button
                onClick={() =>
                  router.push(`${paths.settings}?view=account-settings`)
                }
                className="h-12 z-50 flex p-2 items-center rounded-t-[32px] bg-neutral1-0 hover:bg-neutral1-5 backdrop-blur-16"
              >
                <SettingSlider />
              </button>
              <button
                onClick={handleLogout}
                className="h-12 z-50 flex p-2 items-center rounded-b-[32px] bg-neutral1-0 hover:bg-neutral1-5 backdrop-blur-16"
              >
                <Leave />
              </button>
            </div>
          </>
        )}
      </div>
      {isMoreOptions && (
        <div className="fixed inset-0 z-10" onClick={toggleMoreOptions}></div>
      )}
    </>
  );
}
