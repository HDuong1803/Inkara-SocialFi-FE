'use client';

import React, { useEffect, useState } from 'react';

import ProtectedRoute from '@/components/protected-router';

import { PostProvider } from '@/context/post-context';
import { ProfileProvider } from '@/context/user-context';
import useBreakPoint from '@/hooks/use-breakpoint';
import { SWRConfig } from 'swr';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { getPersistor } from '@rematch/persist';
import { IoProvider } from 'socket.io-react-hook';
import { Provider } from 'react-redux';

import BottomNavigationBar from '@/layouts/bottom-navigation-bar';
import Main from '@/layouts/main';
import Sidebar from '@/layouts/sidebar';
import SidebarRight from '@/layouts/sidebar-right';

import eventBus from '@/utils/event-emitter';
import { fetcher } from '@/utils/axios';
import { store } from '@/store/store';

//-----------------------------------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

const persistor = getPersistor();

export default function MainLayout({ children }: Props) {
  const { breakpoint } = useBreakPoint();
  const [showSidebarRight, setShowSidebarRight] = useState(true);
  const isClient = typeof window !== 'undefined';
  const [isMouted, setIsMouted] = useState(false);

  useEffect(() => {
    const handleToggleSidebarRight = (isViewFull: boolean) => {
      setShowSidebarRight(!isViewFull);
    };

    eventBus.on('toggleSidebarRight', handleToggleSidebarRight);

    return () => {
      eventBus.off('toggleSidebarRight', handleToggleSidebarRight);
    };
  }, []);

  const isSmallScreen = isClient && breakpoint === 'sm';
  const isLargeScreen =
    isClient &&
    (breakpoint === 'lg' ||
      breakpoint === 'xl' ||
      breakpoint === '2xl' ||
      breakpoint === '3xl');

  React.useEffect(() => {
    setIsMouted(true);
  }, []);

  return (
    <ProtectedRoute>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <IoProvider>
            <SWRConfig
              value={{
                fetcher,
                dedupingInterval: 5000,
              }}
            >
              <ProfileProvider>
                  <PostProvider>
                    {isMouted && (
                      <div className="h-screen w-screen bg-cushion block md:flex relative">
                        {isSmallScreen || <Sidebar />}
                        <Main className="bg-surface">{children}</Main>
                        {isLargeScreen && showSidebarRight && <SidebarRight />}
                        {isSmallScreen && <BottomNavigationBar />}
                      </div>
                    )}
                  </PostProvider>
              </ProfileProvider>
            </SWRConfig>
          </IoProvider>
        </PersistGate>
      </Provider>
    </ProtectedRoute>
  );
}
