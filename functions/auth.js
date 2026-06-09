export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_CLIENT_ID) {
    return missingConfig('GITHUB_CLIENT_ID');
  }

  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const scope = url.searchParams.get('scope') || 'repo';
  const redirectUri = `${url.origin}/callback`;
  const authUrl = new URL('https://github.com/login/oauth/authorize');

  authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
      'Set-Cookie': `cms_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
    }
  });
}

function missingConfig(name) {
  return new Response(`Missing Cloudflare Pages environment variable: ${name}`, {
    status: 500,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
