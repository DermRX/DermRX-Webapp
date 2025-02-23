import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="text-2xl font-bold text-primary">MelanomaAI</a>
          </Link>
          <nav className="flex gap-4">
            <Link href="/">
              <a className="text-sm font-medium hover:text-primary">Home</a>
            </Link>
            <Link href="/analysis">
              <a className="text-sm font-medium hover:text-primary">New Analysis</a>
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
