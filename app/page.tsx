"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // 기본 페이지에서 로그인 페이지로 리다이렉트
    router.push("/login")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-100">
      <p className="text-primary-700">페이지로 이동 중...</p>
    </div>
  )
}

