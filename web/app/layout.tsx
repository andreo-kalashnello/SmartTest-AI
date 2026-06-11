import React from 'react';
import RootLayout from '../src/app/layout';

// Re-export project's root layout so Next's app/ folder has a root layout.
export default function AppLayout(props: any) {
  // `RootLayout` expects { children }, forward everything.
  return <RootLayout {...props} />;
}
