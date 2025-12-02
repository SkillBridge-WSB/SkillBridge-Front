// Mobile version - just returns children since mobile uses expo-router tabs
export function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}


