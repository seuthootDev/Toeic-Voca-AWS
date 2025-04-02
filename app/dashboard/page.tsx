"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, XCircle } from "lucide-react"

// 샘플 단어 데이터
const sampleWords = [
  {
    id: "1",
    english: "accomplish",
    korean: "성취하다, 완수하다",
    options: ["성취하다, 완수하다", "포기하다", "실패하다", "시도하다"],
  },
  { id: "2", english: "accurate", korean: "정확한", options: ["정확한", "부정확한", "모호한", "불분명한"] },
  { id: "3", english: "achieve", korean: "달성하다", options: ["달성하다", "실패하다", "시도하다", "포기하다"] },
  { id: "4", english: "acknowledge", korean: "인정하다", options: ["인정하다", "부정하다", "무시하다", "거부하다"] },
  { id: "5", english: "acquire", korean: "획득하다", options: ["획득하다", "잃다", "포기하다", "거절하다"] },
  { id: "6", english: "adapt", korean: "적응하다", options: ["적응하다", "거부하다", "저항하다", "반대하다"] },
  { id: "7", english: "adequate", korean: "적절한", options: ["적절한", "부적절한", "불충분한", "과도한"] },
  { id: "8", english: "adjust", korean: "조정하다", options: ["조정하다", "고정하다", "무시하다", "거부하다"] },
  { id: "9", english: "administration", korean: "행정, 관리", options: ["행정, 관리", "생산", "판매", "마케팅"] },
  { id: "10", english: "advance", korean: "발전, 진보", options: ["발전, 진보", "후퇴", "정체", "감소"] },
  { id: "11", english: "advantage", korean: "이점, 장점", options: ["이점, 장점", "단점", "불이익", "위험"] },
  { id: "12", english: "advertise", korean: "광고하다", options: ["광고하다", "숨기다", "무시하다", "거부하다"] },
  { id: "13", english: "advise", korean: "조언하다", options: ["조언하다", "명령하다", "강요하다", "비난하다"] },
  {
    id: "14",
    english: "affect",
    korean: "영향을 미치다",
    options: ["영향을 미치다", "무시하다", "피하다", "거부하다"],
  },
  { id: "15", english: "agreement", korean: "동의, 합의", options: ["동의, 합의", "불일치", "논쟁", "갈등"] },
]

interface Word {
  id: string
  english: string
  korean: string
  options: string[]
  isKnown?: boolean
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [words, setWords] = useState<Word[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([])

  useEffect(() => {
    // 로그인 상태 확인
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loggedIn)

    // 로컬 스토리지에서 단어 상태 불러오기
    const loadWords = () => {
      try {
        const savedWordsJSON = localStorage.getItem("toeicWords")

        if (savedWordsJSON) {
          // 저장된 단어 상태가 있으면 불러오기
          const savedWords = JSON.parse(savedWordsJSON)
          setWords(savedWords)
        } else {
          // 저장된 단어 상태가 없으면 샘플 데이터 사용
          setWords(sampleWords)
        }
      } catch (error) {
        console.error("Error loading words from localStorage:", error)
        setWords(sampleWords)
      }

      setLoading(false)
    }

    loadWords()
  }, [])

