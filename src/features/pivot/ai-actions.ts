// src/features/pivot/ai-actions.ts
'use server'

import { GoogleGenerativeAI } from '@google/generative-ai' // 公式SDK
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

/**
 * AIメンターによるフィードバック生成 & 保存アクション
 */
export async function askAiMentor(cycleId: string, hypothesis: string, action: string, result: string) {
  // 1. APIキーの確認
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error('APIキーが設定されていません。.envを確認してください。')
  }

  // 2. Google公式SDKの初期化
  const genAI = new GoogleGenerativeAI(apiKey)
  
  // ここでモデルを指定！公式SDKなら "gemini-1.5-flash" で確実に通ります
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" })

  // 3. プロンプトの作成
  const prompt = `
    あなたはスタートアップの厳しいメンターです。関西弁で話してください。
    以下の高校生の起業プロジェクトに対し、辛口かつ具体的な次のアクションを150文字以内でアドバイスしてください。

    [現状]
    仮説: ${hypothesis}
    行動: ${action || '未実施'}
    結果: ${result || '未確認'}
  `

  try {
    // 4. 生成実行
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text() // テキストを取り出す

    if (!text) throw new Error('AIからの応答が空でした')

    // 5. DB保存
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
    console.error("AI Error Details:", error) // ターミナルに詳細エラーを出す
    throw new Error('AI生成中にエラーが発生しました')
  }
}
