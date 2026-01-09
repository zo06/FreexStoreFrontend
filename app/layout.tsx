import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout just passes through to [lang] layout
  // The [lang] layout handles html/body tags with proper lang/dir
  return children;
}
