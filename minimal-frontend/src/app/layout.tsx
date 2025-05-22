import localFont from "next/font/local";
import "./globals.css";
import { Web3Provider } from "../provider/web3-provider";
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
  description: "Encrypt, submit, and compare your wealth data with full privacy and security using blockchain technology",
  keywords: "blockchain, privacy, encryption, wealth management, crypto, secure",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-dark text-white`}
      >
        <Web3Provider initialState={undefined}>
          <div className="relative min-h-screen overflow-hidden">
            {/* Background particles effect */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            
            {/* Animated gradient background */}
            <div className="fixed inset-0 animated-gradient opacity-10" />
            
            {/* Glowing orbs */}
            <div className="fixed -top-20 -left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl opacity-20 animate-pulse-slow" />
            <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl opacity-20 animate-pulse-slow" />
            
            {/* Main content */}
            <div className="relative">
              {children}
            </div>
            
            {/* Footer */}
            <footer className="relative mt-20 py-6 text-center text-gray-400 text-sm">
              <div className="container mx-auto">
                <p>PrivateWealth Protocol &copy; {new Date().getFullYear()} | Powered by Encrypted Blockchain Technology</p>
              </div>
            </footer>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
} 