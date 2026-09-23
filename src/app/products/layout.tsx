import { AuthGuard } from '@/components/auth/AuthGuard';
import { Header } from '@/components/common/Header';
import { ProductMutationProvider } from '@/context/ProductMutationContext';

// All /products routes share auth protection + header here,
// so individual pages don't repeat guard logic. The mutation provider
// keeps add/edit/delete overlays visible across list/details/edit pages
// for the current session (in-memory; a refresh clears it).
export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Header />
      <ProductMutationProvider>
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </ProductMutationProvider>
    </AuthGuard>
  );
}
