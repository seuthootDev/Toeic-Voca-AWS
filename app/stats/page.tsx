"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, BarChart } from "lucide-react"

interface Stats {
  totalWords: number
  knownWords: number
  unknownWords: number
  completionRate: number
}

export default function StatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalWords: 0,
    knownWords: 0,
    unknownWords: 0,
    completionRate: 0,
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // 로그인 상태 확인
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loggedIn)

    // 로컬 스토리지에서 단어 상태 불러와서 통계 계산
    const calculateStats = () => {
      try {
        const savedWordsJSON = localStorage.getItem("toeicWords")

        if (savedWordsJSON) {
          const savedWords = JSON.parse(savedWordsJSON)

          const totalWords = savedWords.length
          const knownWords = savedWords.filter((word: any) => word.isKnown === true).length
          const unknownWords = savedWords.filter((word: any) => word.isKnown === false).length
          const completionRate = totalWords > 0 ? ((knownWords + unknownWords) / totalWords) * 100 : 0

          setStats({
            totalWords,
            knownWords,
            unknownWords,
            completionRate,
          })
        } else {
          // 저장된 단어가 없는 경우 기본값 사용
          setStats({
            totalWords: 15, // 샘플 단어 수
            knownWords: 0,
            unknownWords: 0,
            completionRate: 0,
          })
        }
      } catch (error) {
        console.error("Error calculating stats:", error)
        toast({
          title: "오류 발생",
          description: "통계를 계산하는데 실패했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    calculateStats()
  }, [])

  const resetAllProgress = () => {
    try {
      // 로컬 스토리지에서 단어 가져오기
      const savedWordsJSON = localStorage.getItem("toeicWords")

      if (savedWordsJSON) {
        const savedWords = JSON.parse(savedWordsJSON)

        // 모든 단어의 학습 상태 초기화
        const resetWords = savedWords.map((word: any) => ({
          ...word,
          isKnown: undefined,
        }))

        // 초기화된 단어 저장
        localStorage.setItem("toeicWords", JSON.stringify(resetWords))

        // 통계 초기화
        setStats({
          totalWords: resetWords.length,
          knownWords: 0,
          unknownWords: 0,
          completionRate: 0,
        })

        toast({
          title: "초기화 완료",
          description: "모든 단어의 학습 상태가 초기화되었습니다.",
        })
      }
    } catch (error) {
      console.error("Error resetting progress:", error)
      toast({
        title: "오류 발생",
        description: "학습 상태 초기화에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userEmail")
    setIsLoggedIn(false)
    toast({
      title: "로그아웃",
      description: "로그아웃 되었습니다.",
    })
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary-100">
        <p className="text-primary-700">통계를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-100 p-3 md:p-4">
      <Card className="w-full max-w-[95%] sm:max-w-md border-primary-200 shadow-lg overflow-hidden">
        <CardHeader className="bg-primary text-white p-3 md:p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 md:gap-2">
              <BarChart className="h-5 w-5 md:h-6 md:w-6" />
              <CardTitle className="text-xl md:text-2xl font-bold">학습 통계</CardTitle>
            </div>
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:text-primary-100 h-8 text-xs md:text-sm px-2 touch-target"
              >
                로그아웃
              </Button>
            )}
          </div>
          <CardDescription className="text-primary-100 text-xs md:text-sm mt-1">
            {isLoggedIn
              ? `${localStorage.getItem("userEmail")} 님의 TOEIC 단어 학습 현황`
              : "TOEIC 단어 학습 현황을 확인하세요"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6">
          <div>
            <div className="mb-1 md:mb-2 flex justify-between">
              <span className="text-primary-700 text-xs md:text-sm">전체 진행률</span>
              <span className="font-bold text-primary text-xs md:text-sm">{stats.completionRate.toFixed(1)}%</span>
            </div>
            <Progress
              value={stats.completionRate}
              className="h-2 md:h-3 bg-primary-200"
              indicatorClassName="bg-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <div className="rounded-lg bg-green-50 p-3 md:p-4 text-center border border-green-200 shadow-sm">
              <div className="flex justify-center mb-1 md:mb-2">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
              </div>
              <p className="text-xs md:text-sm text-green-700">아는 단어</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{stats.knownWords}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 md:p-4 text-center border border-red-200 shadow-sm">
              <div className="flex justify-center mb-1 md:mb-2">
                <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
              </div>
              <p className="text-xs md:text-sm text-red-700">모르는 단어</p>
              <p className="text-xl md:text-2xl font-bold text-red-600">{stats.unknownWords}</p>
            </div>
          </div>

          <div className="rounded-lg bg-primary-50 p-3 md:p-4 text-center border border-primary-200 shadow-sm">
            <p className="text-xs md:text-sm text-primary-700">전체 단어</p>
            <p className="text-xl md:text-2xl font-bold text-primary">{stats.totalWords}</p>
            <p className="text-[10px] md:text-xs text-primary-600 mt-1">
              학습 완료: {stats.knownWords + stats.unknownWords} / {stats.totalWords}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2 md:pt-4">
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-primary hover:bg-primary-700 text-white h-9 md:h-10 text-xs md:text-sm w-full sm:w-auto touch-target"
            >
              학습으로 돌아가기
            </Button>
            <Button
              onClick={resetAllProgress}
              className="bg-secondary hover:bg-secondary-700 text-white h-9 md:h-10 text-xs md:text-sm w-full sm:w-auto touch-target"
            >
              모든 진행 초기화
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

