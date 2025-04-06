import { MongoClient } from 'mongodb';
import { verify } from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 토큰 확인
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  try {
    // 토큰 검증
    const decoded = verify(token, process.env.JWT_SECRET);
    const userid = decoded.userid;

    const client = await MongoClient.connect(uri);
    const db = client.db('voca');
    
    // 전체 단어 수 가져오기
    const totalWords = await db.collection('voca').countDocuments();
    
    // 사용자의 학습 이력 가져오기
    const user = await db.collection('users').findOne({ userid });
    const wordHistory = user?.wordHistory || {};

    // 통계 계산
    const learningWords = Object.keys(wordHistory).length; // 학습 시작한 단어 수
    const wellKnownWords = Object.values(wordHistory).filter(count => count >= 3).length; // 3번 이상 맞춘 단어
    const learningInProgress = learningWords - wellKnownWords; // 학습 중인 단어 (잘 모르는 단어)
    
    // 비율 계산
    const completionRate = (learningWords / totalWords) * 100; // 전체 진행률
    const masteryRate = (wellKnownWords / totalWords) * 100; // 숙달률

    client.close();

    return res.status(200).json({
      totalWords,
      learningWords,
      wellKnownWords,
      learningInProgress,
      completionRate,
      masteryRate,
      wordHistory
    });

  } catch (error) {
    console.error('통계 조회 에러:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message 
    });
  }
} 