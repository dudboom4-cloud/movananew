import React from 'react';
import { AdminConsolePage } from './components/AdminConsolePage';
import { CustomerPage } from './components/CustomerPage';
import { DeliveryPartnerPage } from './components/DeliveryPartnerPage';
import { FloatingUtilities } from './components/FloatingUtilities';
import { OnboardingFlow } from './components/OnboardingFlow';
import { StallOwnerPage } from './components/StallOwnerPage';
import { MovanaProvider, useMovana } from './context/MovanaContext';

function MovanaShell() {
  const { consentAccepted, showRolePicker, activeRole } = useMovana();

  const renderView = () => {
    if (!consentAccepted || showRolePicker) {
      return <OnboardingFlow />;
    }
    switch (activeRole) {
      case 'vendor':
        return <StallOwnerPage />;
      case 'delivery':
        return <DeliveryPartnerPage />;
      case 'admin':
        return <AdminConsolePage />;
      case 'customer':
      default:
        return <CustomerPage />;
    }
  };

  return (
    <>
      {renderView()}
      <FloatingUtilities />
    </>
  );
}

export default function App() {
  return (
    <MovanaProvider>
      <MovanaShell />
    </MovanaProvider>
  );
}
