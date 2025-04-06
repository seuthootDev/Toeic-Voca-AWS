import { MongoClient } from 'mongodb';
import { verify } from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const client = new MongoClient(uri);

    try {
      console.log('단어 데이터 요청 수신');
      
      let userid = null;
      let wordHistory = {};

      // 토큰이 있는 경우에만 사용자 학습 이력 가져오기
      const token = req.cookies.token;
      if (token) {
        try {
          const decoded = verify(token, process.env.JWT_SECRET);
          userid = decoded.userid;
          
          await client.connect();
          const db = client.db('voca');
          const user = await db.collection('users').findOne({ userid });
          wordHistory = user?.wordHistory || {};
        } catch (tokenError) {
          console.log('토큰 검증 실패:', tokenError.message);
          // 토큰이 유효하지 않아도 계속 진행
        }
      } else {
        console.log('토큰 없음: 기본 가중치로 진행');
      }

      await client.connect();
      const db = client.db('voca');
      
      // 모든 단어 가져오기
      const words = await db.collection('voca').find().toArray();
      console.log('단어 데이터 조회 완료:', words.length, '개');

      // 가중치 계산 함수
      const calculateWeight = (wordId) => {
        if (!userid) return 10; // 로그인하지 않은 경우 모든 단어의 가중치를 동일하게
        const history = wordHistory[wordId] || 0;
        if (history >= 3) return 1; // 3번 이상 맞춘 단어는 최저 가중치
        return 10 + (3 - history) * 5; // 덜 학습한 단어에 더 높은 가중치
      };

      // 가중치 기반으로 단어 선택
      const weightedWords = words.map(word => ({
        ...word,
        weight: calculateWeight(word._id.toString())
      }));

      // 가중치가 높은 단어들(덜 학습한 단어들) 먼저 필터링
      const availableWords = weightedWords.filter(word => word.weight > 1);

      // 학습할 단어가 부족한 경우를 대비해 기본 단어들도 포함
      const wordsToChooseFrom = availableWords.length >= 5 ? availableWords : weightedWords;

      // 랜덤하게 5개 선택
      const selectedWords = wordsToChooseFrom
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

      // 데이터 변환
      const formattedWords = selectedWords.map(word => ({
        id: word._id.toString(),
        english: word['단어'],
        korean: word['뜻'],
        weight: word.weight,
        correctCount: wordHistory[word._id.toString()] || 0,
        options: [word['뜻']]
      }));

      // 각 단어에 대해 다른 단어들의 한글 뜻을 옵션으로 추가
      formattedWords.forEach(word => {
        const otherKoreans = weightedWords
          .filter(w => w._id.toString() !== word.id)
          .map(w => w['뜻']);
        
        const randomOptions = otherKoreans
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        word.options = [word.korean, ...randomOptions]
          .sort(() => Math.random() - 0.5);
      });

      console.log('처리된 단어 수:', formattedWords.length);
      if (userid) {
        console.log('사용자별 가중치 적용됨');
      } else {
        console.log('기본 가중치 적용됨');
      }
      
      return res.status(200).json(formattedWords);
    } catch (error) {
      console.error('MongoDB 연결 오류:', error);
      return res.status(500).json({ 
        error: '서버 오류가 발생했습니다.',
        details: error.message 
      });
    } finally {
      await client.close();
      console.log('MongoDB 연결 종료');
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 