import React from 'react';
import { RootLayout } from './layouts/RootLayout';
import { DashboardPage } from './pages/DashboardPage';
import { HidePage } from './pages/HidePage';
import { ExtractPage } from './pages/ExtractPage';
import { ScannerPage } from './pages/ScannerPage';
import { ChatPage } from './pages/ChatPage';
import { SettingsPage } from './pages/SettingsPage';
import { DeniablePage } from './pages/DeniablePage';

export default function App() {
  const [activePage, setActivePage] = React.useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onPageChange={setActivePage} />;
      case 'hide':
        return <HidePage />;
      case 'extract':
        return <ExtractPage />;
      case 'scanner':
        return <ScannerPage />;
      case 'chat':
        return <ChatPage />;
      case 'settings':
        return <SettingsPage />;
      case 'deniable':
        return <DeniablePage />;
      default:
        return <DashboardPage onPageChange={setActivePage} />;
    }
  };

  return (
    <RootLayout activePage={activePage} onPageChange={setActivePage}>
      {renderPage()}
    </RootLayout>
  );
}
