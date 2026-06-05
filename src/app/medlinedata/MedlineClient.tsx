'use client'

import { useState, useRef } from 'react'
import {
  Activity,
  FileJson,
  LayoutList,
  AlertCircle,
  Loader2,
  ExternalLink,
  Link2,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react'

const LANG_MAP: Record<string, string> = {
  EN: 'English',
  DE: 'German',
  ES: 'Spanish',
  FR: 'French',
}

function buildSystemPrompt(language: string): string {
  return `You are a professional medical content writer specializing in patient-facing health information. Rewrite the provided medical text following these rules:

- Write in ${language}
- Use simple, clear language that patients without medical expertise can understand
- Keep a warm, reassuring tone
- Base the rewrite ONLY on the information provided — do not add or invent any medical facts not present in the source text
- Proper medical names, disease synonyms, gene names, and scientific terms must remain unchanged (do not translate or alter them)
- Do NOT copy the original structure or headings — reorganize the content freely into a cohesive, original article that flows naturally
- Cover all the information from every section of the source, but blend and rephrase it so the result reads as a completely new, unique piece of writing
- Use your own heading structure (## and ###) that best serves the reader, not the source document's layout
- Return only the rewritten text with no preamble, explanation, or commentary`
}

const COMMON_DISEASES = [
  { name: 'Amnesia (Hafıza Kaybı)', code: 'R41.3' },
  { name: 'Asthma (Astım)', code: 'J45' },
  { name: 'Diabetes Type 2 (Tip 2 Diyabet)', code: 'E11' },
  { name: 'Hypertension (Yüksek Tansiyon)', code: 'I10' },
  { name: "Alzheimer's Disease", code: 'G30' },
  { name: 'Migraine (Migren)', code: 'G43' },
  { name: 'Pneumonia (Zatürre)', code: 'J18.9' },
  { name: 'Breast Cancer (Meme Kanseri)', code: 'C50' },
]

interface ResultItem {
  baslik: string
  organizasyon: string
  ozet: string
  url: string
  gruplar: string[]
}

interface ResultData {
  aramaTerimi: string
  bulunanSonucSayisi: number
  kaynak: string
  veriler: ResultItem[]
}

interface UrlResult {
  title: string
  html: string
  markdown: string
  url: string
  wordCount: number
}

export default function MedlineClient() {
  // ICD-10 search state
  const [selectedDisease, setSelectedDisease] = useState(COMMON_DISEASES[0].code)
  const [customCode, setCustomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultData, setResultData] = useState<ResultData | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'json'>('cards')

  // Toggle state
  const [icdOpen, setIcdOpen] = useState(false)
  const [urlOpen, setUrlOpen] = useState(true)
  const [llmOpen, setLlmOpen] = useState(false)

  // LLM state
  const [llmLang, setLlmLang] = useState('EN')
  const [systemPrompt, setSystemPrompt] = useState(() => buildSystemPrompt('English'))
  const [userPrompt, setUserPrompt] = useState('')
  const [llmLoading, setLlmLoading] = useState(false)
  const [llmResult, setLlmResult] = useState('')
  const [llmError, setLlmError] = useState<string | null>(null)
  const [llmCopied, setLlmCopied] = useState(false)

  // URL fetch state
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [urlResult, setUrlResult] = useState<UrlResult | null>(null)
  const [copied, setCopied] = useState(false)
  const urlSectionRef = useRef<HTMLDivElement>(null)

  const fetchDiseaseData = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const codeToSearch = customCode.trim().toUpperCase() || selectedDisease
    if (!codeToSearch) return
    setLoading(true)
    setError(null)
    setResultData(null)
    const foundInDict = COMMON_DISEASES.find((d) => d.code === codeToSearch)
    const displayName = foundInDict ? foundInDict.name : `ICD-10 Kodu: ${codeToSearch}`
    try {
      const response = await fetch(`/medlinedata/api?code=${encodeURIComponent(codeToSearch)}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'MedlinePlus sunucusu yanıt vermedi.')
      setResultData({ ...data, aramaTerimi: displayName })
    } catch (err) {
      setError((err as Error).message || 'Bilinmeyen bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUrlContent = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = urlInput.trim()
    if (!url) return
    setUrlLoading(true)
    setUrlError(null)
    setUrlResult(null)
    try {
      const response = await fetch(`/medlinedata/api?url=${encodeURIComponent(url)}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'İçerik çekilemedi.')
      setUrlResult(data)
      setUserPrompt(data.markdown ?? '')
    } catch (err) {
      setUrlError((err as Error).message || 'Bilinmeyen bir hata oluştu.')
    } finally {
      setUrlLoading(false)
    }
  }

  const fillUrlFromArticle = (articleUrl: string) => {
    setUrlInput(articleUrl)
    urlSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const copyMarkdown = async () => {
    if (!urlResult) return
    await navigator.clipboard.writeText(urlResult.markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const changeLang = (code: string) => {
    setLlmLang(code)
    setSystemPrompt(buildSystemPrompt(LANG_MAP[code] ?? code))
  }

  const runLlm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userPrompt.trim()) return
    setLlmLoading(true)
    setLlmError(null)
    setLlmResult('')
    try {
      const res = await fetch('/medlinedata/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'LLM isteği başarısız.')
      setLlmResult(data.text ?? '')
    } catch (err) {
      setLlmError((err as Error).message)
    } finally {
      setLlmLoading(false)
    }
  }

  const copyLlmResult = async () => {
    await navigator.clipboard.writeText(llmResult)
    setLlmCopied(true)
    setTimeout(() => setLlmCopied(false), 2000)
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-slate-300 text-sm">
          <span className="text-slate-500">medimapia</span>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium">medlinedata</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        {/* Title card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <Activity size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              NIH MedlinePlus — Hastalık Verisi
            </h1>
          </div>
          <p className="text-slate-600 ml-14">
            ICD-10 koduyla özet arayın veya doğrudan MedlinePlus makale URL'si girerek tam
            içeriği çekin.{' '}
            <strong className="text-slate-800">Syndicate (public domain)</strong> içerik —
            LLM işleme için hazır.
          </p>
        </div>

        {/* ── URL Content Fetch ──────────────────────────────────────── */}
        <div ref={urlSectionRef} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button
            onClick={() => setUrlOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              MedlinePlus URL&apos;den Tam İçerik Çek
            </span>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform duration-200 ${urlOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {urlOpen && <div className="px-6 pb-6">
          <form onSubmit={fetchUrlContent} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                MedlinePlus Makale URL&apos;si
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://medlineplus.gov/asthma.html"
                className="w-full p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500 outline-none text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={urlLoading || !urlInput.trim()}
                className="bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center min-w-[140px] h-[50px]"
              >
                {urlLoading ? <Loader2 className="animate-spin" size={20} /> : 'İçeriği Çek'}
              </button>
            </div>
          </form>
          </div>}
        </div>

        {/* URL Error */}
        {urlError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <p>{urlError}</p>
          </div>
        )}

        {/* URL Result */}
        {urlResult && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Toolbar */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm text-slate-700">
                <span className="font-bold text-slate-900">{urlResult.title}</span>
                <span className="mx-2 text-slate-400">|</span>
                <span className="text-slate-500">
                  {urlResult.wordCount.toLocaleString()} kelime
                  <span className="text-slate-400 ml-1">(~{Math.round(urlResult.wordCount * 1.3).toLocaleString()} token)</span>
                </span>
                <span className="mx-2 text-slate-400">|</span>
                <a
                  href={urlResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  Kaynağa Git <ExternalLink size={12} />
                </a>
              </div>
              <button
                onClick={copyMarkdown}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Kopyalandı!' : 'Markdown Kopyala'}
              </button>
            </div>

            {/* Markdown content */}
            <pre
              className="p-6 md:p-8 text-sm text-slate-800 font-mono whitespace-pre-wrap overflow-auto"
              style={{ maxHeight: '70vh' }}
            >
              {urlResult.markdown}
            </pre>
          </div>
        )}

        {/* ── ICD-10 Search ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button
            onClick={() => setIcdOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              ICD-10 Kod ile Özet Ara
            </span>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform duration-200 ${icdOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {icdOpen && <div className="px-6 pb-6">
            <form onSubmit={fetchDiseaseData} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Yaygın Hastalıklar</label>
                <select
                  value={selectedDisease}
                  onChange={(e) => { setSelectedDisease(e.target.value); setCustomCode('') }}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
                >
                  {COMMON_DISEASES.map((d) => (
                    <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-center text-slate-400 font-medium text-sm">VEYA</div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Özel ICD-10 Kodu</label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="Örn: J45"
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center min-w-[140px] h-[50px]"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Özetleri Getir'}
                </button>
              </div>
            </form>
          </div>}
        </div>

        {/* ICD Error */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* ICD Results */}
        {resultData && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[600px]">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
              <div className="text-sm text-slate-600 font-medium">
                Aranan: <span className="font-bold text-slate-900">{resultData.aramaTerimi}</span>
                <span className="mx-2 text-slate-400">|</span>
                <span className="text-emerald-600 font-bold">{resultData.bulunanSonucSayisi}</span> sonuç
                <span className="mx-2 text-slate-400">|</span>
                <span className="text-slate-400 text-xs">{resultData.kaynak}</span>
              </div>
              <div className="flex bg-slate-200 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'cards' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <LayoutList size={16} /> Okuma
                </button>
                <button
                  onClick={() => setViewMode('json')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'json' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <FileJson size={16} /> JSON
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-50/50">
              {viewMode === 'json' ? (
                <pre className="bg-slate-900 text-emerald-400 p-6 rounded-xl overflow-auto text-sm font-mono shadow-inner h-full">
                  {JSON.stringify(resultData, null, 2)}
                </pre>
              ) : (
                <div className="space-y-4">
                  {resultData.veriler.map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <h2 className="text-xl font-bold text-slate-900 mb-2">{item.baslik}</h2>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.gruplar.map((grup, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-100">
                            {grup}
                          </span>
                        ))}
                      </div>
                      <div className="text-slate-700 text-sm leading-relaxed mb-4 space-y-2">
                        {item.ozet.split('\n\n').map((p, i) => <p key={i}>{p.trim()}</p>)}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">Kaynak: {item.organizasyon}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => fillUrlFromArticle(item.url)}
                            className="text-sky-600 hover:text-sky-800 text-sm font-medium flex items-center gap-1"
                            title="Tam içeriği çek"
                          >
                            <Link2 size={14} /> Tam İçeriği Çek
                          </button>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800 text-sm font-medium flex items-center gap-1"
                          >
                            MedlinePlus&apos;ta Oku <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LLM İşleme ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <button
            onClick={() => setLlmOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-wide">
              <Sparkles size={16} className="text-violet-500" />
              LLM ile Yeniden Yaz
            </span>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform duration-200 ${llmOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {llmOpen && (
            <form onSubmit={runLlm} className="px-6 pb-6 space-y-4">
              {/* Dil seçici */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 mr-1">Dil:</span>
                {Object.keys(LANG_MAP).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => changeLang(code)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      llmLang === code
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>

              {/* System prompt */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  System Prompt
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={8}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-violet-500 outline-none text-sm font-mono resize-y"
                />
              </div>

              {/* User prompt */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  User Prompt{' '}
                  <span className="text-slate-400 font-normal">(URL çekince otomatik dolar)</span>
                </label>
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  rows={10}
                  placeholder="Buraya markdown içerik gelecek veya manuel girebilirsiniz…"
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-violet-500 outline-none text-sm font-mono resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={llmLoading || !userPrompt.trim()}
                className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2"
              >
                {llmLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {llmLoading ? 'Yazılıyor…' : 'Yeniden Yaz'}
              </button>

              {/* LLM Error */}
              {llmError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
                  <AlertCircle className="mt-0.5 shrink-0" size={20} />
                  <p className="text-sm">{llmError}</p>
                </div>
              )}

              {/* LLM Result */}
              {llmResult && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Sonuç</span>
                    <button
                      type="button"
                      onClick={copyLlmResult}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        llmCopied
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {llmCopied ? <Check size={14} /> : <Copy size={14} />}
                      {llmCopied ? 'Kopyalandı!' : 'Kopyala'}
                    </button>
                  </div>
                  <pre className="p-4 text-sm text-slate-800 font-mono whitespace-pre-wrap overflow-auto max-h-[60vh]">
                    {llmResult}
                  </pre>
                </div>
              )}
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
