'use server'

import { GoogleGenerativeAI } from '@google/generative-ai' // 公式SDK
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

/**
 * AIメンターによるフィードバック生成 & 保存アクション
 */
export async function askAiMentor(cycleId: string, hypothesis: string, action: string, result: string) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error('APIキーが設定されていません。.envを確認してください。')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" })

  const prompt = `
    あなたはスタートアップのメンターです。関西弁で話してください。
    以下の高校生の起業プロジェクトに対し、良かったところや改善点、具体的な次のアクションを300文字以内でアドバイスしてください。また、最後に五七五で締めてください。

    [現状]
    仮説: ${hypothesis}
    行動: ${action || '未実施'}
    結果: ${result || '未確認'}
  `

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text) throw new Error('AIからの応答が空でした')

    await prisma.feedback.create({
      data: {
        cycleId,
        content: text,
        authorType: 'AI',
      },
    })

    revalidatePath('/')
    return { success: true }

  } catch (error) {
    console.error("AI Error Details:", error)
    throw new Error('AI生成中にエラーが発生しました')
  }
}
