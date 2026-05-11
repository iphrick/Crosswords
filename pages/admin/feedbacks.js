import { useEffect, useState } from 'react';
import Head from 'next/head';
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
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10 font-sans selection:bg-emerald-500/30">
      <Head>
        <title>JuriQuest | Insights</title>
      </Head>

      {/* Modern Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/5 blur-[120px]" />
      </div>

      <div className="max-w-[1320px] mx-auto space-y-10 relative z-10">
        
        {/* Superior Nav */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-800/60">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <Mail className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white mb-1">Central de Insights</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Live Feedback Analytics</p>
              </div>
            </div>
          </div>
          
          <Link href="/">
            <Button variant="outline" className="h-12 px-6 gap-2 bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl transition-all hover:-translate-x-1">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Jogo
            </Button>
          </Link>
        </header>

        {/* KPIs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-md rounded-3xl overflow-hidden group hover:border-slate-700 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Volume Total</CardDescription>
                <MessageSquare className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
              <CardTitle className="text-5xl font-black text-white py-2">{total}</CardTitle>
            </CardHeader>
            <div className="h-1 w-full bg-slate-800/50 mt-2">
              <div className="h-full bg-slate-500 w-[100%]" />
            </div>
          </Card>

          <Card className="bg-emerald-950/10 border-emerald-900/30 backdrop-blur-md rounded-3xl overflow-hidden group hover:border-emerald-800/50 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardDescription className="text-emerald-500/60 font-bold uppercase tracking-widest text-[10px]">Elogios & Ideias</CardDescription>
                <Heart className="w-5 h-5 text-emerald-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <CardTitle className="text-5xl font-black text-emerald-400 py-2">{positives}</CardTitle>
            </CardHeader>
            <div className="h-1 w-full bg-emerald-900/20 mt-2">
              <div className="h-full bg-emerald-500" style={{ width: `${(positives/total)*100}%` }} />
            </div>
          </Card>

          <Card className="bg-red-950/10 border-red-900/30 backdrop-blur-md rounded-3xl overflow-hidden group hover:border-red-800/50 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardDescription className="text-red-500/60 font-bold uppercase tracking-widest text-[10px]">Críticas & Bugs</CardDescription>
                <AlertTriangle className="w-5 h-5 text-red-600 group-hover:text-red-400 transition-colors" />
              </div>
              <CardTitle className="text-5xl font-black text-red-400 py-2">{negatives}</CardTitle>
            </CardHeader>
            <div className="h-1 w-full bg-red-900/20 mt-2">
              <div className="h-full bg-red-500" style={{ width: `${(negatives/total)*100}%` }} />
            </div>
          </Card>
        </div>

        {/* Action Bar (Filters & Sorting) */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-slate-900/40 p-4 rounded-[2rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 rounded-xl border border-slate-800/50">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Filtrar por:</span>
            </div>
            
            <div className="flex p-1 bg-slate-950/50 rounded-xl border border-slate-800/50">
              <button 
                onClick={() => setSentimentFilter('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sentimentFilter === 'all' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setSentimentFilter('positive')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${sentimentFilter === 'positive' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-emerald-400'}`}
              >
                <Heart className="w-3 h-3" /> Elogios
              </button>
              <button 
                onClick={() => setSentimentFilter('negative')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${sentimentFilter === 'negative' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-red-400'}`}
              >
                <AlertTriangle className="w-3 h-3" /> Críticas
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:w-64">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full bg-slate-950/50 border-slate-800/60 text-slate-300 rounded-xl h-11 focus:ring-emerald-500">
                  <div className="flex items-center gap-2 uppercase text-[10px] font-black tracking-widest opacity-60">
                    <Clock className="w-3 h-3" /> Ordem:
                  </div>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 rounded-xl overflow-hidden">
                  <SelectItem value="desc" className="focus:bg-slate-800 focus:text-emerald-400 cursor-pointer py-3">Mais Recentes</SelectItem>
                  <SelectItem value="asc" className="focus:bg-slate-800 focus:text-emerald-400 cursor-pointer py-3">Mais Antigos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Feedbacks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredFeedbacks.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-24 text-center border-2 border-dashed border-slate-800/50 rounded-[3rem] bg-slate-900/20 backdrop-blur-sm">
              <div className="w-20 h-20 bg-slate-800/30 rounded-full flex items-center justify-center mb-6">
                <Inbox className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-300 tracking-tight">Sem feedbacks no momento</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">Tudo limpo por aqui. Aguarde as próximas interações dos usuários.</p>
            </div>
          ) : (
            filteredFeedbacks.map(fb => (
              <Card key={fb.id} className="flex flex-col bg-slate-900/40 border-slate-800/60 rounded-[2rem] hover:border-emerald-500/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 group relative isolate overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                
                <CardHeader className="pb-4 pt-6 px-6">
                  <div className="flex justify-between items-center mb-4">
                    {fb.sentiment === 'positive' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest gap-2">
                        <Heart className="w-3 h-3 fill-current" /> Elogio
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest gap-2">
                        <AlertTriangle className="w-3 h-3 fill-current" /> Crítica
                      </Badge>
                    )}
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      <Clock className="w-3 h-3" />
                      {fb.createdAt instanceof Date 
                        ? fb.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) 
                        : 'Desconhecida'}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow px-7 pb-8 pt-2">
                  <p className="text-[15px] leading-relaxed text-slate-300 font-medium italic">
                    "{fb.message}"
                  </p>
                </CardContent>

                <CardFooter className="p-6 bg-slate-950/40 border-t border-slate-800/50 flex flex-col gap-3">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-700/50">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-black text-slate-300 truncate tracking-tight">{fb.email}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">User Account</p>
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
