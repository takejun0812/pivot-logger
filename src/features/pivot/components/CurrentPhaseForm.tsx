'use client'

import { PivotCycle, PivotDecision } from '@prisma/client'
import { updateCycleProgress, executePivot, deleteCycle } from '@/features/pivot/actions'
import { useState } from 'react'

type Props = {
  cycle: PivotCycle
}

export function CurrentPhaseForm({ cycle }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // サーバーアクションの準備
  const updateAction = updateCycleProgress.bind(null, cycle.id)
  
  // 削除ハンドラ
  const handleDelete = async () => {
    if (!confirm('本当にこのカードを削除しますか？\n（この操作は取り消せません）')) return
    
    setIsSubmitting(true)
    try {
      await deleteCycle(cycle.id)
    } catch (error) {
      alert('削除に失敗しました')
      setIsSubmitting(false)
    }
  }

  // 決断ハンドラ (Pivot/Persevere)
  const handleDecision = async (decision: PivotDecision) => {
    const message = decision === 'PIVOT' 
      ? 'この取り組みを終了し、新しいフェーズ（ピボット）へ移行しますか？'
      : 'この取り組みを成功とし、次のステップ（継続）へ進みますか？'

    if (!confirm(message)) return

    setIsSubmitting(true)
    try {
      await executePivot(cycle.id, cycle.projectId, cycle.phase, decision)
    } catch (error) {
      alert('エラーが発生しました')
      setIsSubmitting(false)
    }
  }

  // 状態に応じたスタイル定義
  const isCompleted = cycle.status === 'COMPLETED'
  
  // 完了済みなら少し薄く、影をなくす
  const containerStyle = isCompleted
    ? 'border-gray-200 bg-gray-50 opacity-90'
    : 'border-blue-500 bg-white shadow-lg ring-1 ring-blue-100'

  // ステータスバッジの色
  const statusBadgeStyle = isCompleted
    ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse'

  return (
    <div className={`relative rounded-xl border-2 transition-all duration-300 ${containerStyle}`}>
      
      {/* --- ヘッダーエリア (ステータス & 削除ボタン) --- */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-opacity-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${statusBadgeStyle}`}>
            {cycle.status}
          </span>
          {/* 決断済みの場合は結果を表示 */}
          {cycle.decision !== 'PENDING' && (
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
              cycle.decision === 'PIVOT' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-green-100 text-green-700 border-green-200'
            }`}>
              {cycle.decision}
            </span>
          )}
        </div>
        
        {/* 削除ボタン (ゴミ箱アイコン) */}
        <button 
          onClick={handleDelete}
          disabled={isSubmitting}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
          title="このカードを削除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>

      {/* --- 入力フォームエリア --- */}
      <form action={updateAction} className="p-6 pt-4">
        <div className="space-y-4">
          {/* 仮説 / 取り組み内容 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">仮説 / 取り組み内容 (Hypothesis)</label>
            <textarea
              name="hypothesis"
              defaultValue={cycle.hypothesis || ''}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm min-h-[60px]"
              placeholder="何をする予定ですか？"
            />
          </div>

          {/* 行動 (Action) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">実行したこと (Action)</label>
            <textarea
              name="action"
              defaultValue={cycle.action || ''}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm min-h-[60px]"
              placeholder="具体的に何をしましたか？"
            />
          </div>

          {/* 結果 (Result) & 学び (Learning) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">結果 (Result)</label>
              <textarea
                name="result"
                defaultValue={cycle.result || ''}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm min-h-[60px]"
                placeholder="どうなりましたか？"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">学び (Learning)</label>
              <textarea
                name="learning"
                defaultValue={cycle.learning || ''}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm min-h-[60px]"
                placeholder="次にどう活かしますか？"
              />
            </div>
          </div>
          
          {/* 保存ボタン (右寄せ) */}
          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              className="text-sm bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white px-4 py-2 rounded font-bold transition-all shadow-sm"
            >
              {isCompleted ? '修正を保存' : '進捗を保存'}
            </button>
          </div>
        </div>
      </form>

      {/* --- 決断ボタンエリア (完了していない場合のみ表示) --- */}
      {!isCompleted && (
        <div className="px-6 pb-6 pt-2 grid grid-cols-2 gap-3 border-t border-gray-100 mt-2 bg-gray-50 rounded-b-xl">
          <button
            onClick={() => handleDecision('PIVOT')}
            disabled={isSubmitting}
            className="flex flex-col items-center justify-center p-3 bg-white border border-orange-200 rounded hover:bg-orange-50 transition-colors shadow-sm group"
          >
            <span className="text-sm font-bold text-orange-600 group-hover:scale-105 transition-transform">⚡️ PIVOT</span>
            <span className="text-[10px] text-gray-400">方針転換</span>
          </button>

          <button
            onClick={() => handleDecision('PERSEVERE')}
            disabled={isSubmitting}
            className="flex flex-col items-center justify-center p-3 bg-white border border-green-200 rounded hover:bg-green-50 transition-colors shadow-sm group"
          >
            <span className="text-sm font-bold text-green-600 group-hover:scale-105 transition-transform">🚀 PERSEVERE</span>
            <span className="text-[10px] text-gray-400">継続・次へ</span>
          </button>
        </div>
      )}
    </div>
  )
}
