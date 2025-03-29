import {
  EventIcon,
  MarketplaceIcon,
  MessageIcon,
  NotificationIcon,
} from '@/components/icons';
import HomeIcon from '@/components/icons/home';
import Profile from '@/components/icons/profile';

//-----------------------------------------------------------------------------------------------

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: 'Home',
    Icon: <HomeIcon />,
    path: '/',
  },
  {
    title: 'Notifications',
    update: { status: true, count: 1 },
    Icon: <NotificationIcon />,
    path: '/notifications',
  },
  {
    title: 'My Profile',
    Icon: <Profile />,
    path: '/profile',
  },
  {
    title: 'Messages',
    Icon: <MessageIcon />,
    path: '/messages',
  },
  {
    title: 'Event',
    Icon: <EventIcon />,
    path: '/event',
  },
  {
    title: 'Marketplace',
    Icon: <MarketplaceIcon />,
    path: '/market',
  },
];

export type NavigationItem = {
  update?: { status: boolean; count: number };
  title: string;
  Icon: JSX.Element;
  path: string;
};
