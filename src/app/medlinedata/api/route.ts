import { NextRequest, NextResponse } from 'next/server'

// ── ICD-10 code flow types ──────────────────────────────────────────────────

interface ParsedEntry {
  baslik: string
  organizasyon: string
  ozet: string
  url: string
  gruplar: string[]
}

interface ResultPayload {
  aramaTerimi: string
  bulunanSonucSayisi: number
  kaynak: string
  veriler: ParsedEntry[]
}

// ── URL content fetch types ─────────────────────────────────────────────────

interface UrlContentPayload {
  title: string
  html: string
  markdown: string
  url: string
  wordCount: number
}

// ── ICD-10 helpers ──────────────────────────────────────────────────────────

async function fetchConnectHtml(code: string): Promise<string> {
  const url = `https://connect.medlineplus.gov/application?mainSearchCriteria.v.cs=2.16.840.1.113883.6.90&mainSearchCriteria.v.c=${encodeURIComponent(code)}&knowledgeResponseType=application/json`
  const res = await fetch(url, {
    headers: { Accept: 'text/html', 'User-Agent': 'medimapia-server/1.0' },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`Connect API ${res.status}`)
  return res.text()
}

function parseConnectHtml(html: string): { title: string; url: string }[] {
  const results: { title: string; url: string }[] = []
  const pattern = /class="resource-title"[^>]*>\s*<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(html)) !== null) {
    const rawUrl = match[1].replace(/&amp;/g, '&')
    const cleanUrl = rawUrl.split('?')[0]
    results.push({ title: match[2].trim(), url: cleanUrl })
  }
  return results
}

async function fetchWsearchSummary(slug: string): Promise<string> {
  const url = `https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=${encodeURIComponent(slug)}&rettype=topic&retmax=1`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) return ''
  const xml = await res.text()
  const fullMatch = xml.match(/<full-summary>([\s\S]*?)<\/full-summary>/)
  if (fullMatch) {
    return fullMatch[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1200)
  }
  const metaMatch = xml.match(/meta-desc="([^"]+)"/)
  return metaMatch ? metaMatch[1] : ''
}

function slugFromUrl(url: string): string {
  const m = url.match(/medlineplus\.gov\/([^/?#]+?)(?:\.html)?$/)
  return m ? m[1] : ''
}

// ── MedlinePlus page content extraction ────────────────────────────────────

const GENETICS_STOP_SECTIONS = [
  'Additional Information',
  'Genetic Testing',
  'Clinical Trials',
  'Catalog of Genes',
  'Patient Support',
]

function extractPageContent(html: string, pageUrl: string): { title: string; content: string } {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/)
  const rawTitle = titleMatch
    ? titleMatch[1].replace(/\s*[|\-–:][^|\-–:]*$/, '').trim()
    : ''

  let content = ''

  if (pageUrl.includes('/genetics/condition/')) {
    // Genetics pages: <article> > <div class="main"> with <h2> sections
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/)
    const mainMatch = articleMatch?.[1].match(/<div\s+class="main"[^>]*>([\s\S]*)/)
    let raw = mainMatch?.[1] ?? ''

    // Stop before non-medical resource sections
    for (const stop of GENETICS_STOP_SECTIONS) {
      const idx = raw.indexOf(stop)
      if (idx !== -1) { raw = raw.slice(0, idx); break }
    }
    content = raw
  } else {
    // Standard health topic: <div id="topic-summary">
    const summaryMatch = html.match(/<div[^>]+id="topic-summary"[^>]*>([\s\S]*?)<\/div>\s*(?=<div\s+class="section"|<\/div>)/)
    content = summaryMatch ? summaryMatch[1] : ''

    // Fallback for encyclopedia articles
    if (!content) {
      const encMatch = html.match(/<div[^>]+class="[^"]*section-body[^"]*syndicate[^"]*"[^>]*>([\s\S]*?)<\/div>/)
      content = encMatch ? encMatch[1] : ''
    }

    // Cut off category navigation sections (Start Here, Diagnosis, etc.)
    const catAnchorIdx = content.search(/<a\s[^>]*name="cat_/i)
    if (catAnchorIdx !== -1) content = content.slice(0, catAnchorIdx)
  }

  content = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\s+on\w+="[^"]*"/gi, '')
    .replace(/href="(\/[^"]+)"/g, 'href="https://medlineplus.gov$1"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return { title: rawTitle, content }
}

