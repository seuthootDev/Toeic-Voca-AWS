# TOEIC 단어장

TOEIC 단어 학습을 위한 웹 애플리케이션입니다. <br>사용자별 학습 이력을 기반으로 효율적인 단어 학습을 제공합니다.<br>
본 저장소는 AWS S3 + CloudFront 배포용입니다.

Vercel 배포용 저장소 : https://github.com/seuthootDev/Toeic-Voca <br>
온 프레미스 배포용 저장소 : https://github.com/seuthootDev/Toeic-Voca-onprem

## 1. Next.js 설정

`next.config.mjs` 파일에 다음 설정을 추가합니다:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 정적 HTML 생성을 위한 설정
  images: {
    unoptimized: true,  // 정적 배포를 위한 이미지 최적화 비활성화
  },
  // 기타 설정들...
}

export default nextConfig
```

## 2. 프로젝트 빌드

다음 명령어로 정적 HTML 파일을 생성합니다:

```bash
npm run build
```

빌드가 완료되면 `out` 디렉토리에 정적 파일들이 생성됩니다.

## 3. AWS S3 버킷 설정

1. AWS S3 콘솔에서 새 버킷 생성
2. 버킷 이름 설정 (예: `mytoeicvocaawsbucket`)
3. 리전 선택 (예: `ap-northeast-2`)
4. 퍼블릭 액세스 설정:
   - "퍼블릭 액세스 차단" 설정 해제
   - 다음 옵션들 모두 체크 해제:
     - "새 퍼블릭 버킷 또는 액세스 포인트 정책을 통한 퍼블릭 액세스 차단"
     - "퍼블릭 버킷 또는 액세스 포인트 정책을 통한 퍼블릭 액세스 차단"
     - "새 퍼블릭 ACL을 통한 퍼블릭 액세스 차단"
     - "퍼블릭 ACL을 통한 퍼블릭 액세스 차단"

## 4. S3 버킷 정책 설정

버킷 정책에 다음 내용을 추가합니다:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::mytoeicvocaawsbucket/*"
        }
    ]
}
```

## 5. 정적 파일 업로드

`out` 디렉토리의 모든 파일을 S3 버킷의 루트에 업로드합니다:
- `out` 폴더 자체는 제외
- `out` 폴더 안의 모든 파일과 폴더를 선택하여 업로드

## 6. CloudFront 설정 (선택사항)

1. CloudFront 배포 생성
2. 원본 도메인으로 S3 버킷 선택
3. 기본 루트 객체를 `index.html`로 설정
4. CORS 설정 추가
5. 배포 완료 대기 (10-15분)

## 7. 접속 확인

- S3 정적 웹사이트 호스팅 URL로 접속
- 또는 [CloudFront 도메인](https://d3pjffpggdwuw9.cloudfront.net/)으로 접속 

## 주의사항

1. 정적 배포에서는 다음 기능들이 작동하지 않습니다:
   - 서버 사이드 렌더링 (SSR)
   - API 라우트
   - 동적 라우팅 (getServerSideProps)

2. 필요한 경우 API Gateway와 Lambda를 별도로 설정해야 합니다.

3. 환경 변수는 빌드 시점에 포함되어야 하므로, `.env.local` 파일에 필요한 변수들을 설정해야 합니다.
