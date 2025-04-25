import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import axios from 'axios';

// Configure Axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
} 