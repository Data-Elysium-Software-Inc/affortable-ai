import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { auth } from '../(auth)/auth';
import Script from 'next/script';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  
  const selectedModelId =
      models.find((model) => model.id === modelIdFromCookie)?.id ||
      DEFAULT_MODEL_NAME;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar user={session?.user} selectedModelId={selectedModelId} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
