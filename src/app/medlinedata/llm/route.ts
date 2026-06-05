import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const systemPrompt: string = body?.systemPrompt ?? ''
  const userPrompt: string = body?.userPrompt ?? ''

  if (!userPrompt.trim()) {
    return NextResponse.json({ error: 'userPrompt boş olamaz.' }, { status: 400 })
  }

  const provider = process.env.SPECIALITY_LLM_PROVIDER ?? 'anthropic'

  try {
    let text: string

    if (provider === 'openai') {
      const OpenAI = (await import('openai')).default
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
      })
      const model = process.env.SPECIALITY_LLM_MODEL ?? 'gpt-4o-mini'

      let extraParams: Record<string, unknown> = {}
      if (process.env.SPECIALITY_LLM_EXTRA_PARAMS) {
        try { extraParams = JSON.parse(process.env.SPECIALITY_LLM_EXTRA_PARAMS) } catch { /* ignore */ }
      }

      const res = await client.chat.completions.create({
        model,
        max_tokens: 4096,
        stream: false,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        ...extraParams,
      })

      text = res.choices[0]?.message?.content ?? ''
    } else {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const model = process.env.SPECIALITY_LLM_MODEL ?? 'claude-haiku-4-5-20251001'

      const res = await client.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      })

      text = res.content.find((b) => b.type === 'text')?.text ?? ''
    }

    return NextResponse.json({ text })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
