import { useState } from 'react'

export default function QuestionModal({ q, teams, ansTeamId, setAnsTeamId, onCorrect, onWrong, onClose }) {
  const [selectedAns, setSelectedAns] = useState(null)
  const [eliminated, setEliminated] = useState(new Set())
  const [wrongFlash, setWrongFlash] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const L = ['A','B','C','D']

  function handleConfirm() {
    if (selectedAns === null || !ansTeamId) return

    if (selectedAns === q.ans) {
      onCorrect()
    } else {
      // Eliminate wrong answer, flash, move to next team
      setEliminated(prev => new Set([...prev, selectedAns]))
      setSelectedAns(null)
      setWrongFlash(true)
      setTimeout(() => setWrongFlash(false), 1200)
      onWrong()
    }
  }

  const canConfirm = selectedAns !== null && ansTeamId !== null

  return (
    <div className="modal-bg">
      <div className="bg-white rounded-3xl p-5 w-full mx-3 slide-up" style={{maxWidth:640,maxHeight:'92vh',overflowY:'auto'}}>

        {/* Header */}
        <div className={`rounded-2xl p-4 mb-4 text-center transition-all duration-300
          ${wrongFlash
            ? 'bg-gradient-to-br from-red-500 to-red-700'
            : 'bg-gradient-to-br from-red-700 to-red-900'}`}>
          <div className="text-yellow-300 text-xs font-black tracking-widest mb-1">CÂU HỎI</div>
          <div className="text-white font-black text-lg leading-snug">{q.q}</div>
          {wrongFlash && (
            <div className="mt-2 text-white font-black text-xl animate-bounce">
              ❌ SAI! Chuyển nhóm tiếp theo...
            </div>
          )}
        </div>

        {/* Answers — click to select */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {q.opts.map((opt, i) => {
            const isElim = eliminated.has(i)
            const isSel = selectedAns === i
            const isCorrectRevealed = showAnswer && i === q.ans

            return (
              <div key={i}
                onClick={() => !isElim && setSelectedAns(i)}
                className={[
                  'rounded-xl p-3 border-2 transition-all text-sm font-medium select-none',
                  isElim
                    ? 'bg-gray-100 border-gray-200 opacity-35 cursor-not-allowed text-gray-400 line-through'
                    : isCorrectRevealed
                      ? 'bg-green-50 border-green-500 text-green-800 cursor-pointer'
                      : isSel
                        ? 'bg-yellow-50 border-yellow-500 ring-2 ring-yellow-400 cursor-pointer shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:border-red-300 hover:bg-red-50 cursor-pointer',
                ].join(' ')}>
                <span className="font-black text-red-700 mr-1">{L[i]}.</span>
                {opt}
                {isElim && <span className="ml-1 text-xs text-gray-400">✕ đã sai</span>}
                {isSel && !isElim && (
                  <span className="ml-1 text-xs font-black text-yellow-600">← chọn</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Selection hint */}
        <div className="text-center text-xs font-semibold mb-4 h-4">
          {selectedAns !== null
            ? <span className="text-yellow-700">Đã chọn: <strong>{L[selectedAns]}. {q.opts[selectedAns]}</strong></span>
            : <span className="text-blue-400">👆 Click vào đáp án để chọn, rồi nhấn Xác nhận</span>
          }
        </div>

        {/* Current answering team */}
        <div className="mb-4">
          <div className="text-xs font-bold text-gray-500 mb-2 text-center uppercase tracking-wide">
            Nhóm đang trả lời:
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            {teams.map(t => (
              <button key={t.id}
                className={`px-3 py-1 rounded-full text-sm font-bold border-2 transition-all
                  ${ansTeamId === t.id
                    ? 'bg-red-700 text-white border-red-700 scale-105'
                    : 'bg-white text-red-700 border-red-300 hover:border-red-600'}`}
                onClick={() => setAnsTeamId(t.id)}>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold"
            onClick={() => setShowAnswer(s => !s)}>
            {showAnswer ? '🙈 Ẩn đáp án' : '👁️ Xem đáp án'}
          </button>
          <button
            className={`px-8 py-2.5 font-black rounded-xl text-lg shadow-lg transition-all active:scale-95
              ${canConfirm
                ? 'bg-red-700 hover:bg-red-800 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            onClick={handleConfirm}
            disabled={!canConfirm}>
            ✅ Xác nhận trả lời
          </button>
        </div>

        {!ansTeamId && (
          <div className="text-center text-orange-500 text-xs mt-2 font-semibold">
            ⚠️ Hãy chọn nhóm trả lời trước!
          </div>
        )}

        {/* Steal turn */}
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="text-xs text-gray-400 text-center mb-2">Nhóm khác giành quyền trả lời:</div>
          <div className="flex gap-2 justify-center flex-wrap">
            {teams.filter(t => t.id !== ansTeamId).map(t => (
              <button key={t.id}
                className="px-2 py-1 bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-700 rounded-lg text-xs font-bold"
                onClick={() => setAnsTeamId(t.id)}>
                ⚡ {t.name}
              </button>
            ))}
          </div>
        </div>

        <button className="mt-3 w-full text-gray-400 hover:text-gray-600 text-xs" onClick={onClose}>
          ✕ Đóng câu hỏi
        </button>
      </div>
    </div>
  )
}
