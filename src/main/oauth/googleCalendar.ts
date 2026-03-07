import { createServer } from 'http'
import { randomBytes, createHash } from 'crypto'
import { request as httpsRequest } from 'https'
import { shell } from 'electron'

const REDIRECT_PORT = 3456
const REDIRECT_PATH = '/callback'
const SCOPES = ['https://www.googleapis.com/auth/calendar.events.readonly']
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'

function generateCodeVerifier(): string {
  const bytes = randomBytes(32)
  return bytes.toString('base64url')
}

function sha256(buffer: Buffer): Buffer {
  return createHash('sha256').update(buffer).digest()
}

async function computeCodeChallenge(verifier: string): Promise<string> {
  const buf = Buffer.from(verifier, 'utf8')
  const hash = sha256(buf)
  return hash.toString('base64url')
}

export interface GoogleTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

function postTokenEndpoint(params: Record<string, string>): Promise<GoogleTokens> {
  const body = new URLSearchParams(params).toString()
  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      TOKEN_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body)
        }
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.error) {
              reject(new Error(json.error_description || json.error))
              return
            }
            resolve({
              access_token: json.access_token,
              refresh_token: json.refresh_token,
              expires_in: json.expires_in ?? 3600
            })
          } catch (e) {
            reject(e)
          }
        })
      }
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

export async function runGoogleCalendarOAuth(clientId: string): Promise<{ tokens: GoogleTokens; email: string }> {
  const redirectUri = `http://localhost:${REDIRECT_PORT}${REDIRECT_PATH}`
  const state = randomBytes(16).toString('hex')
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await computeCodeChallenge(codeVerifier)

  const code = await new Promise<string>((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url ?? '', `http://localhost:${REDIRECT_PORT}`)
      if (url.pathname !== REDIRECT_PATH) {
        res.writeHead(404).end()
        return
      }
      const stateParam = url.searchParams.get('state')
      const codeParam = url.searchParams.get('code')
      const errorParam = url.searchParams.get('error')
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      if (errorParam) {
        res.writeHead(200)
        res.end(
          '<html><body><p>Autorización denegada o error. Cierra esta ventana e intenta de nuevo.</p></body></html>'
        )
        server.close()
        reject(new Error(errorParam))
        return
      }
      if (stateParam !== state || !codeParam) {
        res.writeHead(200)
        res.end(
          '<html><body><p>Parámetros inválidos. Cierra esta ventana e intenta de nuevo.</p></body></html>'
        )
        server.close()
        reject(new Error('Invalid state or missing code'))
        return
      }
      res.writeHead(200)
      res.end(
        '<html><body><p>Conexión exitosa. Puedes cerrar esta ventana.</p></body></html>'
      )
      server.close()
      resolve(codeParam)
    })

    server.listen(REDIRECT_PORT, '127.0.0.1', () => {
      const authParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: SCOPES.join(' '),
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        access_type: 'offline',
        prompt: 'consent'
      })
      const url = `${AUTH_URL}?${authParams.toString()}`
      shell.openExternal(url)
    })
    server.on('error', reject)
  })

  const tokens = await postTokenEndpoint({
    client_id: clientId,
    code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: `http://localhost:${REDIRECT_PORT}${REDIRECT_PATH}`
  })

  const email = await fetchUserEmail(tokens.access_token)
  return { tokens, email }
}

async function fetchUserEmail(accessToken: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            resolve(json.email ?? '')
          } catch {
            resolve('')
          }
        })
      }
    )
    req.on('error', reject)
    req.end()
  })
}
