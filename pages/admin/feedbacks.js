import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase-client';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

const ADMIN_EMAIL = 'pedrohenriqueinsec281@gmail.com';

export default function FeedbacksDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (Mais recentes) ou 'asc' (Mais antigos)
  const [sentimentFilter, setSentimentFilter] = useState('all'); // 'all', 'positive', 'negative'

  useEffect(() => {
    if (authLoading) return;
    
    // Check if user is admin
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      router.push('/');
      return;
    }

    fetchFeedbacks();
  }, [user, authLoading, router]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      // Fetching all and sorting/filtering in client for simplicity, 
      // but in a large app we'd do it in the query.
      const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setFeedbacks(data);
    } catch (error) {
      console.error("Erro ao buscar feedbacks:", error);
      alert("Erro de permissão ou falha ao buscar os feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks
    .filter(fb => sentimentFilter === 'all' || fb.sentiment === sentimentFilter)
    .sort((a, b) => {
      if (sortOrder === 'desc') return b.createdAt - a.createdAt;
      return a.createdAt - b.createdAt;
    });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <p>Carregando Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 font-sans">
      <Head>
        <title>Admin Dashboard - Feedbacks</title>
      </Head>

      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Painel de Feedbacks</h1>
            <p className="text-gray-400">Gerencie as opiniões e reportes dos usuários</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
          >
            Voltar ao Jogo
          </button>
        </header>

        {/* Filtros */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSentimentFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sentimentFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            <button 
              onClick={() => setSentimentFilter('positive')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sentimentFilter === 'positive' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Positivos 🟢
            </button>
            <button 
              onClick={() => setSentimentFilter('negative')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sentimentFilter === 'negative' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Críticas 🔴
            </button>
          </div>

          <div>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="desc">Mais Recentes</option>
              <option value="asc">Mais Antigos</option>
            </select>
          </div>
        </div>

        {/* Lista de Feedbacks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFeedbacks.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400 bg-gray-800 rounded-xl border border-gray-700">
              Nenhum feedback encontrado.
            </div>
          ) : (
            filteredFeedbacks.map(fb => (
              <div key={fb.id} className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {fb.sentiment === 'positive' ? (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-bold border border-green-500/30">
                        ELOGIO
                      </span>
                    ) : (
                      <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full font-bold border border-red-500/30">
                        CRÍTICA
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {fb.createdAt instanceof Date 
                      ? fb.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                      : 'Data desconhecida'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-200 flex-grow mb-4 leading-relaxed whitespace-pre-wrap">
                  {fb.message}
                </p>

                <div className="border-t border-gray-700 pt-3 mt-auto">
                  <p className="text-xs text-gray-400 truncate">
                    De: <span className="text-gray-300">{fb.email}</span>
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-1" title={fb.uid}>
                    UID: {fb.uid}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
