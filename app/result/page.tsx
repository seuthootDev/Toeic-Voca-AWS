// app/result/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

interface ResultProps {
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  words: {
    english: string
    korean: string
    isCorrect: boolean
  }[]
}

export default function Result() {
  const router = useRouter()
  const [result, setResult] = useState<ResultProps | null>(null)
  const [userid, setUserid] = useState<string>("")

  useEffect(() => {
    // 사용자 정보 가져오기
    const storedUserid = localStorage.getItem("userid")
    if (storedUserid) {
      setUserid(storedUserid)
    }

    const updateLearningHistory = async (resultData: ResultProps) => {
      try {
        // 정답을 맞춘 단어들만 필터링
        const correctWords = resultData.words.filter(word => word.isCorrect)
        
        const response = await fetch('/api/update-learning', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // 쿠키 포함
          body: JSON.stringify({
            words: correctWords.map(word => ({
              english: word.english,
              korean: word.korean
            }))
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update learning history');
        }

        console.log('학습 이력이 성공적으로 저장되었습니다.');
      } catch (error) {
        console.error('학습 이력 저장 실패:', error);
        toast({
          title: "저장 실패",
          description: "학습 결과를 저장하는데 실패했습니다.",
          variant: "destructive",
        })
      }
    };

    // localStorage에서 결과 데이터 가져오기
    const resultData = localStorage.getItem("quizResult")
    if (resultData) {
      const parsedResult = JSON.parse(resultData)
      setResult(parsedResult)
      updateLearningHistory(parsedResult)
    }
  }, [])

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>결과를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const score = Math.round((result.correctAnswers / result.totalQuestions) * 100)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {userid && <div className="text-sm text-primary-600 mb-2">{userid}님의 학습 결과</div>}
            학습 결과
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{score}점</p>
            <p className="text-sm text-gray-500">
              총 {result.totalQuestions}문제 중 {result.correctAnswers}문제 정답
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">단어 목록</h3>
            {result.words.map((word, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  word.isCorrect ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <p className="font-medium">{word.english}</p>
                <p className="text-sm">{word.korean}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex-1"
            >
              다시 학습하기
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/stats")}
              className="flex-1"
            >
              학습통계
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}