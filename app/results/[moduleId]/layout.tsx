import { getContentPack } from '@/lib/contentLoader'

// Required for static export - generates all module pages at build time
export function generateStaticParams() {
  const pack = getContentPack()
  return pack.modules.map((module) => ({
    moduleId: module.id,
  }))
}

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
