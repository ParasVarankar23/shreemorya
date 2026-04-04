import "./globals.css";
import { Poppins, Kaushan_Script } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const kaushan = Kaushan_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-kaushan",
});

export const metadata = {
  title: "Morya Travels",
  description: "Morya Travels Booking Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${kaushan.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}