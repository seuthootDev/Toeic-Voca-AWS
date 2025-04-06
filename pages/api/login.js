import { MongoClient } from 'mongodb';
import { sign } from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 환경 변수 확인
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined');
    return res.status(500).json({ message: '서버 설정 오류가 발생했습니다.' });
  }

  const { username, password } = req.body;

  try {
    const client = await MongoClient.connect(uri);
    const db = client.db('voca');
    const users = db.collection('users');

    const user = await users.findOne({ userid: username, password });

    if (!user) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    // JWT 토큰 생성 (환경 변수 사용)
    const token = sign(
      { 
        userid: user.userid,
        _id: user._id 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 쿠키 설정
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict`);

    client.close();
    return res.status(200).json({ 
      message: '로그인 성공',
      user: {
        userid: user.userid
      }
    });
  } catch (error) {
    console.error('로그인 에러:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}
