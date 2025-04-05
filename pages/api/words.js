import { MongoClient } from 'mongodb';
import { verify } from 'jsonwebtoken';

const uri = "mongodb+srv://seuthootdev:1234@cluster0.8vhcqdt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
        return Math.max(1, 10 - Math.floor(history));
      };

      // 가중치 기반으로 단어 선택
      const weightedWords = words.map(word => ({
        ...word,
        weight: calculateWeight(word._id.toString())
      }));

      // 가중치에 따라 단어 정렬
      weightedWords.sort((a, b) => b.weight - a.weight);

      // 상위 50개 단어 선택
      const selectedWords = weightedWords.slice(0, 5);
      
      // 선택된 단어들 랜덤 섞기
      const shuffledWords = selectedWords.sort(() => Math.random() - 0.5);

      // 데이터 변환
      const formattedWords = shuffledWords.map(word => ({
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