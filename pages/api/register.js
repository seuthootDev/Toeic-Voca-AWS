import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userid, password } = req.body;

  // 입력값 검증
  if (!userid || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 모두 입력해주세요.' });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('voca');
    const users = db.collection('users');

    // 아이디 중복 검사
    const existingUser = await users.findOne({ userid });
    if (existingUser) {
      return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
    }

    // 새 사용자 생성
    const result = await users.insertOne({
      userid,
      password,
      wordHistory: {},  // 학습 이력을 저장할 빈 객체
      createdAt: new Date(),
      lastLogin: null
    });

    return res.status(201).json({ 
      message: '회원가입이 완료되었습니다.',
      userId: result.insertedId 
    });

  } catch (error) {
    console.error('회원가입 에러:', error);
    return res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message 
    });
  } finally {
    await client.close();
  }
} 