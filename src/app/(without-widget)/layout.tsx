'use client';

import ProtectedRoute from '@/components/protected-router';
import { PostProvider } from '@/context/post-context';
import { ProfileProvider } from '@/context/user-context';
import useBreakPoint from '@/hooks/use-breakpoint';
import BottomNavigationBar from '@/layouts/bottom-navigation-bar';
import Main from '@/layouts/main';
import Sidebar from '@/layouts/sidebar';
import { store } from '@/store/store';
import { fetcher } from '@/utils/axios';
import { getPersistor } from '@rematch/persist';
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { IoProvider } from 'socket.io-react-hook';
import { SWRConfig } from 'swr';
import { PersistGate } from 'redux-persist/lib/integration/react';

type Props = {
  children: React.ReactNode;
};

const persistor = getPersistor();

export default function MainLayout({ children }: Props) {
  const { breakpoint } = useBreakPoint();

  const isClient = typeof window !== 'undefined';
  const [isMouted, setIsMouted] = useState(false);

  const isSmallScreen = isClient && breakpoint === 'sm';

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
                      {isSmallScreen || <Sidebar className="bg-surface-3" />}
                      <Main>{children}</Main>
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
