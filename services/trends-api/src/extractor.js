import https from 'node:https';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

export class ArticleError extends Error {
  constructor(message, status = 422) {
    super(message);
    this.status = status;
  }
}

// IPv4-only by design: all addresses are resolved and the vetted IP is pinned
// to the TLS request. No DNS rebinding or internal/metadata address fallback.
export function publicIPv4(address) {
  if (isIP(address) !== 4) return false;
  const [a, b, c] = address.split('.').map(Number);
  if ([0, 10, 127].includes(a) || a >= 224 || (a === 169 && b === 254)) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 168 || b === 0 || (b === 88 && c === 99) || (b === 0 && c === 2)))
    return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  if (a === 192 && b === 0 && c === 2) return false;
  return true;
}

export async function validateArticleUrl(candidate, resolver = lookup) {
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new ArticleError('Enter a valid HTTPS article URL.', 400);
  }
  if (
    parsed.protocol !== 'https:' ||
    (parsed.port && parsed.port !== '443') ||
    parsed.username ||
    parsed.password
  ) {
    throw new ArticleError('Only public HTTPS URLs on port 443 are supported.', 400);
  }
  const host = parsed.hostname.toLowerCase();
  if (
    isIP(host) ||
    !host.includes('.') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.localhost') ||
    host.endsWith('.test') ||
    host.endsWith('.onion')
  ) {
    throw new ArticleError('Local, private, and IP-address URLs are not supported.', 400);
  }
  const records = await resolver(host, { all: true, family: 4, verbatim: true });
  if (!records.length || records.some((r) => !publicIPv4(r.address))) {
    throw new ArticleError('This URL does not resolve exclusively to public IPv4 addresses.', 400);
  }
  parsed.hash = '';
  return { parsed, ip: records[0].address };
}

// A deliberately restricted HTTPS client rather than fetch(): Node's generic
// fetch may re-resolve a hostname after validation, enabling DNS rebinding.
export function requestPinned({ parsed, ip, maxBytes = 1_000_000, timeoutMs = 9000 }) {
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: parsed.hostname,
        port: 443,
        method: 'GET',
        path: `${parsed.pathname}${parsed.search}`,
        servername: parsed.hostname,
        rejectUnauthorized: true,
        lookup: (_name, _opts, callback) => callback(null, ip, 4),
        headers: {
          'User-Agent': 'RyanTechTrendsBot/3.0 (+portfolio; article analysis)',
          Accept: 'text/html',
          'Accept-Encoding': 'identity',
        },
      },
      (response) => {
        const status = response.statusCode || 502;
        const headers = response.headers;
        const type = String(headers['content-type'] || '');
        if (status >= 300 && status < 400) {
          response.resume();
          return resolve({ status, redirect: headers.location });
        }
        if (status !== 200) {
          response.resume();
          return reject(new ArticleError(`Article website returned HTTP ${status}.`, 422));
        }
        if (!/^text\/html(?:\s*;|\s*$)/i.test(type)) {
          response.resume();
          return reject(new ArticleError('The URL did not return an HTML article.', 422));
        }
        let bytes = 0;
        const parts = [];
        response.on('data', (chunk) => {
          bytes += chunk.length;
          if (bytes > maxBytes) {
            request.destroy(new ArticleError('Article response is too large.', 413));
            return;
          }
          parts.push(chunk);
        });
        response.on('end', () => resolve({ status, html: Buffer.concat(parts).toString('utf8') }));
        response.on('error', reject);
      },
    );
    request.setTimeout(timeoutMs, () =>
      request.destroy(new ArticleError('Article fetch timed out.', 504)),
    );
    request.on('error', reject);
    request.end();
  });
}

export async function fetchArticle(url, { resolver = lookup, requester = requestPinned } = {}) {
  let current = url;
  const seen = new Set();
  for (let redirects = 0; redirects <= 3; redirects++) {
    const vetted = await validateArticleUrl(current, resolver);
    if (seen.has(vetted.parsed.href)) throw new ArticleError('Redirect loop detected.');
    seen.add(vetted.parsed.href);
    const result = await requester(vetted);
    if (result.redirect && result.status >= 300 && result.status < 400) {
      current = new URL(result.redirect, vetted.parsed).href;
      continue;
    }
    return { ...extractArticle(result.html), url: vetted.parsed.href };
  }
  throw new ArticleError('Too many redirects.');
}

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  mdash: '—',
  ndash: '–',
  hellip: '…',
};
function decode(value) {
  return String(value).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, raw) => {
    if (raw[0] !== '#') return ENTITIES[raw.toLowerCase()] ?? whole;
    const code = raw[1].toLowerCase() === 'x' ? parseInt(raw.slice(2), 16) : Number(raw.slice(1));
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
      ? String.fromCodePoint(code)
      : '';
  });
}
function strip(markup) {
  return decode(markup.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')).trim();
}

// Conservative server-rendered HTML extraction. JS-only and paywalled pages
// are intentionally unsupported; pasting readable article text is the fallback.
export function extractArticle(html) {
  const source = String(html);
  const title = strip(
    source.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] || 'Untitled article',
  ).slice(0, 200);
  let cleaned = source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(
      /<(script|style|svg|noscript|nav|footer|header|aside|form|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
      ' ',
    );
  const main =
    cleaned.match(/<article\b[^>]*>([\s\S]*?)<\/article\s*>/i)?.[1] ||
    cleaned.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i)?.[1] ||
    cleaned.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)?.[1] ||
    cleaned;
  const paragraphs = [...main.matchAll(/<(?:p|h2|h3|li)\b[^>]*>([\s\S]*?)<\/(?:p|h2|h3|li)\s*>/gi)]
    .map((m) => strip(m[1]))
    .filter((p) => p.length >= 25);
  const text = (paragraphs.length ? paragraphs.join('\n\n') : strip(main)).slice(0, 35000);
  if (text.length < 100)
    throw new ArticleError(
      'Could not extract enough article text. Paste the article text instead.',
    );
  return { title, text, wordCount: text.split(/\s+/).filter(Boolean).length };
}