  // 현재 단어가 변경될 때마다 선택지 섞기
  useEffect(() => {
    if (words.length > 0 && currentWordIndex < words.length) {
      const options = [...words[currentWordIndex].options]
      // 선택지 섞기
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[options[i], options[j]] = [options[j], options[i]]
      }
      setShuffledOptions(options)
    }
  }, [words, currentWordIndex])

  // 단어 상태 저장
  const saveWordsToLocalStorage = (updatedWords: Word[]) => {
    try {
      localStorage.setItem("toeicWords", JSON.stringify(updatedWords))
    } catch (error) {
      console.error("Error saving words to localStorage:", error)
      toast({
        title: "저장 오류",
        description: "단어 상태를 저장하는데 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return // 이미 답변했으면 추가 선택 방지

    setSelectedOption(option)
    setIsAnswered(true)

    const currentWord = words[currentWordIndex]
    const isCorrectAnswer = option === currentWord.korean
    setIsCorrect(isCorrectAnswer)

    // 단어 상태 업데이트 (맞으면 아는 단어, 틀리면 모르는 단어)
    const updatedWords = [...words]
    updatedWords[currentWordIndex] = {
      ...updatedWords[currentWordIndex],
      isKnown: isCorrectAnswer,
    }

    setWords(updatedWords)
    saveWordsToLocalStorage(updatedWords)

    // 정답 여부에 따른 토스트 메시지
    if (isCorrectAnswer) {
      toast({
        title: "정답입니다!",
        description: `${currentWord.english}의 뜻은 ${currentWord.korean}입니다.`,
      })
    } else {
      toast({
        title: "오답입니다!",
        description: `${currentWord.english}의 뜻은 ${currentWord.korean}입니다.`,
        variant: "destructive",
      })
    }
  }

  const nextWord = () => {
    setSelectedOption(null)
    setIsAnswered(false)

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1)
      setProgress(((currentWordIndex + 1) / words.length) * 100)
    } else {
      // 모든 단어를 다 봤을 때
      toast({
        title: "학습 완료",
        description: "모든 단어를 학습했습니다!",
      })
      // 단어 섞기
      const shuffledWords = [...words].sort(() => Math.random() - 0.5)
      setWords(shuffledWords)
      saveWordsToLocalStorage(shuffledWords)
      setCurrentWordIndex(0)
      setProgress(0)
    }
  }

  const resetProgress = () => {
    // 모든 단어의 학습 상태 초기화
    const resetWords = words.map((word) => ({
      ...word,
      isKnown: undefined,
    }))

    setWords(resetWords)
    saveWordsToLocalStorage(resetWords)
    setCurrentWordIndex(0)
    setProgress(0)
    setSelectedOption(null)
    setIsAnswered(false)

    toast({
      title: "초기화 완료",
      description: "모든 단어의 학습 상태가 초기화되었습니다.",
    })
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
        <p className="text-primary-700">단어를 불러오는 중...</p>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-primary-100 p-4">
        <Card className="w-full max-w-md border-primary-200 shadow-lg">
          <CardHeader className="bg-primary text-white rounded-t-lg">
            <CardTitle>단어가 없습니다</CardTitle>
            <CardDescription className="text-primary-100">단어 데이터를 불러올 수 없습니다.</CardDescription>
          </CardHeader>
          <CardFooter className="bg-white p-4">
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-primary hover:bg-primary-700 touch-target"
            >
              홈으로 돌아가기
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentWord = words[currentWordIndex]

  // 반응형 디자인을 위한 수정
  // 카드 및 버튼 크기 조정, 모바일 레이아웃 최적화

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-100 p-3 md:p-4">
      <div className="w-full max-w-[95%] sm:max-w-md">
        {isLoggedIn && (
          <div className="mb-3 md:mb-4 flex justify-between items-center">
            <p className="text-xs md:text-sm text-primary-700">{localStorage.getItem("userEmail")} 님</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-primary hover:text-primary-700 h-8 text-xs md:text-sm px-2 touch-target"
            >
              로그아웃
            </Button>
          </div>
        )}

        <div className="mb-3 md:mb-4">
          <Progress value={progress} className="h-2 bg-primary-200" indicatorClassName="bg-primary" />
          <p className="mt-1 md:mt-2 text-right text-xs md:text-sm text-primary-700">
            {currentWordIndex + 1} / {words.length}
          </p>
        </div>

        <Card className="mb-3 md:mb-4 border-primary-200 shadow-lg overflow-hidden">
          <CardHeader className="bg-primary text-white p-3 md:p-4">
            <CardTitle className="text-center text-xl md:text-2xl">{currentWord.english}</CardTitle>
            <CardDescription className="text-center text-primary-100 text-xs md:text-sm">
              아래 보기 중 올바른 뜻을 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className="space-y-2 md:space-y-3">
              {shuffledOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  className={`w-full p-2 md:p-3 rounded-lg text-left transition-all text-sm md:text-base touch-target ${
                    isAnswered && option === currentWord.korean
                      ? "bg-green-100 border-2 border-green-500 text-green-700"
                      : isAnswered && option === selectedOption
                        ? "bg-red-100 border-2 border-red-500 text-red-700"
                        : "bg-white border-2 border-primary-200 hover:border-primary hover:bg-primary-50"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="flex-1">{option}</span>
                    {isAnswered && option === currentWord.korean && (
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                    )}
                    {isAnswered && option === selectedOption && option !== currentWord.korean && (
                      <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
          {isAnswered && (
            <CardFooter className="bg-primary-50 p-3 md:p-4 flex justify-center">
              <Button
                onClick={nextWord}
                className="bg-secondary hover:bg-secondary-600 text-white px-4 md:px-8 h-9 md:h-10 text-sm md:text-base touch-target"
              >
                다음 단어
              </Button>
            </CardFooter>
          )}
        </Card>

        <div className="flex flex-wrap md:flex-nowrap justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/stats")}
            className="border-primary text-primary hover:bg-primary-100 text-xs md:text-sm h-8 md:h-10 flex-1 touch-target"
          >
            학습 통계
          </Button>
          <Button
            variant="outline"
            onClick={resetProgress}
            className="border-secondary text-secondary hover:bg-secondary-100 text-xs md:text-sm h-8 md:h-10 flex-1 touch-target"
          >
            초기화
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/login")}
            className="border-primary text-primary hover:bg-primary-100 text-xs md:text-sm h-8 md:h-10 flex-1 touch-target"
          >
            종료하기
          </Button>
        </div>
      </div>
    </div>
  )
}

