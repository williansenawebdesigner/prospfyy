import { useState, useEffect } from 'react';
import { X, Star, MessageCircle, Pencil, Trash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Lead, Comment } from '../types';

interface LeadDetailsModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
}

export function LeadDetailsModal({ lead, onClose, onUpdate }: LeadDetailsModalProps) {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [comments, setComments] = useState<Comment[]>(lead.comments || []);
  const [currentUser, setCurrentUser] = useState<string | undefined>(undefined);

  useEffect(() => {
    getCurrentUser();
    loadComments();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user.id);
    }
  };

  const loadComments = async () => {
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar comentários:', error);
        return;
      }

      setComments(commentsData);
      onUpdate({ ...lead, comments: commentsData });
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('comments')
        .insert([
          {
            lead_id: lead.id,
            content: newComment,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar comentário:', error);
        return;
      }

      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editedContent.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editedContent })
        .eq('id', commentId);

      if (error) {
        console.error('Erro ao editar comentário:', error);
        return;
      }

      setEditingComment(null);
      setEditedContent('');
      await loadComments();
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Erro ao excluir comentário:', error);
        return;
      }

      await loadComments();
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="pr-4">
              <h2 className="text-xl font-bold text-gray-900 break-words">{lead.name}</h2>
              <div className="flex items-center mt-2">
                <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="ml-1 text-gray-600">{lead.rating}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600">{lead.review_count} avaliações</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Informações do Lead */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1 break-words">{lead.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Endereço</p>
                  <p className="mt-1 break-words">{lead.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p className="mt-1 break-words">{lead.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <p className="mt-1 break-all">
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {lead.website}
                      </a>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Comentários */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 flex-shrink-0" />
                Comentários
              </h3>

              {/* Form para adicionar comentário */}
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="flex-1 min-w-0 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                  >
                    Enviar
                  </button>
                </div>
              </form>

              {/* Lista de comentários */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    {editingComment === comment.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="flex-1 min-w-0 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-shrink-0"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setEditingComment(null);
                            setEditedContent('');
                          }}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex-shrink-0"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-800 break-words">{comment.content}</p>
                        <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
                          <span className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                          {currentUser === comment.user_id && (
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingComment(comment.id);
                                  setEditedContent(comment.content);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}