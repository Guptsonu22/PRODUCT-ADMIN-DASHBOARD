import { AuthGuard } from '@/components/auth/AuthGuard';
import { Header } from '@/components/common/Header';

// All /products routes share auth protection + header here,
// so individual pages don't repeat guard logic.
export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </AuthGuard>
  );
}
