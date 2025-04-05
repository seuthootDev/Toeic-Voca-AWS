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
    username: "",
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
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      toast({
        title: "로그인 성공",
        description: "단어 학습 페이지로 이동합니다.",
      })

      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userid", data.user.userid)

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "로그인 실패",
        description: error instanceof Error ? error.message : "로그인 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
              <Label htmlFor="username" className="text-primary-700 text-sm md:text-base">
                아이디
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="사용자 아이디"
                required
                value={formData.username}
                onChange={handleChange}
                className="border-primary-200 focus:border-primary focus:ring-primary h-9 md:h-10 touch-target"
              />
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-primary-700 text-sm md:text-base">
                  비밀번호
                </Label>
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

