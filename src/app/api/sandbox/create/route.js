import { dbConnect } from '@/lib/mongoose'
import Sandbox from '@/models/Sandbox'
import { sendErrorResponse } from '@/utils/sendErrorResponse'
import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { verifyToken } from '@/utils/verifyToken'

async function fetchRepoZip(repo) {
  const githubZipUrl = `https://api.github.com/repos/${repo}/zipball`;
  const response = await fetch(githubZipUrl, {
    headers: {
      'User-Agent': 'YourAppName',
      'Accept': 'application/vnd.github+json',
    },
    redirect: 'follow',
  });

  const contentType = response.headers.get('content-type');
  if (!response.ok || !contentType.includes('zip')) {
    const text = await response.text(); // helpful for debugging
    console.error('Unexpected GitHub response:', text.slice(0, 200));
    throw new Error(`Failed to fetch ZIP. Content-Type: ${contentType}`);
  }

  return await response.arrayBuffer();
}


async function unzipRepo(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const files = {};
  const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.html', '.md'];
  const binaryExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'];

  const getExtension = (filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts.pop().toLowerCase()}` : '';
  };

  await Promise.all(
    Object.keys(zip.files).map(async (filename) => {
      const file = zip.files[filename];
      if (!file.dir) {
        const shortName = filename.includes('/') ? filename.split('/').slice(1).join('/') : filename;
        const ext = getExtension(shortName);
        try {
          if (textExtensions.includes(ext)) {
            files[shortName] = await file.async('string');
          } else if (binaryExtensions.includes(ext)) {
            files[shortName] = await file.async('uint8array'); // preserve binary
          } else {
            files[shortName] = await file.async('string'); // fallback
          }
        } catch (err) {
          console.warn(`Failed to read file: ${shortName}`, err);
        }
      }
    })
  );

  console.log('Unzipped files:', Object.keys(files));
  return files;
}


async function rezipFiles(files) {
  const zip = new JSZip()
  for (const [filename, content] of Object.entries(files)) {
    zip.file(filename, content)
  }
  return await zip.generateAsync({ type: 'nodebuffer' }) // returns a Buffer
}

export async function POST(req) {
  try {
    const { github_url, name, description = '' } = await req.json()
    const payload = await verifyToken(req)
    if (!payload) {
      return Response.json({ message: 'Unauthorized' }, { status: 400 });
    }
     const userID = payload.userID;
    // Validate required fields
    if (!userID || !github_url || !name) {
      return sendErrorResponse({
        code: 'missing_fields',
        message: 'Missing required fields',
        status: 400,
      })
    }

    // e.g. https://github.com/user/repo.git  -> user/repo
    const repoMatch = github_url.match(/github\.com\/([^\/]+\/[^\/]+)(\.git)?/)
    const repo = repoMatch ? repoMatch[1] : github_url

    await dbConnect()

    // 1. Fetch repo ZIP from GitHub
    const repoZipBuffer = await fetchRepoZip(repo)

    // 2. Unzip to get files
    const files = await unzipRepo(repoZipBuffer)

    // 3. Rezip all files into compressed buffer for storage
    const zippedBuffer = await rezipFiles(files)
    try {
      // 4. Store Sandbox in DB including zipped buffer (use Buffer type for binary data)
      const sandbox = await Sandbox.create({
        userID,
        github_url,
        name,
        description,
        zipData: zippedBuffer, // make sure your Mongoose schema supports Buffer type for zipData
      })

      return NextResponse.json({ sandbox }, { status: 201 })
    } catch (err) {
      if (err.code === 11000) {
        return sendErrorResponse({
          code: 'duplicate_slug',
          message: 'A sandbox with this slug or name already exists.',
          status: 409,
        })
      }

      return sendErrorResponse({
        code: 'sandbox_creation_failed',
        message: err.message || 'Failed to create sandbox',
        status: 500,
      })
    }
  } catch (err) {
    console.error('[SANDBOX CREATE ERROR]', err)
    return sendErrorResponse({
      code: 'internal_error',
      message: err.message || 'Something went wrong',
      status: 500,
    })
  }
}
