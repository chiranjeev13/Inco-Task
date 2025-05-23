import localFont from "next/font/local";
import "./globals.css";
import { Web3Provider } from "../provider/web3-provider";
import { WealthProvider } from "../provider/WealthProvider";
import { Background } from "../components/Background";
import { ReactNode } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
export const metadata = {
  title: "PrivateWealth | Secure Encrypted Wealth Management",
  description:
    "Encrypt, submit, and compare your wealth data with full privacy and security using blockchain technology",
  keywords:
    "blockchain, privacy, encryption, wealth management, crypto, secure",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-dark text-white min-h-screen">
        <Web3Provider initialState={undefined}>
          <WealthProvider>
            <div className="relative min-h-screen flex flex-col">
              <Background />
              {/* Main Content */}
              <main className="relative flex-grow z-10">{children}</main>
            </div>
          </WealthProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
