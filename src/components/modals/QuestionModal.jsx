import { useState } from 'react'

export default function QuestionModal({ q, teams, ansTeamId, setAnsTeamId, onCorrect, onWrong, onClose }) {
  const [shown, setShown] = useState(false)
  const [picked, setPicked] = useState(null)
  const L = ['A','B','C','D']

  return (
    <div className="modal-bg">
      <div className="bg-white rounded-3xl p-5 w-full mx-3 slide-up" style={{maxWidth:640,maxHeight:'92vh',overflowY:'auto'}}>
        <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-4 mb-4 text-center">
          <div className="text-yellow-300 text-xs font-black tracking-widest mb-1">CÂU HỎI</div>
          <div className="text-white font-black text-lg leading-snug">{q.q}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {q.opts.map((opt,i)=>(
            <div key={i}
              className={`rounded-xl p-3 cursor-pointer border-2 transition-all text-sm font-medium
                ${shown&&i===q.ans?'bg-green-50 border-green-500 text-green-800':''}
                ${shown&&picked===i&&i!==q.ans?'bg-red-50 border-red-400 text-red-700':''}
                ${!shown&&picked===i?'bg-yellow-50 border-yellow-400':''}
                ${picked!==i&&!(shown&&i===q.ans)?'bg-gray-50 border-gray-200 hover:border-red-300':''}`}
              onClick={()=>setPicked(i)}>
              <span className="font-black text-red-700 mr-1">{L[i]}.</span>{opt}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="text-xs font-bold text-gray-500 mb-2 text-center uppercase tracking-wide">Nhóm trả lời:</div>
          <div className="flex gap-2 justify-center flex-wrap">
            {teams.map(t=>(
              <button key={t.id}
                className={`px-3 py-1 rounded-full text-sm font-bold border-2 transition-all
                  ${ansTeamId===t.id?'bg-red-700 text-white border-red-700':'bg-white text-red-700 border-red-300 hover:border-red-600'}`}
                onClick={()=>setAnsTeamId(t.id)}>{t.name}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold"
            onClick={()=>setShown(s=>!s)}>{shown?'🙈 Ẩn đáp án':'👁️ Xem đáp án'}</button>
          <button
            className={`px-6 py-2 font-black rounded-xl text-lg shadow transition-all active:scale-95
              ${ansTeamId?'bg-green-500 hover:bg-green-600 text-white':'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            onClick={()=>{if(ansTeamId) onCorrect()}}>✅ ĐÚNG</button>
          <button
            className={`px-6 py-2 font-black rounded-xl text-lg shadow transition-all active:scale-95
              ${ansTeamId?'bg-red-500 hover:bg-red-600 text-white':'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            onClick={()=>{if(ansTeamId) onWrong()}}>❌ SAI</button>
        </div>

        {!ansTeamId && <div className="text-center text-orange-500 text-xs mt-2 font-semibold">⚠️ Hãy chọn nhóm trả lời trước!</div>}

        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="text-xs text-gray-400 text-center mb-2">Nhóm khác giành quyền trả lời:</div>
          <div className="flex gap-2 justify-center flex-wrap">
            {teams.filter(t=>t.id!==ansTeamId).map(t=>(
              <button key={t.id}
                className="px-2 py-1 bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-700 rounded-lg text-xs font-bold"
                onClick={()=>setAnsTeamId(t.id)}>⚡ {t.name}</button>
            ))}
          </div>
        </div>

        <button className="mt-3 w-full text-gray-400 hover:text-gray-600 text-xs" onClick={onClose}>✕ Đóng câu hỏi</button>
      </div>
    </div>
  )
}
