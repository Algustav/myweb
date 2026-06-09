export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return missingConfig('GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET');
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = getCookie(request.headers.get('Cookie') || '', 'cms_oauth_state');

  if (!code || !state || !cookieState || state !== cookieState) {
    return new Response('Invalid OAuth state.', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Algustav-Decap-CMS'
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code
    })
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.access_token) {
    return new Response('GitHub OAuth token exchange failed.', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  const payload = JSON.stringify({ token: tokenData.access_token, provider: 'github' });
  const message = `authorization:github:success:${payload}`;
  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>GitHub 登录完成</title>
  </head>
  <body>
    <script>
      (function () {
        function receiveMessage(event) {
          window.opener.postMessage(${JSON.stringify(message)}, event.origin);
          window.removeEventListener('message', receiveMessage, false);
          window.close();
        }

        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': 'cms_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    }
  });
}

function getCookie(cookieHeader, name) {
  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function missingConfig(name) {
  return new Response(`Missing Cloudflare Pages environment variables: ${name}`, {
    status: 500,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
