import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import { CeremonyProvider } from './context/CeremonyContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import CeremonyPlanDrawer from './components/CeremonyPlanDrawer';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'AdhyatmaGO | Sacred Ceremony Planning',
  description: 'Find verified priests, temples, and function halls for your ceremonies.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <CeremonyProvider>
            <Header />
            <main>{children}</main>
            <CeremonyPlanDrawer />
          </CeremonyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