function htmlToMarkdown(title: string, html: string): string {
  let md = `# ${title}\n\n`
  md += html
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<a[^>]+href="[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
    .replace(/<\/ul>|<\/ol>/gi, '\n')
    .replace(/<ul[^>]*>|<ol[^>]*>/gi, '')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;|&#x27;/g, "'")
    .replace(/&#x2019;/g, '’')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return md
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return text ? text.split(' ').length : 0
}

// ── Route handler ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const urlParam = req.nextUrl.searchParams.get('url')

  // ── Branch: URL content fetch ──
  if (urlParam) {
    if (!urlParam.startsWith('https://medlineplus.gov/')) {
      return NextResponse.json(
        { error: "Sadece 'https://medlineplus.gov/' URL'leri desteklenir." },
        { status: 400 },
      )
    }

    // Genetics condition URLs need a trailing slash (301 redirect otherwise)
    const fetchUrl =
      urlParam.includes('/genetics/condition/') && !urlParam.endsWith('/')
        ? urlParam + '/'
        : urlParam

    let pageHtml: string
    try {
      const res = await fetch(fetchUrl, {
        headers: { 'User-Agent': 'medimapia-server/1.0', Accept: 'text/html' },
        signal: AbortSignal.timeout(12000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      pageHtml = await res.text()
    } catch (e) {
      return NextResponse.json(
        { error: `Sayfa çekilemedi: ${(e as Error).message}` },
        { status: 502 },
      )
    }

    const { title, content } = extractPageContent(pageHtml, urlParam)

    if (!content) {
      return NextResponse.json(
        { error: 'Sayfadan içerik çıkarılamadı. Farklı bir MedlinePlus URL deneyin.' },
        { status: 422 },
      )
    }

    const payload: UrlContentPayload = {
      title,
      html: content,
      markdown: htmlToMarkdown(title, content),
      url: urlParam,
      wordCount: countWords(content),
    }
    return NextResponse.json(payload)
  }

  // ── Branch: ICD-10 code search ──
  if (!code) {
    return NextResponse.json({ error: "'code' veya 'url' parametresi gerekli" }, { status: 400 })
  }

  const upperCode = code.toUpperCase()

  let articles: { title: string; url: string }[] = []
  try {
    const html = await fetchConnectHtml(upperCode)
    articles = parseConnectHtml(html)
  } catch {
    return NextResponse.json(
      { error: `MedlinePlus Connect API erişilemedi (${upperCode})` },
      { status: 502 },
    )
  }

  if (articles.length === 0) {
    return NextResponse.json(
      { error: `Bu ICD-10 kodu için MedlinePlus'ta sonuç bulunamadı: ${upperCode}` },
      { status: 404 },
    )
  }

  const limited = articles.slice(0, 3)
  const veriler: ParsedEntry[] = await Promise.all(
    limited.map(async (article) => {
      const slug = slugFromUrl(article.url)
      const ozet = slug ? await fetchWsearchSummary(slug) : ''
      return {
        baslik: article.title,
        organizasyon: 'National Library of Medicine (NIH)',
        ozet: ozet || 'Bu konu için detaylı özet sağlanmamıştır.',
        url: article.url,
        gruplar: ['Hastalık Özeti', 'Hasta Bilgilendirmesi'],
      }
    }),
  )

  const payload: ResultPayload = {
    aramaTerimi: `ICD-10: ${upperCode}`,
    bulunanSonucSayisi: veriler.length,
    kaynak: 'NIH MedlinePlus Connect + wsearch API',
    veriler,
  }

  return NextResponse.json(payload)
}
