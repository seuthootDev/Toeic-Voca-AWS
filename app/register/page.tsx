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
import { Toaster } from "@/components/ui/toaster"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    userid: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: formData.userid,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          variant: "default",
          title: "✅ 회원가입 성공!",
          description: "로그인 페이지로 이동합니다.",
          duration: 2000,
        })
        
        // 토스트 메시지가 표시된 후 이동하도록 시간 조정
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        toast({
          variant: "destructive",
          title: "❌ 회원가입 실패",
          description: data.message || "회원가입 중 문제가 발생했습니다.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ 오류 발생",
        description: error instanceof Error ? error.message : "회원가입 중 문제가 발생했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-primary-100 p-4">
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">TOEIC 단어장</h1>
          <p className="mt-2 text-sm md:text-base text-primary-700">효율적인 TOEIC 단어 학습을 위한 웹 애플리케이션</p>
        </div>

        <Card className="w-full max-w-[90%] sm:max-w-md border-primary-200 shadow-lg">
          <CardHeader className="space-y-1 bg-primary text-white rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-xl md:text-2xl font-bold text-center">회원가입</CardTitle>
            <CardDescription className="text-center text-primary-100 text-sm md:text-base">
              TOEIC 단어장 서비스를 이용하기 위한 계정을 만들어주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4" autoComplete="off">
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="userid" className="text-primary-700 text-sm md:text-base">
                  아이디
                </Label>
                <Input
                  id="userid"
                  name="userid"
                  placeholder="아이디를 입력하세요"
                  required
                  autoComplete="off"
                  value={formData.userid}
                  onChange={handleChange}
                  className="border-primary-200 focus:border-primary focus:ring-primary h-9 md:h-10 touch-target"
                />
              </div>
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="password" className="text-primary-700 text-sm md:text-base">
                  비밀번호
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border-primary-200 focus:border-primary focus:ring-primary h-9 md:h-10 touch-target"
                />
              </div>
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="confirmPassword" className="text-primary-700 text-sm md:text-base">
                  비밀번호 확인
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  required
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="border-primary-200 focus:border-primary focus:ring-primary h-9 md:h-10 touch-target"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-700 h-9 md:h-10 text-sm md:text-base touch-target"
                disabled={isLoading}
              >
                {isLoading ? "가입 중..." : "회원가입"}
              </Button>
            </form>
            <div className="mt-3 md:mt-4 text-center text-xs md:text-sm">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-primary hover:underline touch-target">
                로그인
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </>
  )
}

