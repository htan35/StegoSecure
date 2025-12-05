"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import lucide for icons (client-side only)
const LucideProvider = dynamic(() => import("@/components/lucide-provider"), { ssr: false })

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="spinner w-10 h-10"></div>
        <p className="text-slate-400 font-mono text-sm animate-pulse">CONNECTING TO SECURE SERVER...</p>
      </div>
    )
  }

  return <LucideProvider />
}
