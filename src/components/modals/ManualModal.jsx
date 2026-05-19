export default function ManualModal({ teams, onDelta, onClose }) {
  return (
    <div className="modal-bg">
      <div className="bg-white rounded-3xl p-6 mx-4 shadow-2xl" style={{maxWidth:340}}>
        <div className="text-center font-black text-red-800 text-xl mb-4">🔧 Chỉnh điểm thủ công</div>
        {teams.map(t=>(
          <div key={t.id} className="flex items-center gap-3 mb-3">
            <span className="flex-1 font-bold text-gray-700 text-sm">{t.name}{t.shielded?' 🛡️':''}</span>
            <button className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-black" onClick={()=>onDelta(t.id,-1)}>−</button>
            <span className="font-black text-xl text-red-800 w-8 text-center">{t.score}</span>
            <button className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-black" onClick={()=>onDelta(t.id,1)}>+</button>
          </div>
        ))}
        <button className="mt-3 w-full py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl" onClick={onClose}>Xong ✓</button>
      </div>
    </div>
  )
}
