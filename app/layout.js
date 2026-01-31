import { Inter,Jersey_10} from "next/font/google";
import "./globals.css";
import {ThemeProvider}  from "@/components/theme-provider";
import AppHeader from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import { ConvexClientProvider } from "./ConvexClientProvider";
const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const GameFont = Jersey_10({
  subsets:["latin"],
  variable:"--font-game",
  weight:["400"]
})



export const metadata = {
  title: "Sens AI",
  description: "AI Career Coach",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
    appearance={{
      baseTheme:dark,
    }}>
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} `}
      >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
           <AppHeader/>
           <ConvexClientProvider>
            <main className="min-h-screen">{children}</main>
            </ConvexClientProvider>
            <Toaster richColors/>
            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p>Made with ❤️ by EducatedFools</p>
              </div>
            </footer>

          </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>  
  );
}
