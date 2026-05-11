import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase-client';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

// Lucide Icons
import { 
  MessageSquare,
  Heart,
  AlertTriangle,
  ArrowLeft,
  Filter,
  Clock,
  User,
  Mail,
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
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      <Head>
        <title>JuriQuest | Insights</title>
      </Head>

      {/* Modern Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/10 blur-[120px]" />
        {/* Subtle Circuit Pattern residue - assuming it's CSS based or handled by global classes */}
      </div>

      <div className="max-w-[1320px] mx-auto space-y-12 relative z-10">
        
        {/* Superior Nav */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 pb-10 border-b border-white/5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <Mail className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white mb-1 leading-none">Central de Insights</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Analytics Dashboard</p>
              </div>
            </div>
          </div>
          
          <Link href="/">
            <Button variant="outline" className="h-14 px-8 gap-3 bg-slate-900/40 border-white/10 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 rounded-2xl transition-all font-bold text-sm">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Jogo
            </Button>
          </Link>
        </header>

        {/* KPIs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-900/60 border-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group hover:border-white/10 transition-all shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-6 pt-8 text-center">
              <CardDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[11px] mb-2">Volume Total</CardDescription>
              <div className="flex flex-col items-center gap-1">
                <CardTitle className="text-6xl font-black text-white tabular-nums">{total}</CardTitle>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                  <MessageSquare className="w-3 h-3" /> Registros
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-emerald-950/10 border-emerald-500/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group hover:border-emerald-500/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] transition-all relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/30" />
            <CardHeader className="pb-6 pt-8 text-center">
              <CardDescription className="text-emerald-400/70 font-black uppercase tracking-[0.2em] text-[11px] mb-2">Elogios & Ideias</CardDescription>
              <div className="flex flex-col items-center gap-1">
                <CardTitle className="text-6xl font-black text-emerald-400 tabular-nums">{positives}</CardTitle>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest mt-2">
                  <Heart className="w-3 h-3 fill-current" /> Feedback Positivo
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-red-950/10 border-red-500/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group hover:border-red-500/40 hover:shadow-[0_0_40px_rgba(239,68,68,0.1)] transition-all relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/30" />
            <CardHeader className="pb-6 pt-8 text-center">
              <CardDescription className="text-red-400/70 font-black uppercase tracking-[0.2em] text-[11px] mb-2">Críticas & Bugs</CardDescription>
              <div className="flex flex-col items-center gap-1">
                <CardTitle className="text-6xl font-black text-red-400 tabular-nums">{negatives}</CardTitle>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full text-[10px] font-bold text-red-400/80 uppercase tracking-widest mt-2">
                  <AlertTriangle className="w-3 h-3 fill-current" /> Reportes de Erro
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Action Bar (Filters & Sorting) */}
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between bg-slate-900/60 p-5 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-950/60 rounded-2xl border border-white/5 shadow-inner">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">Filtragem:</span>
            </div>
            
            <div className="flex p-1.5 bg-slate-950/60 rounded-2xl border border-white/5 gap-1">
              <button 
                onClick={() => setSentimentFilter('all')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sentimentFilter === 'all' ? 'bg-emerald-500 text-slate-950 shadow-[0_4px_20px_rgba(16,185,129,0.3)] scale-105' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setSentimentFilter('positive')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${sentimentFilter === 'positive' ? 'bg-emerald-500 text-slate-950 shadow-[0_4px_20px_rgba(16,185,129,0.3)] scale-105' : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/5'}`}
              >
                <Heart className={`w-3 h-3 ${sentimentFilter === 'positive' ? 'fill-current' : ''}`} /> Elogios
              </button>
              <button 
                onClick={() => setSentimentFilter('negative')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${sentimentFilter === 'negative' ? 'bg-red-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)] scale-105' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/5'}`}
              >
                <AlertTriangle className={`w-3 h-3 ${sentimentFilter === 'negative' ? 'fill-current' : ''}`} /> Críticas
              </button>
            </div>
          </div>

          <div className="w-full lg:w-72">
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full bg-slate-950/60 border-white/10 text-slate-200 rounded-2xl h-12 focus:ring-emerald-500 px-5 shadow-inner">
                <div className="flex items-center gap-3 uppercase text-[10px] font-black tracking-[0.2em] text-emerald-400/70">
                  <Clock className="w-3.5 h-3.5" /> Ordem:
                </div>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-slate-200 rounded-2xl overflow-hidden shadow-2xl">
                <SelectItem value="desc" className="focus:bg-emerald-500 focus:text-slate-950 cursor-pointer py-4 font-bold uppercase text-[10px] tracking-widest">Mias Recentes</SelectItem>
                <SelectItem value="asc" className="focus:bg-emerald-500 focus:text-slate-950 cursor-pointer py-4 font-bold uppercase text-[10px] tracking-widest">Mais Antigos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Feedbacks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {filteredFeedbacks.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32 px-10 text-center border-2 border-dashed border-white/5 rounded-[4rem] bg-slate-900/20 backdrop-blur-sm">
              <div className="w-24 h-24 bg-gradient-to-tr from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-pulse">
                <Inbox className="w-12 h-12 text-slate-950" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-4">Sem feedbacks no momento</h3>
              <p className="text-slate-300 font-medium max-w-sm mx-auto leading-relaxed text-lg">
                Tudo limpo por aqui. Aguarde as próximas interações dos usuários para gerar novos insights.
              </p>
            </div>
          ) : (
            filteredFeedbacks.map(fb => (
              <Card key={fb.id} className="flex flex-col bg-slate-900/50 border-white/5 rounded-[2.5rem] hover:border-emerald-500/20 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-500 group relative isolate overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                
                <CardHeader className="pb-4 pt-8 px-8">
                  <div className="flex justify-between items-center mb-5">
                    {fb.sentiment === 'positive' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2">
                        <Heart className="w-3 h-3 fill-current" /> Elogio
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2">
                        <AlertTriangle className="w-3 h-3 fill-current" /> Crítica
                      </Badge>
                    )}
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" />
                      {fb.createdAt instanceof Date 
                        ? fb.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) 
                        : 'Desconhecida'}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow px-10 pb-10 pt-2">
                  <p className="text-lg leading-relaxed text-slate-200 font-medium italic opacity-90">
                    "{fb.message}"
                  </p>
                </CardContent>

                <CardFooter className="p-8 bg-slate-950/60 border-t border-white/5 flex flex-col gap-4">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0 border border-white/10">
                      <User className="w-5 h-5 text-emerald-400/70" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-black text-white truncate tracking-tight">{fb.email}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">User Profile</p>
                    </div>
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
