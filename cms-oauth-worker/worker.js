// Cloudflare Worker — GitHub OAuth provider for Decap CMS
// Lets /admin/ log in with GitHub when the site is NOT hosted on Netlify.
//
// Set these as Worker variables/secrets in the Cloudflare dashboard:
//   GITHUB_CLIENT_ID      (from your GitHub OAuth App)
//   GITHUB_CLIENT_SECRET  (from your GitHub OAuth App)  <-- mark as "Encrypt"
//
// Your GitHub OAuth App's "Authorization callback URL" must be:
//   https://<this-worker-subdomain>.workers.dev/callback

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    if (pathname === "/") {
      return new Response("Decap CMS GitHub OAuth provider is running.", { status: 200 });
    }

    // Step 1 — start the OAuth flow (Decap opens this).
    if (pathname === "/auth") {
      const authUrl = new URL("https://github.com/login/oauth/authorize");
      authUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", `${url.origin}/callback`);
      authUrl.searchParams.set("scope", "repo,user");
      authUrl.searchParams.set("state", crypto.randomUUID());
      return Response.redirect(authUrl.toString(), 302);
    }

    // Step 2 — GitHub sends the user back here with a code.
    if (pathname === "/callback") {
      const code = searchParams.get("code");
      if (!code) return new Response("Missing ?code", { status: 400 });

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const data = await tokenRes.json();
      const status = data.access_token ? "success" : "error";
      const content = data.access_token
        ? { token: data.access_token, provider: "github" }
        : { error: data.error || "no_token" };

      // Hand the token back to the Decap window via postMessage.
      const html = `<!doctype html><html><body><script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:${status}:${JSON.stringify(content)}',
      e.origin
    );
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script></body></html>`;
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    return new Response("Not found", { status: 404 });
  },
};
