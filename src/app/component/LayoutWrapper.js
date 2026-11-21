"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();

    const hideLayout =
        pathname === "/" ||
        pathname === "/welcome" ||
        pathname === "/registration" ||
        pathname === "/register" ||
        pathname === "/login" ||
        pathname === "/changepassword" ||
        pathname === "/profile" ||
        pathname.startsWith("/admin");

    return (
        <div className="flex flex-col min-h-screen">
            {!hideLayout && <Navbar />}

            <main className="flex-1">
                {children}
            </main>

            {!hideLayout && <Footer />}
        </div>
    );
}