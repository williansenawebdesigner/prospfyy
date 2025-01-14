import { useState } from 'react';
import { X, Star, Globe, Phone, MapPin, Send } from 'lucide-react';
import type { Lead, Comment } from '../types';
import { supabase } from '../lib/supabase';

interface LeadDetailsModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (updatedLead: Lead) => void;
}

export function LeadDetailsModal({ lead, onClose, onUpdate }: LeadDetailsModalProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          lead_id: lead.id,
          content: newComment.trim(),
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const updatedLead = {
        ...lead,
        comments: [...lead.comments, comment as Comment]
      };

      onUpdate(updatedLead);
      setNewComment('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {lead.name}
              </h2>
              <div className="flex items-center gap-1 mt-1 text-gray-500 dark:text-gray-400">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{lead.rating}</span>
                <span className="text-sm">({lead.review_count} avaliações)</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Informações da empresa */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
              <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>{lead.address}</span>
            </div>
            
            {lead.phone && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Phone className="h-5 w-5" />
                <a
                  href={`tel:${lead.phone}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {lead.phone}
                </a>
              </div>
            )}
            
            {lead.website && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Globe className="h-5 w-5" />
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {lead.website}
                </a>
              </div>
            )}
          </div>

          {/* Comentários */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Comentários
            </h3>
            <div className="space-y-4 mb-6">
              {lead.comments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Nenhum comentário ainda.
                </p>
              ) : (
                lead.comments.map(comment => (
                  <div
                    key={comment.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
                  >
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {comment.content}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                      {new Date(comment.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Formulário de novo comentário */}
            <form onSubmit={handleAddComment} className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white resize-none"
                rows={3}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="absolute bottom-3 right-3 p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 