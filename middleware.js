// Vercel Edge Middleware: 全リクエストにBasic認証をかける。
// 認証情報は Vercel の環境変数で設定する:
//   BASIC_AUTH_USER     … ユーザー名
//   BASIC_AUTH_PASSWORD … パスワード
export const config = {
  matcher: "/(.*)",
};

export default function middleware(request) {
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPassword = process.env.BASIC_AUTH_PASSWORD;

  // 環境変数が未設定なら認証をかけない（ローカルプレビュー等での事故防止）
  if (!expectedUser || !expectedPassword) {
    return;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const colonIdx = decoded.indexOf(":");
      const user = decoded.slice(0, colonIdx);
      const password = decoded.slice(colonIdx + 1);
      if (user === expectedUser && password === expectedPassword) {
        return;
      }
    }
  }

  return new Response("認証が必要です", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="saiyou-kanri"',
    },
  });
}
