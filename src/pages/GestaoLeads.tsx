import { useState, useEffect } from 'react';
import { Loader2, PieChart, TrendingUp, Users, Calendar, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LeadKanban } from '../components/LeadKanban';
import type { Lead } from '../types';

export function GestaoLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    leadsAtivos: 0,
    leadsFechados: 0,
    leadsPerdidos: 0,
    taxaConversao: 0,
    mediaAvaliacoes: 0
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: leadsData, error } = await supabase
        .from('leads')
        .select(`
          *,
          comments (
            id,
            content,
            created_at,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar leads:', error);
        return;
      }

      const leads = leadsData as Lead[];
      setLeads(leads);

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

    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadUpdate = async (updatedLead: Lead) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: updatedLead.status })
        .eq('id', updatedLead.id);

      if (error) {
        console.error('Erro ao atualizar lead:', error);
        return;
      }

      setLeads(currentLeads => 
        currentLeads.map(lead => 
          lead.id === updatedLead.id ? updatedLead : lead
        )
      );

      // Atualizar estatísticas
      const totalLeads = leads.length;
      const leadsFechados = leads.filter(lead => 
        lead.id === updatedLead.id ? updatedLead.status === 'Fechado' : lead.status === 'Fechado'
      ).length;
      const leadsPerdidos = leads.filter(lead => 
        lead.id === updatedLead.id ? updatedLead.status === 'Perdido' : lead.status === 'Perdido'
      ).length;
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
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Dashboard */}
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

      {/* Kanban */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Gestão de Leads
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Acompanhe e gerencie seus leads em diferentes estágios
          </p>
        </div>
        <div className="p-6">
          <LeadKanban 
            leads={leads} 
            onLeadUpdate={handleLeadUpdate}
          />
        </div>
      </div>
    </div>
  );
}
