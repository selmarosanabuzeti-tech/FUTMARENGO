
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
  Target,
  Trash2,
  Lock,
  Loader2,
  AlertCircle,
  RefreshCcw,
  AlertTriangle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Participant, AppSettings } from './types';
import { supabase } from './supabase';

const ADMIN_PASSWORD = "PEPO1208";

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ goal: 250, contribution_value: 50 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [passwordInput, setPasswordInput] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch data from Supabase
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Fetch Participants
      const { data: participantsData, error: pError } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (pError) throw pError;
      setParticipants(participantsData || []);

      // Fetch Settings
      const { data: settingsData, error: sError } = await supabase
        .from('settings')
        .select('*');
      
      if (sError) {
        console.warn('Configurações não encontradas ou erro no acesso. Usando padrão.', sError.message);
      } else if (settingsData && settingsData.length > 0) {
        setSettings(settingsData[0]);
      }
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      setErrorMsg(`Erro de conexão: ${error.message || 'Verifique as tabelas no Supabase.'}`);
    } finally {
      setLoading(false);
    }
  }

  const totalPaid = participants
    .filter(p => p.paid)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalPending = participants
    .filter(p => !p.paid)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const progress = settings.goal > 0 ? Math.min((totalPaid / settings.goal) * 100, 100) : 0;

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

  const addParticipant = async (name: string) => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const newParticipant = {
        name,
        amount: settings.contribution_value,
        paid: false
      };

      const { data, error } = await supabase
        .from('participants')
        .insert([newParticipant])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setParticipants(prev => [data[0], ...prev]);
      } else {
        await fetchData();
      }
    } catch (error: any) {
      const msg = `Falha ao adicionar: ${error.message || 'Verifique se a tabela "participants" existe.'}`;
      setErrorMsg(msg);
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const togglePayment = async (participant: Participant) => {
    setErrorMsg(null);
    try {
      const { error } = await supabase
        .from('participants')
        .update({ paid: !participant.paid })
        .eq('id', participant.id);

      if (error) throw error;
      
      setParticipants(participants.map(p => 
        p.id === participant.id ? { ...p, paid: !p.paid } : p
      ));
    } catch (error: any) {
      setErrorMsg(`Erro ao atualizar pagamento: ${error.message}`);
    }
  };

  const removeParticipant = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este participante?")) {
      setErrorMsg(null);
      try {
        const { error } = await supabase
          .from('participants')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setParticipants(participants.filter(p => p.id !== id));
      } catch (error: any) {
        setErrorMsg(`Erro ao remover: ${error.message}`);
      }
    }
  };

  const clearAllParticipants = async () => {
    if (window.confirm("ATENÇÃO: Isso removerá TODOS os participantes da lista. Esta ação não pode ser desfeita. Deseja continuar?")) {
      setActionLoading(true);
      setErrorMsg(null);
      try {
        const { error } = await supabase
          .from('participants')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all matching anything not an empty UUID (essentially all)

        if (error) throw error;
        setParticipants([]);
        alert("Lista limpa com sucesso!");
      } catch (error: any) {
        setErrorMsg(`Erro ao limpar lista: ${error.message}`);
        alert("Erro ao limpar lista.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ id: settings.id, ...updated });

      if (error) console.error('Erro ao salvar configurações:', error.message);
    } catch (e) {
      console.error(e);
    }
  };

  const chartData = [
    { name: 'Pago', value: totalPaid, color: '#10b981' },
    { name: 'Pendente', value: totalPending, color: '#f59e0b' },
    { name: 'Faltante', value: Math.max(0, settings.goal - totalPaid - totalPending), color: '#e5e7eb' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Conectando ao FUT MARENGO...</p>
      </div>
    );
  }

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
                  className="bg-red-600 hover:bg-red-500 p-2 rounded-lg transition-colors shadow-md"
                  title="Sair do Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 text-sm font-medium">{errorMsg}</div>
            <button onClick={fetchData} className="p-1 hover:bg-red-100 rounded transition-colors">
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        )}

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
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden relative shadow-inner">
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
                <span className="text-sm font-medium text-gray-500 bg-gray-200 px-3 py-1 rounded-full">{participants.length} pessoas</span>
              </div>
              <div className="divide-y divide-gray-50">
                {participants.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 italic">
                    Nenhum participante adicionado ainda. ⚽
                  </div>
                ) : (
                  participants.map(participant => (
                    <div key={participant.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${participant.paid ? 'bg-green-500' : 'bg-amber-400'}`}>
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{participant.name}</p>
                          <p className="text-xs text-gray-500">Valor: R$ {Number(participant.amount || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold shadow-sm ${participant.paid ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
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
            onClearAll={clearAllParticipants}
            onUpdateSettings={updateSettings}
            actionLoading={actionLoading}
          />
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
              <Lock className="w-5 h-5 text-green-600" />
              Painel do Administrador
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Digite a Senha</label>
                <input 
                  autoFocus
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="Senha de acesso"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Voltar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
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
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1 font-medium">{subtext}</p>}
    </div>
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
      {icon}
    </div>
  </div>
);

const AdminPanel: React.FC<{
  participants: Participant[];
  settings: AppSettings;
  onAdd: (name: string) => void;
  onToggle: (p: Participant) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
  actionLoading: boolean;
}> = ({ participants, settings, onAdd, onToggle, onRemove, onClearAll, onUpdateSettings, actionLoading }) => {
  const [newName, setNewName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && !actionLoading) {
      onAdd(newName.trim());
      setNewName("");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Configurações Globais */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <Settings className="w-5 h-5 text-green-600" />
            Configurações e Ações
          </h2>
          <button 
            onClick={onClearAll}
            disabled={actionLoading || participants.length === 0}
            className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-4 py-2 rounded-xl transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="w-4 h-4" />
            Limpar Lista Completa
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Meta de Arrecadação (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
              <input 
                type="number"
                value={settings.goal}
                onChange={(e) => onUpdateSettings({ goal: Number(e.target.value) })}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-bold text-gray-700 shadow-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Valor Fixo por Pessoa (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
              <input 
                type="number"
                value={settings.contribution_value}
                onChange={(e) => onUpdateSettings({ contribution_value: Number(e.target.value) })}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-bold text-gray-700 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Adicionar Novo */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
          <Plus className="w-5 h-5 text-green-600" />
          Adicionar Participante
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text"
            required
            disabled={actionLoading}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome completo do jogador"
            className="flex-1 border border-gray-200 bg-gray-50 rounded-xl p-4 outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all disabled:opacity-50 font-medium"
          />
          <button 
            type="submit"
            disabled={actionLoading || !newName.trim()}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 disabled:bg-green-400 disabled:cursor-not-allowed active:scale-95"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {actionLoading ? 'Processando...' : 'Adicionar'}
          </button>
        </form>
      </div>

      {/* Gerenciar Lista */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wider text-sm">
            Gerenciamento da Lista ({participants.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {participants.length === 0 ? (
            <div className="p-10 text-center text-gray-400 italic">Sua lista está vazia no momento.</div>
          ) : (
            participants.map(participant => (
              <div key={participant.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50/50 group gap-4 transition-colors">
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white transition-all shadow-sm ${participant.paid ? 'bg-green-500 rotate-3' : 'bg-gray-200 -rotate-3'}`}>
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg leading-tight">{participant.name}</p>
                    <p className="text-sm font-bold text-gray-400">R$ {Number(participant.amount || 0).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 justify-end">
                  <button 
                    onClick={() => onToggle(participant)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm border ${
                      participant.paid 
                      ? 'bg-green-600 text-white border-green-700 hover:bg-green-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {participant.paid ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {participant.paid ? 'Pago' : 'Marcar Pago'}
                  </button>
                  
                  {/* Botão de Remover MAIS VISÍVEL conforme solicitado */}
                  <button 
                    onClick={() => onRemove(participant.id)}
                    className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm group/del"
                    title="Remover Participante"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="font-bold text-sm">Excluir</span>
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
