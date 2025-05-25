/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Image from 'next/image';
import Web3 from 'web3';
import { login, register } from '@/apis/auth';
import { useAuth } from '@/context/auth-context';

import { Button } from '@/components/button';
import { LogoSVG, GoogleSVG } from '@/components/icons';
import { Typography } from '@/components/typography';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/alert-dialog';

import styled from '@/styles/auth.module.css';
import { ConnectWalletClient } from '@/apis/configs/client';

//----------------------------------------------------------------------


export default function LoginView() {
  const { setToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMetaMaskLogin = async () => {
    setLoading(true);
    let web3: Web3 | null = null;
    if (typeof window !== 'undefined' && window.ethereum) {
      web3 = new Web3(window.ethereum);
    } else {
      throw new Error('Web3 is not initialized');
    }

    const walletClient = await ConnectWalletClient();
    // Retrieve the wallet address using the Wallet Client
    const [address] = await walletClient.requestAddresses();
    try {
      const { data: nonce } = await register({ address: address.toLowerCase() });
      const messageHash = web3.utils.soliditySha3(
        address,
        nonce.toString()
      ) as string;
      const signature = await new Promise<string>((resolve, reject) => {
        if (window.ethereum) {
          window.ethereum
            .request({
              method: 'personal_sign',
              params: [messageHash, address],
            })
            .then((sig) => {
              if (typeof sig === 'string') {
                resolve(sig);
              } else {
                reject(new Error('Signature is not a string'));
              }
            })
            .catch((err: any) => reject(err));
        } else {
          reject(new Error('Ethereum provider is not available'));
        }
      });

      const response = await login({ address: address.toLowerCase(), signature });
      setToken(response.accessToken);
      router.push('/');
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-auth w-full h-svh flex justify-center items-center">
        <div id="stars" className={styled.stars}></div>
        <div className="w-full p-[2.5rem] relative mx-auto md:max-w-[25.5rem] md:before:content-[''] md:before:absolute md:before:inset-0 md:before:rounded-button md:before:pointer-events-none md:before:border-[0.75rem] md:before:border-[#f7f7f780] md:before:opacity-[0.29] md:before:blur-[20px] md:before:bg-auth-form md:after:bg-[#363638] md:after:shadow-auth-card md:after:backdrop:blur-[50px] md:after:content-[''] md:after:absolute md:after:inset-0 md:after:rounded-button md:after:pointer-events-none">
          <div className="relative z-[2]">
            <div className="flex flex-col mb-[2.5rem] items-center gap-6">
              <LogoSVG className="object-contain w-[150px]" />

              <Typography level="h4" className="text-primary">
                Sign in to Social
              </Typography>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                className="w-full px-[2rem] py-[0.875rem]"
                onClick={handleMetaMaskLogin}
                disabled={loading}
                child={
                  <div className="flex items-center gap-3 justify-center">
                    {loading ? (
                      <div
                        className="w-5 h-5 border-t-2 border-b-2 border-primary rounded-full animate-spin"
                        style={{
                          borderTopColor: '#f7f7f7',
                          borderBottomColor: '#f7f7f7',
                        }}
                      ></div>
                    ) : (
                      <>
                        <Image
                          src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                          alt="MetaMask Fox"
                          width={25}
                          height={25}
                        />
                        <Typography level="base2sm" className="text-secondary">
                          Sign in with MetaMask
                        </Typography>
                      </>
                    )}
                  </div>
                }
              />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    className="w-full px-[2rem] py-[0.875rem]"
                    child={
                      <div className="flex items-center gap-3 justify-center">
                        <GoogleSVG className="w-5 h-5" />
                        <Typography level="base2sm" className="text-secondary">
                          Sign in with Google
                        </Typography>
                      </div>
                    }
                  />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Notification</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogDescription>
                    Hiện tại tính năng này chưa được hỗ trợ
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Đóng</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
