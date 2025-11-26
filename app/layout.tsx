import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BillMate - Tu sistema de pagos proactivo",
  description: "Sistema operativo financiero personal que unifica tus obligaciones de pago",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
