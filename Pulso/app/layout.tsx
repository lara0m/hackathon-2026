import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Pulso · Aprendizaje personalizado",
  description: "Herramienta de diagnóstico en tiempo real para docentes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#FAFAF9] text-[#1A1A18] min-h-screen`}>
        {children}
      </body>
    </html>
  );
}