import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase-client';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

// Lucide Icons
import { 
  MessageSquareHeart, 
  AlertTriangle, 
  MessageSquare, 
  ArrowLeft, 
  Filter, 
  CalendarClock,
  User,
  Inbox
} from 'lucide-react';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ADMIN_EMAIL = 'pedrohenriqueinsec281@gmail.com';

export default function FeedbacksDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [sortOrder, setSortOrder] = useState('desc'); 
  const [sentimentFilter, setSentimentFilter] = useState('all'); 

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      router.push('/');
      return;
    }
    fetchFeedbacks();
  }, [user, authLoading, router]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
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

  // KPIs
  const total = feedbacks.length;
  const positives = feedbacks.filter(f => f.sentiment === 'positive').length;
  const negatives = feedbacks.filter(f => f.sentiment === 'negative').length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse tracking-widest uppercase text-sm font-semibold text-emerald-400">Carregando Sistema...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.1),rgba(255,255,255,0))]">
      <Head>
        <title>JuriQuest | Insights</title>
      </Head>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Superior Nav */}
        <nav className="flex justify-between items-center pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Inbox className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Central de Insights</h1>
              <p className="text-sm text-slate-400">Visão analítica de experiência do usuário</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4" /> Voltar ao Jogo
          </Button>
        </nav>

        {/* KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <MessageSquare className="w-16 h-16" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 font-medium">Total de Feedbacks</CardDescription>
              <CardTitle className="text-4xl text-white">{total}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-emerald-950/20 border-emerald-900/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <MessageSquareHeart className="w-16 h-16 text-emerald-400" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-400/80 font-medium">Elogios & Ideias</CardDescription>
              <CardTitle className="text-4xl text-emerald-400">{positives}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-red-950/20 border-red-900/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertTriangle className="w-16 h-16 text-red-400" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-red-400/80 font-medium">Críticas & Reportes</CardDescription>
              <CardTitle className="text-4xl text-red-400">{negatives}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Action Bar (Filters & Sorting) */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 text-slate-400 border-r border-slate-700 mr-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtrar:</span>
            </div>
            
            <Button 
              variant={sentimentFilter === 'all' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setSentimentFilter('all')}
              className={sentimentFilter === 'all' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}
            >
              Todos os {total}
            </Button>
            <Button 
              variant={sentimentFilter === 'positive' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setSentimentFilter('positive')}
              className={sentimentFilter === 'positive' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-slate-400 hover:text-emerald-400'}
            >
              <MessageSquareHeart className="w-4 h-4 mr-2" /> Positivos
            </Button>
            <Button 
              variant={sentimentFilter === 'negative' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setSentimentFilter('negative')}
              className={sentimentFilter === 'negative' ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'text-slate-400 hover:text-red-400'}
            >
              <AlertTriangle className="w-4 h-4 mr-2" /> Críticas
            </Button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <CalendarClock className="w-4 h-4 text-slate-400 hidden sm:block" />
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full md:w-[180px] bg-slate-950 border-slate-700 text-slate-300 focus:ring-emerald-500">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                <SelectItem value="desc" className="focus:bg-slate-800 focus:text-white cursor-pointer">Mais Recentes</SelectItem>
                <SelectItem value="asc" className="focus:bg-slate-800 focus:text-white cursor-pointer">Mais Antigos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Feedbacks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeedbacks.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
              <Inbox className="w-16 h-16 text-slate-700 mb-4" />
              <h3 className="text-xl font-medium text-slate-300">Caixa Vazia</h3>
              <p className="text-slate-500 mt-2">Nenhum feedback corresponde a estes filtros no momento.</p>
            </div>
          ) : (
            filteredFeedbacks.map(fb => (
              <Card key={fb.id} className="flex flex-col bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 group">
                <CardHeader className="pb-4 border-b border-slate-800/50">
                  <div className="flex justify-between items-center">
                    {fb.sentiment === 'positive' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1 gap-1">
                        <MessageSquareHeart className="w-3 h-3" /> Elogio
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-1 gap-1">
                        <AlertTriangle className="w-3 h-3" /> Crítica
                      </Badge>
                    )}
                    <span className="text-[11px] text-slate-500 font-medium tracking-wider uppercase">
                      {fb.createdAt instanceof Date 
                        ? fb.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(' de ', '/') 
                        : 'Desconhecida'}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow pt-5">
                  <p className="text-[15px] leading-relaxed text-slate-300 whitespace-pre-wrap group-hover:text-slate-200 transition-colors">
                    "{fb.message}"
                  </p>
                </CardContent>

                <CardFooter className="pt-4 pb-4 border-t border-slate-800/50 bg-slate-950/30 flex-col items-start gap-2">
                  <div className="flex items-center gap-2 w-full text-slate-400">
                    <User className="w-4 h-4 text-slate-500 shrink-0" />
                    <p className="text-xs font-medium truncate w-full">
                      {fb.email}
                    </p>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <p className="text-[10px] text-slate-600 font-mono truncate w-full" title={fb.uid}>
                      ID: {fb.uid}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
