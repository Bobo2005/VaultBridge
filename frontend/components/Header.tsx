import Link from "next/link";

interface HeaderProps {
  activeTab?: string;
  mode?: string;
}

export default function Header({ activeTab, mode }: HeaderProps) {
  return (
    <header className="border-b border-border pb-4 mb-8">
      <nav className="flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <span className="text-xl font-bold">VaultBridge</span>
        </Link>
        <div className="hidden md:flex space-x-6">
          <Link 
            href="/how-it-works"
            className={`text-ink hover:text-ink-secondary transition-colors ${
              activeTab === "how-it-works" ? "font-semibold text-ink" : ""
            }`}
          >
            How It Works
          </Link>
          <Link 
            href="/invoices"
            className={`text-ink hover:text-ink-secondary transition-colors ${
              activeTab === "invoices" ? "font-semibold text-ink" : ""
            }`}
          >
            Invoices
          </Link>
          <Link 
            href="/loans"
            className={`text-ink hover:text-ink-secondary transition-colors ${
              activeTab === "loans" ? "font-semibold text-ink" : ""
            }`}
          >
            Loans
          </Link>
          <Link 
            href="/faq"
            className={`text-ink hover:text-ink-secondary transition-colors ${
              activeTab === "faq" ? "font-semibold text-ink" : ""
            }`}
          >
            FAQ
          </Link>
        </div>
      </nav>
    </header>
  );
}
