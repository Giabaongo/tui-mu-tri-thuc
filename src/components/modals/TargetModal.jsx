export default function TargetModal({ teams, excludeId, reward, onSelect, onClose }) {
  return (
    <div className="modal-bg">
      <div className="bg-white rounded-3xl p-5 mx-4 slide-up text-center shadow-2xl" style={{maxWidth:380}}>
        <div style={{fontSize:48}}>{reward.emoji}</div>
        <div className="font-black text-red-800 text-xl mt-1">{reward.label}</div>
        <div className="text-gray-500 text-sm mt-1 mb-4">{reward.desc}</div>
        <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Chọn nhóm mục tiêu:</div>
        <div className="grid grid-cols-2 gap-2">
          {teams.filter(t=>t.id!==excludeId).map(t=>(
            <button key={t.id}
              className="p-3 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-500 rounded-xl font-bold text-red-800 transition-all active:scale-95"
              onClick={()=>onSelect(t.id)}>
              <div className="text-sm">{t.name}</div>
              <div className="text-3xl font-black">{t.score}</div>
              <div className="text-xs text-gray-400">điểm{t.shielded?' 🛡️':''}</div>
            </button>
          ))}
        </div>
        <button className="mt-4 text-gray-400 hover:text-gray-600 text-sm" onClick={onClose}>Hủy</button>
      </div>
    </div>
  )
}
