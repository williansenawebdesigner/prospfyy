import { useState, useEffect } from 'react';
import { Loader2, PieChart, TrendingUp, Users, Calendar, Building2, Search, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types';
import { LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Area } from 'recharts';

interface SearchHistory {
  id: string;
  query: string;
  results_count: number;
  created_at: string;
  user_id: string;
}

interface PieChartLabelProps {
  name: string;
  percent: number;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    leadsAtivos: 0,
    leadsFechados: 0,
    leadsPerdidos: 0,
    taxaConversao: 0,
    mediaAvaliacoes: 0
  });
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [leadsByStatus, setLeadsByStatus] = useState<{ name: string; value: number }[]>([]);
  const [leadsTrend, setLeadsTrend] = useState<{ data: string; total: number }[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      const leads = leadsData as Lead[];

      // Calcular estatísticas
      const totalLeads = leads.length;
      const leadsFechados = leads.filter(lead => lead.status === 'Fechado').length;
      const leadsPerdidos = leads.filter(lead => lead.status === 'Perdido').length;
      const leadsAtivos = totalLeads - leadsFechados - leadsPerdidos;
      const taxaConversao = totalLeads > 0 ? (leadsFechados / totalLeads) * 100 : 0;
      const mediaAvaliacoes = leads.reduce((acc, lead) => acc + lead.rating, 0) / totalLeads || 0;

      setStats({
        totalLeads,
        leadsAtivos,
        leadsFechados,
        leadsPerdidos,
        taxaConversao,
        mediaAvaliacoes
      });

      // Calcular leads por status para o gráfico de pizza
      const statusCount = leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setLeadsByStatus(
        Object.entries(statusCount).map(([name, value]) => ({
          name,
          value
        }))
      );

      // Calcular tendência de leads por dia
      const leadsByDay = leads.reduce((acc, lead) => {
        const date = new Date(lead.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      setLeadsTrend(
        last7Days.map(date => ({
          data: date,
          total: leadsByDay[date] || 0
        }))
      );

      // Carregar histórico de pesquisas
      const { data: searchData, error: searchError } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (searchError) throw searchError;
      setSearchHistory(searchData);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#EAB308', '#22C55E', '#EF4444'];

  return (
    <div className="p-8">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total de Leads */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total de Leads
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalLeads}
              </h3>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>{stats.leadsAtivos} ativos</span>
            </div>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Taxa de Conversão
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.taxaConversao.toFixed(1)}%
              </h3>
            </div>
            <PieChart className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center text-green-500">
              <Building2 className="h-4 w-4 mr-1" />
              <span>{stats.leadsFechados} leads fechados</span>
            </div>
          </div>
        </div>

        {/* Média de Avaliações */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Média de Avaliações
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.mediaAvaliacoes.toFixed(1)}
              </h3>
            </div>
            <Calendar className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center text-red-500">
              <Building2 className="h-4 w-4 mr-1" />
              <span>{stats.leadsPerdidos} leads perdidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tendência de Leads */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tendência de Leads
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadsTrend} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <XAxis 
                  dataKey="data" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                  }}
                  axisLine={false}
                  tickLine={false}
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Leads']}
                  labelFormatter={(label: string) => {
                    const date = new Date(label);
                    return date.toLocaleDateString('pt-BR', { 
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <defs>
                  <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#leadGradient)"
                  dot={false}
                  activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição por Status */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição por Status
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={leadsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: PieChartLabelProps) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leadsByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Leads']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Histórico de Pesquisas */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Histórico de Pesquisas
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Últimas pesquisas realizadas
          </p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {searchHistory.map((search) => (
            <div key={search.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {search.query}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(search.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {search.results_count} resultados
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 