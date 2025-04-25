import React from 'react';
import Head from 'next/head';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard | PharmaPlus Admin</title>
      </Head>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <p>Welcome to the PharmaPlus Admin Dashboard</p>
      </div>
    </>
  );
} 