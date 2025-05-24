import { useState, useEffect } from 'react';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('entries');
    return saved ? JSON.parse(saved) : [];
  });
  const [name, setName] = useState('');
  const [initiative, setInitiative] = useState('');
  const [type, setType] = useState('player');
  const [round, setRound] = useState(1);
  const [turnIndex, setTurnIndex] = useState(0);
  const [savedNames, setSavedNames] = useState(() => {
    const saved = localStorage.getItem('savedNames');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('savedNames', JSON.stringify(savedNames));
  }, [savedNames]);

  useEffect(() => {
    localStorage.setItem('entries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!name || isNaN(parseInt(initiative))) return;

    const newEntry = {
      id: Date.now(),
      name,
      initiative: parseInt(initiative),
      type,
      conditions: []
    };

    setEntries(prev => [...prev, newEntry].sort((a, b) => b.initiative - a.initiative));

    if (type === 'player' && !savedNames.includes(name)) {
      setSavedNames(prev => [...prev, name]);
    }

    setName('');
    setInitiative('');
    setType('player');
    if (window.innerWidth < 768 || sidebarOpen) setSidebarOpen(false);
  };

  const nextTurn = () => {
    if (entries.length === 0) return;
    setTurnIndex(prev => {
      const nextIndex = (prev + 1) % entries.length;
      if (nextIndex === 0) setRound(r => r + 1);
      return nextIndex;
    });
  };

  const prevTurn = () => {
    if (entries.length === 0) return;
    setTurnIndex(prev => {
      const newIndex = (prev - 1 + entries.length) % entries.length;
      if (newIndex === entries.length - 1) {
        setRound(r => Math.max(1, r - 1));
      }
      return newIndex;
    });
  };

  const removeEntry = id => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    if (turnIndex >= entries.length - 1) {
      setTurnIndex(0);
      setRound(1);
    }
  };

  const endEncounter = () => {
    setEntries([]);
    setTurnIndex(0);
    setRound(1);
  };

  const toggleCondition = (id, condition) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id !== id) return entry;
      const hasCondition = entry.conditions.includes(condition);
      return {
        ...entry,
        conditions: hasCondition
          ? entry.conditions.filter(c => c !== condition)
          : [...entry.conditions, condition]
      };
    }));
  };

  const conditionDescriptions = {
    Blinded: "Can't see and fails any ability check requiring sight.",
    Charmed: "Can't attack the charmer or target them with harmful abilities.",
    Deafened: "Can't hear and automatically fails any check requiring hearing.",
    Fatigued: "Suffers level-based penalties.",
    Frightened: "Disadvantage on checks and attacks while source is in sight.",
    Grappled: "Speed becomes 0.",
    Incapacitated: "Can't take actions or reactions.",
    Invisible: "Can't be seen without magic or special sense.",
    Paralyzed: "Incapacitated and fails Strength/Dex saves. Auto crit within 5ft.",
    Petrified: "Transformed into stone; immune to all effects.",
    Poisoned: "Disadvantage on attack rolls and ability checks.",
    Prone: "Must crawl; disadvantage on attacks; attackers within 5ft have advantage.",
    Restrained: "Speed = 0; disadvantage on Dex saves; attacks have disadvantage.",
    Stunned: "Incapacitated, can't move, and can barely speak.",
    Unconscious: "Incapacitated, can't move/speak, unaware of surroundings.",
    Exhaustion: "Imposes cumulative penalties.",
    Bloodied: "At or below 50% HP."
  };

  return (
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setSidebarOpen(false)}></div>}
      <div className="relative flex min-h-screen w-screen bg-[#fdf6e3] gap-4 px-4 py-4" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/paper-fibers.png)', fontFamily: 'Papyrus, fantasy' }}>
      {/* Left Sidebar */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute top-4 left-4 z-50 bg-[#8b5e3c] text-white px-3 py-1 rounded shadow-md">☰</button>
      <div className={`absolute top-0 left-0 w-64 h-full bg-[#f6e4b0] border-r-4 border-[#a47149] shadow-2xl overflow-auto transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} p-4 z-40`}>

        <h1 className="text-xl font-bold text-[#4b2e20] text-center mb-3">🛡️ Initiative</h1>
        <div className="flex flex-col gap-2 mb-4">
          <select value={name} onChange={e => setName(e.target.value)} className="border border-[#8b5e3c] p-2 rounded">
            <option value="">Select Name</option>
            {savedNames.map((savedName, index) => (
              <option key={index} value={savedName}>{savedName}</option>
            ))}
          </select>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Or Enter New Name" className="border border-[#8b5e3c] p-2 rounded" />
          <input type="number" value={initiative} onChange={e => setInitiative(e.target.value)} placeholder="Initiative" className="border border-[#8b5e3c] p-2 rounded" />
          <select value={type} onChange={e => setType(e.target.value)} className="border border-[#8b5e3c] p-2 rounded">
            <option value="player">Player</option>
            <option value="monster">Monster</option>
          </select>
          <button onClick={addEntry} title="Add this character to initiative" className="bg-[#8b5e3c] text-white px-4 py-2 rounded shadow">➕ Add</button>
        </div>

        <div className="text-center text-base font-semibold mb-2">📜 Round: {round}</div>

        <ul className="space-y-3">
          {entries.map((entry, idx) => (
            <li key={entry.id} className="p-2 border rounded" style={{ backgroundColor: idx === turnIndex ? '#ffeb3b' : '#fefefe', animation: idx === turnIndex ? 'pulse 1s infinite alternate' : 'none', fontWeight: idx === turnIndex ? 'bold' : 'normal', borderColor: '#8b5e3c', borderWidth: idx === turnIndex ? '3px' : '1px' }}>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{entry.type === 'player' ? '🧝' : '🐉'} {entry.name}</span>
                <button onClick={() => removeEntry(entry.id)} className="ml-auto text-red-700 hover:underline">❌ Remove</button>
              </div>
              <div className="text-xs text-gray-600">Conditions: {entry.conditions.length > 0 ? entry.conditions.join(', ') : 'None'}</div>
              <div className="mt-1 flex gap-2 flex-wrap">
                {["Blinded", "Charmed", "Deafened", "Fatigued", "Frightened", "Grappled", "Incapacitated", "Invisible", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious", "Exhaustion", "Bloodied"].map(cond => (
                  <button key={cond} onClick={() => toggleCondition(entry.id, cond)} title={conditionDescriptions[cond]} className={`text-xs px-2 py-1 rounded border ${entry.conditions.includes(cond) ? 'bg-red-200' : 'bg-gray-200'}`}>{cond}</button>
                ))}
              </div>
            </li>
          ))}
        </ul>

        {entries.length > 0 && (
          <div className="flex justify-center gap-4 mt-6">
            <button onClick={prevTurn} title="Move to previous turn" className="bg-blue-800 text-white px-5 py-2 rounded shadow">⏮️ Previous Turn</button>
            <button onClick={nextTurn} title="Move to next turn" className="bg-green-800 text-white px-5 py-2 rounded shadow">⏭️ Next Turn</button>
            <button onClick={endEncounter} title="Clear all entries and reset combat" className="bg-red-800 text-white px-5 py-2 rounded shadow">🧹 End Encounter</button>
          </div>
        )}
      </div>

      {/* Center Status Panel */}
      <div className={`flex-1 h-screen flex items-center justify-center bg-[#fffef9] overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'pl-64' : ''}`}>
        <div className="p-6 border rounded bg-yellow-50 text-sm text-gray-800 shadow text-center max-w-md w-full">
          <h3 className="text-lg font-semibold mb-2">📋 Status Panel (Current Turn)</h3>
          {entries.length > 0 && entries[turnIndex] ? (
            <ul className="list-disc list-inside text-left">
              <li><strong>Name:</strong> {entries[turnIndex].name}</li>
              <li><strong>Type:</strong> {entries[turnIndex].type}</li>
              <li><strong>Initiative:</strong> {entries[turnIndex].initiative}</li>
              <li><strong>Conditions:</strong> {entries[turnIndex].conditions.length > 0 ? entries[turnIndex].conditions.join(', ') : 'None'}</li>
            </ul>
          ) : (
            <p>No character selected.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
