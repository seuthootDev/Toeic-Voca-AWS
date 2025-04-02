"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 실제 로그인 로직 대신 성공 메시지 표시 후 대시보드로 이동
      toast({
        title: "로그인 성공",
        description: "단어 학습 페이지로 이동합니다.",
      })

      // 로그인 상태 로컬 스토리지에 저장 (실제 인증 대신 임시 방법)
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userEmail", formData.email)

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "로그인 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 로그인 없이 바로 대시보드로 이동하는 함수
  const skipLogin = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-100 p-4">
      <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">TOEIC 단어장</h1>
        <p className="mt-2 text-sm md:text-base text-primary-700">효율적인 TOEIC 단어 학습을 위한 웹 애플리케이션</p>
      </div>

      <Card className="w-full max-w-[90%] sm:max-w-md border-primary-200 shadow-lg">
        <CardHeader className="space-y-1 bg-primary text-white rounded-t-lg p-4 md:p-6">
          <CardTitle className="text-xl md:text-2xl font-bold text-center">로그인</CardTitle>
          <CardDescription className="text-center text-primary-100 text-sm md:text-base">
            TOEIC 단어장 서비스를 이용하기 위해 로그인해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="space-y-1 md:space-y-2">
              <Label htmlFor="email" className="text-primary-700 text-sm md:text-base">
                이메일
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="border-primary-200 focus:border-primary focus:ring-primary h-9 md:h-10 touch-target"
              />
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-primary-700 text-sm md:text-base">
                  비밀번호
                </Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-xs md:text-sm text-primary hover:underline"
                >
                  비밀번호 찾기
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="border-primary-200 focus:border-primary focus:ring-primary h-9 md:h-10 touch-target"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-700 h-9 md:h-10 text-sm md:text-base touch-target"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
          <div className="mt-3 md:mt-4 text-center">
            <Button
              variant="link"
              onClick={skipLogin}
              className="text-secondary hover:text-secondary-700 text-sm md:text-base p-0 h-auto touch-target"
            >
              로그인 없이 계속하기
            </Button>
          </div>
          <div className="mt-3 md:mt-4 text-center text-xs md:text-sm">
            계정이 없으신가요?{" "}
            <Link href="/register" className="text-primary hover:underline touch-target">
              회원가입
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

