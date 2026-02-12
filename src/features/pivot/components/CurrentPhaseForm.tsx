'use client'

import { PivotCycle, PivotDecision } from '@prisma/client'
import { updateCycleProgress, executePivot } from '@/features/pivot/actions' // executePivotを追加
import { useState } from 'react'

type Props = {
  cycle: PivotCycle
}

export function CurrentPhaseForm({ cycle }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 保存用アクション (テキスト入力の保存)
  const updateAction = updateCycleProgress.bind(null, cycle.id)

  // 決断用アクション (ボタンを押した時の処理)
  const handleDecision = async (decision: PivotDecision) => {
    if (!confirm('このフェーズを終了し、次のステップへ進みますか？\n（この操作は取り消せません）')) {
      return
    }

    setIsSubmitting(true)
    try {
      // Day 2で作った executePivot を呼び出す
      await executePivot(cycle.id, cycle.projectId, cycle.phase, decision)
    } catch (error) {
      alert('エラーが発生しました')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative pb-12"> {/* 下にボタンエリアの余白を確保 */}
      
      {/* 1. 保存フォーム部分 */}
      <form action={updateAction} className="bg-white rounded-xl p-6 border-2 border-blue-500 shadow-xl relative z-10">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
            Current Phase {cycle.phase}
          </span>
          {isSubmitting && <span className="text-xs text-gray-400">処理中...</span>}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">仮説 (Hypothesis)</label>
            <textarea
              name="hypothesis"
              defaultValue={cycle.hypothesis || ''}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">結果 (Result)</label>
            <textarea
              name="result"
              defaultValue={cycle.result || ''}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            />
          </div>
          
          <div className="flex justify-end pt-2">
             <button type="submit" className="text-sm text-blue-600 hover:text-blue-800 font-bold">
               内容を一時保存する →
             </button>
          </div>
        </div>
      </form>

      {/* 2. 決断ボタンエリア (ここが追加箇所！) */}
      {/* フォームの外に出して、デザイン的に「次のステップ」感を出す */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        
        {/* ピボットボタン (方針転換) */}
        <button
          onClick={() => handleDecision('PIVOT')}
          disabled={isSubmitting}
          className="group flex flex-col items-center justify-center p-4 bg-orange-50 border-2 border-orange-200 rounded-xl hover:bg-orange-100 hover:border-orange-300 transition-all active:scale-95"
        >
          <span className="text-lg font-bold text-orange-600 mb-1">⚡️ PIVOT</span>
          <span className="text-xs text-orange-400">方針を変えて次へ</span>
        </button>

        {/* 継続ボタン (そのまま進む) */}
        <button
          onClick={() => handleDecision('PERSEVERE')}
          disabled={isSubmitting}
          className="group flex flex-col items-center justify-center p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all active:scale-95"
        >
          <span className="text-lg font-bold text-green-600 mb-1">🚀 PERSEVERE</span>
          <span className="text-xs text-green-400">このまま突き進む</span>
        </button>

      </div>
    </div>
  )
}
