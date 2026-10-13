import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "./components/navigation";

export const metadata: Metadata = {
  title: "Resource Reservation",
  description: "Manage shared resources and coordinate reservations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Navigation />
        <div className="app-workspace">
          <header className="workspace-bar">
            <span>
              Workspace <span className="bar-divider">/</span>{" "}
              <strong>Resource management</strong>
            </span>
            <span className="timezone-badge">◷ Sri Lanka · UTC+05:30</span>
          </header>
          {children}
          <footer className="workspace-footer">
            <span>A shared space. A clear schedule.</span>
            <span>All times in Sri Lanka time</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
