import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import { ReduxProvider } from "@/providers/redux-provider";
import QueryProvider from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { DropboxProvider } from "@/providers/dropbox-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RootLayout({ children }: any) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-background">
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <DropboxProvider>
                <ReduxProvider>
                  {children}

                  <Toaster />
                  {/* Floating theme toggle button */}
                  <div className="fixed top-6 right-6 z-50">
                    <ThemeToggle />
                  </div>
                </ReduxProvider>
              </DropboxProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
