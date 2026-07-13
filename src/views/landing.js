module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Papesel API</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #0f1115;
    color: #e6e6e6;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card { max-width: 480px; padding: 40px; text-align: center; }
  .badge {
    display: inline-block;
    background: #1f8a4c;
    color: #d7ffe4;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
    margin-bottom: 20px;
    letter-spacing: 0.5px;
  }
  h1 { font-size: 28px; margin-bottom: 10px; }
  p { color: #9a9a9a; font-size: 15px; line-height: 1.5; margin-bottom: 28px; }
  a.button {
    display: inline-block;
    background: #4c8bf5;
    color: white;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    transition: background 0.2s ease;
  }
  a.button:hover { background: #3a73d8; }
  .footer { margin-top: 30px; font-size: 12px; color: #555; }
</style>
</head>
<body>
  <div class="card">
    <span class="badge">● API LIVE</span>
    <h1>Papesel API</h1>
    <p>Backend for freelancers to manage client projects with built-in scope-creep protection — versioned, review-gated requirements so nothing gets silently changed.</p>
    <a class="button" href="/api-docs">View API Docs</a>
    <div class="footer">Built by Rahul</div>
  </div>
</body>
</html>
`;
