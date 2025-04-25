import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import axios from 'axios';
import { useEffect } from 'react';
import { getPromotions } from '@/utils/helpers';
import Head from 'next/head';

// Configure Axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Run migrations for existing promotions data
  useEffect(() => {
    // Just calling getPromotions will trigger the migration if needed
    getPromotions();
  }, []);

  return (
    <>
      <Head>
        <title>PharmaPlus Admin Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Manage your pharmacy inventory, promotions, and sales with PharmaPlus Admin Dashboard" />
        <meta property="og:title" content="PharmaPlus Admin Dashboard" />
        <meta property="og:description" content="Complete pharmacy management solution" />
        <meta property="og:type" content="website" />
      </Head>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </>
  );
} 