"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, BookOpen, BarChart } from "lucide-react"

interface Stats {
  totalWords: number
  learningWords: number
  wellKnownWords: number
  learningInProgress: number
  completionRate: number
  masteryRate: number
  wordHistory: Record<string, number>
}

export default function StatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalWords: 0,
    learningWords: 0,
    wellKnownWords: 0,
    learningInProgress: 0,
    completionRate: 0,
    masteryRate: 0,
    wordHistory: {}
  })
  const [userid, setUserid] = useState("")

  useEffect(() => {
    const storedUserid = localStorage.getItem("userid")
    if (storedUserid) {
      setUserid(storedUserid)
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/get-stats', {
          credentials: 'include'  // 쿠키 포함
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          title: "오류 발생",
          description: "통계를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    // JWT 토큰 쿠키 삭제
    document.cookie = "auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem("userid");
    router.push("/login");
    toast({
      title: "로그아웃",
      description: "로그아웃 되었습니다.",
    });
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:text-primary-100 h-8 text-xs md:text-sm px-2 touch-target"
            >
              로그아웃
            </Button>
          </div>
          <CardDescription className="text-primary-100 text-xs md:text-sm mt-1">
            {userid} 님의 TOEIC 단어 학습 현황
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6">
          <div>
            <div className="mb-1 md:mb-2 flex justify-between">
              <span className="text-primary-700 text-xs md:text-sm">전체 학습 진행률</span>
              <span className="font-bold text-primary text-xs md:text-sm">
                {stats.completionRate.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={stats.completionRate}
              className="h-2 md:h-3 bg-primary-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <div className="rounded-lg bg-green-50 p-3 md:p-4 text-center border border-green-200 shadow-sm">
              <div className="flex justify-center mb-1 md:mb-2">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
              </div>
              <p className="text-xs md:text-sm text-green-700">잘 아는 단어</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">
                {stats.wellKnownWords}
              </p>
              <p className="text-[10px] md:text-xs text-green-600 mt-1">
                {stats.masteryRate.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 md:p-4 text-center border border-yellow-200 shadow-sm">
              <div className="flex justify-center mb-1 md:mb-2">
                <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
              </div>
              <p className="text-xs md:text-sm text-yellow-700">학습 중</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-600">
                {stats.learningInProgress}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-primary-50 p-3 md:p-4 text-center border border-primary-200 shadow-sm">
            <p className="text-xs md:text-sm text-primary-700">전체 단어</p>
            <p className="text-xl md:text-2xl font-bold text-primary">{stats.totalWords}</p>
            <p className="text-[10px] md:text-xs text-primary-600 mt-1">
              학습 시작: {stats.learningWords} / {stats.totalWords}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2 md:pt-4">
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-primary hover:bg-primary-700 text-white h-9 md:h-10 text-xs md:text-sm w-full sm:w-auto touch-target"
            >
              학습으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

