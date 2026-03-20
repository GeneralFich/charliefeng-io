import localFont from 'next/font/local';

// Use system font stacks as fallbacks when Google Fonts are unavailable.
// In production on Vercel, next/font/google will fetch the actual fonts.
// For local dev without network, we use CSS font-face declarations in globals.css.

export const inter = {
  variable: '--font-inter',
};

export const jetbrainsMono = {
  variable: '--font-jetbrains-mono',
};

export const geistSans = {
  variable: '--font-geist-sans',
};
