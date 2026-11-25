import { useState } from 'react';
import RoomChecker from '@/components/RoomChecker';
import ContractChecker from '@/components/ContractChecker';

type View = 'p12' | 'catalog';

function App() {
  const [view, setView] = useState<View>('p12');
  const tab = (v: View, label: string) => (
    <button type="button" onClick={() => setView(v)} aria-pressed={view === v}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${view === v ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
      {label}
    </button>
  );
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex gap-2 border-b border-slate-200 bg-white px-4 py-2">
        {tab('p12', 'Practice 12 checker')}
        {tab('catalog', 'Room catalog')}
      </nav>
      {view === 'p12' ? <ContractChecker /> : <RoomChecker />}
    </div>
  );
}

export default App;
