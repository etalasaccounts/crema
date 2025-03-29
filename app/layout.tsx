import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { UserProvider } from "@/providers/user-provider";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: any) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans ]">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {" "}
          <UserProvider>
            {children}
            <Toaster />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
