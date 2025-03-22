'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import ThemeProvider from '../theme/ThemeProvider';
import AuthProvider from './AuthProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
} 