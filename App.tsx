
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  DollarSign, 
  Settings, 
  Plus, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  ChevronRight,
  Target,
  Trash2,
  Lock
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Participant, AppSettings } from './types';

const ADMIN_PASSWORD = "PEPO1208";
const STORAGE_KEY = "fut_marengo_data";

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ goal: 250, contributionValue: 50 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [passwordInput, setPasswordInput] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  // Persistence
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const { participants: savedParticipants, settings: savedSettings } = JSON.parse(savedData);
      setParticipants(savedParticipants || []);
      setSettings(savedSettings || { goal: 250, contributionValue: 50 });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ participants, settings }));
  }, [participants, settings]);

  const totalPaid = participants
    .filter(p => p.paid)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPending = participants
    .filter(p => !p.paid)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const progress = Math.min((totalPaid / settings.goal) * 100, 100);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setView('admin');
      setShowLogin(false);
      setPasswordInput("");
    } else {
      alert("Senha incorreta!");
    }
  };

  const addParticipant = (name: string) => {
    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name,
      amount: settings.contributionValue,
      paid: false,
      createdAt: Date.now()
    };
    setParticipants([...participants, newParticipant]);
  };

  const togglePayment = (id: string) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, paid: !p.paid } : p
    ));
  };

  const removeParticipant = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este participante?")) {
      setParticipants(participants.filter(p => p.id !== id));
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const chartData = [
    { name: 'Pago', value: totalPaid, color: '#10b981' },
    { name: 'Pendente', value: totalPending, color: '#f59e0b' },
    { name: 'Faltante para Meta', value: Math.max(0, settings.goal - totalPaid - totalPending), color: '#e5e7eb' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('public')}>
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-2xl font-bold tracking-tight">FUT MARENGO</h1>
          </div>
          <div className="flex gap-2">
            {!isAdmin ? (
              <button 
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <Lock className="w-4 h-4" /> Admin
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setView(view === 'admin' ? 'public' : 'admin')}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  {view === 'admin' ? <Users className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                  {view === 'admin' ? 'Ver Público' : 'Painel Admin'}
                </button>
                <button 
                  onClick={() => { setIsAdmin(false); setView('public'); }}
                  className="bg-red-600 hover:bg-red-500 p-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {view === 'public' ? (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                title="Total Arrecadado" 
                value={`R$ ${totalPaid.toFixed(2)}`} 
                icon={<DollarSign className="text-green-600" />}
                subtext={`Meta: R$ ${settings.goal}`}
              />
              <StatCard 
                title="Participantes" 
                value={participants.length.toString()} 
                icon={<Users className="text-blue-600" />}
                subtext={`${participants.filter(p => p.paid).length} confirmados`}
              />
              <StatCard 
                title="Status da Meta" 
                value={`${progress.toFixed(0)}%`} 
                icon={<Target className="text-purple-600" />}
                subtext={progress >= 100 ? "Meta batida! ⚽" : "Quase lá!"}
              />
            </div>

            {/* Progress Visualization */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Progresso da Vaquinha
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden relative">
                   <div 
                    className="bg-green-500 h-full transition-all duration-1000 ease-out flex items-center justify-end pr-4"
                    style={{ width: `${progress}%` }}
                   >
                     <span className="text-xs font-bold text-white drop-shadow-sm">{progress.toFixed(0)}%</span>
                   </div>
                </div>
                <div className="flex justify-between mt-2 text-sm font-medium text-gray-500">
                  <span>R$ 0</span>
                  <span>R$ {settings.goal}</span>
                </div>
              </div>

              <div className="w-full md:w-1/2 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Public List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-700 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Lista de Participantes
                </h2>
                <span className="text-sm text-gray-500">{participants.length} pessoas</span>
              </div>
              <div className="divide-y divide-gray-50">
                {participants.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    Nenhum participante adicionado ainda.
                  </div>
                ) : (
                  participants
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map(participant => (
                    <div key={participant.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${participant.paid ? 'bg-green-500' : 'bg-amber-400'}`}>
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{participant.name}</p>
                          <p className="text-xs text-gray-500">Valor: R$ {participant.amount.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${participant.paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {participant.paid ? (
                          <><CheckCircle className="w-4 h-4" /> Pago</>
                        ) : (
                          <><XCircle className="w-4 h-4" /> Pendente</>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <AdminPanel 
            participants={participants}
            settings={settings}
            onAdd={addParticipant}
            onToggle={togglePayment}
            onRemove={removeParticipant}
            onUpdateSettings={updateSettings}
          />
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              Acesso Restrito
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha de Admin</label>
                <input 
                  autoFocus
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; subtext?: string }> = ({ title, value, icon, subtext }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
    <div className="p-3 bg-gray-50 rounded-xl">
      {icon}
    </div>
  </div>
);

const AdminPanel: React.FC<{
  participants: Participant[];
  settings: AppSettings;
  onAdd: (name: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
}> = ({ participants, settings, onAdd, onToggle, onRemove, onUpdateSettings }) => {
  const [newName, setNewName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName("");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          Configurações da Vaquinha
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Total (R$)</label>
            <input 
              type="number"
              value={settings.goal}
              onChange={(e) => onUpdateSettings({ goal: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor por Cabeça (R$)</label>
            <input 
              type="number"
              value={settings.contributionValue}
              onChange={(e) => onUpdateSettings({ contributionValue: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-green-600" />
          Adicionar Participante
        </h2>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome completo do participante"
            className="flex-1 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
          />
          <button 
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            Adicionar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-bold text-gray-700">Gerenciar Participantes</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {participants.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Ninguém na lista.</div>
          ) : (
            participants
              .sort((a, b) => b.createdAt - a.createdAt)
              .map(participant => (
              <div key={participant.id} className="p-4 flex items-center justify-between hover:bg-gray-50 group">
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors ${participant.paid ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{participant.name}</p>
                    <p className="text-xs text-gray-500">R$ {participant.amount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onToggle(participant.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                      participant.paid 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {participant.paid ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {participant.paid ? 'Pago' : 'Marcar Pago'}
                  </button>
                  <button 
                    onClick={() => onRemove(participant.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
