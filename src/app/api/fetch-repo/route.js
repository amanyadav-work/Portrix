// app/api/fetch-repo/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const repo = searchParams.get('repo'); // Format: user/repo

  if (!repo) {
    return new Response('Missing repo param', { status: 400 });
  }

  const githubZipUrl = `https://api.github.com/repos/${repo}/zipball`;

  try {
    const response = await fetch(githubZipUrl, {
      headers: {
        'User-Agent': 'YourAppName', // GitHub requires a user-agent
        'Accept': 'application/vnd.github+json'
      },
      redirect: 'follow',
    });

    console.log("Response:::",response,githubZipUrl)
    if (!response.ok) {
      return new Response('Failed to fetch zip', { status: 500 });
    }

    const zipBuffer = await response.arrayBuffer();

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Access-Control-Allow-Origin': '*', // optional
      },
    });
  } catch (err) {
      console.log("Error fetching zip:", err);

    return new Response('Error fetching zip', { status: 500 });
  }
}

