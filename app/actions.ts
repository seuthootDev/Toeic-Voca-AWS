"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

// 로그인 함수
export async function login({ email, password }: { email: string; password: string }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "로그인 중 오류가 발생했습니다." }
  }
}

// 회원가입 함수
export async function register({ name, email, password }: { name: string; email: string; password: string }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    // 사용자 프로필 정보 저장
    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        name,
        email,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        // 프로필 생성 실패 시에도 계정은 생성되었으므로 성공으로 처리
      }
    }

    return { success: true, data: authData }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "회원가입 중 오류가 발생했습니다." }
  }
}

// 로그아웃 함수
export async function logout() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    await supabase.auth.signOut()
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: "로그아웃 중 오류가 발생했습니다." }
  }
}

// 사용자 단어 목록 가져오기
export async function getUserWords() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // 현재 로그인된 사용자 확인
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return { success: false, error: "인증되지 않은 사용자" }
    }

    const userId = session.user.id

    // 사용자의 단어 목록 가져오기
    const { data, error } = await supabase
      .from("user_words")
      .select(`
        id,
        is_known,
        words (
          id,
          english,
          korean
        )
      `)
      .eq("user_id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    // 데이터 형식 변환
    const formattedWords = data.map((item) => ({
      id: item.id,
      english: item.words.english,
      korean: item.words.korean,
      isKnown: item.is_known,
    }))

    return { success: true, data: formattedWords }
  } catch (error) {
    console.error("Get words error:", error)
    return { success: false, error: "단어 목록을 가져오는 중 오류가 발생했습니다." }
  }
}

// 단어 상태 업데이트
export async function updateWordStatus(wordId: string, isKnown: boolean) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // 현재 로그인된 사용자 확인
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return { success: false, error: "인증되지 않은 사용자" }
    }

    // 단어 상태 업데이트
    const { error } = await supabase.from("user_words").update({ is_known: isKnown }).eq("id", wordId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Update word status error:", error)
    return { success: false, error: "단어 상태 업데이트 중 오류가 발생했습니다." }
  }
}

// 사용자 학습 통계 가져오기
export async function getUserStats() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // 현재 로그인된 사용자 확인
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return { success: false, error: "인증되지 않은 사용자" }
    }

    const userId = session.user.id

    // 사용자의 단어 통계 가져오기
    const { data, error } = await supabase.from("user_words").select("is_known").eq("user_id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    const totalWords = data.length
    const knownWords = data.filter((word) => word.is_known).length
    const unknownWords = totalWords - knownWords
    const completionRate = totalWords > 0 ? (knownWords / totalWords) * 100 : 0

    return {
      success: true,
      data: {
        totalWords,
        knownWords,
        unknownWords,
        completionRate,
      },
    }
  } catch (error) {
    console.error("Get stats error:", error)
    return { success: false, error: "통계를 가져오는 중 오류가 발생했습니다." }
  }
}

