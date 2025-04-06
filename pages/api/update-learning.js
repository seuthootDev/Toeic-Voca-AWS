import { MongoClient } from 'mongodb';
import { verify } from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    const { words } = req.body;
    
    const client = await MongoClient.connect(uri);
    const db = client.db('voca');
    const users = db.collection('users');

    // 사용자 찾기
    const user = await users.findOne({ userid });
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 단어 학습 이력 업데이트
    const wordHistory = user.wordHistory || {};
    
    // 각 단어에 대해 학습 횟수 증가
    for (const word of words) {
      // 단어 자체를 키로 사용
      wordHistory[word.english] = (wordHistory[word.english] || 0) + 1;
    }

    // 사용자 문서 업데이트
    await users.updateOne(
      { userid },
      { 
        $set: { 
          wordHistory,
          lastUpdated: new Date()
        }
      }
    );

    client.close();
    return res.status(200).json({ 
      message: '학습 이력이 업데이트되었습니다.',
      updatedWords: words.length
    });

  } catch (error) {
    console.error('학습 이력 업데이트 에러:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message 
    });
  }
} 