import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import LayoutWrapper from "./component/LayoutWrapper";
import ToastProvider from "./component/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MyStore - Online Shopping",
  description: "E-Commerce store with best products",
};

function safeParseCookie(cookieValue) {
  if (!cookieValue) return [];
  try {
    return JSON.parse(cookieValue);
  } catch (e) {
    try {
      return JSON.parse(decodeURIComponent(cookieValue));
    } catch (err) {
      console.error("Failed to parse cookie value:", err);
      return [];
    }
  }
}

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart")?.value;
  const initialCart = safeParseCookie(cartCookie);

  const ordersCookie = cookieStore.get("orders")?.value;
  const initialOrders = safeParseCookie(ordersCookie);

  const wishlistCookie = cookieStore.get("wishlist")?.value;
  const initialWishlist = safeParseCookie(wishlistCookie);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
    >
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900" suppressHydrationWarning>
        <CartProvider
          initialCart={initialCart}
          initialOrders={initialOrders}
          initialWishlist={initialWishlist}
        >
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <ToastProvider />
        </CartProvider>
      </body>
    </html>
  );
}
