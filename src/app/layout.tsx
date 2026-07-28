import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Improve your skills",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
