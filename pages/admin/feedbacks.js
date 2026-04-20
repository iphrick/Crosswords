import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase-client';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

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
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <p className="animate-pulse">Carregando Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans">
      <Head>
        <title>Admin Dashboard - Feedbacks</title>
      </Head>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel de Feedbacks</h1>
            <p className="text-muted-foreground mt-1">Gerencie as opiniões e reportes dos usuários do JuriQuest</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>
            Voltar ao Jogo
          </Button>
        </header>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={sentimentFilter === 'all' ? 'default' : 'secondary'} 
              onClick={() => setSentimentFilter('all')}
              className="rounded-full"
            >
              Todos
            </Button>
            <Button 
              variant={sentimentFilter === 'positive' ? 'default' : 'secondary'} 
              onClick={() => setSentimentFilter('positive')}
              className={`rounded-full ${sentimentFilter === 'positive' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            >
              Positivos 🟢
            </Button>
            <Button 
              variant={sentimentFilter === 'negative' ? 'default' : 'secondary'} 
              onClick={() => setSentimentFilter('negative')}
              className={`rounded-full ${sentimentFilter === 'negative' ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
              Críticas 🔴
            </Button>
          </div>

          <div className="w-[180px]">
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Mais Recentes</SelectItem>
                <SelectItem value="asc">Mais Antigos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Feedbacks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFeedbacks.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-card/50">
              <span className="text-4xl mb-4">📭</span>
              <h3 className="text-lg font-medium">Nenhum feedback encontrado</h3>
              <p className="text-muted-foreground">Tente alterar os filtros para ver outros resultados.</p>
            </div>
          ) : (
            filteredFeedbacks.map(fb => (
              <Card key={fb.id} className="flex flex-col hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    {fb.sentiment === 'positive' ? (
                      <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-200/20">
                        ELOGIO
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500/15 text-red-500 hover:bg-red-500/25 border-red-200/20">
                        CRÍTICA
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground font-medium">
                      {fb.createdAt instanceof Date 
                        ? fb.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                        : 'Data desconhecida'}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                    {fb.message}
                  </p>
                </CardContent>

                <CardFooter className="pt-3 border-t bg-muted/20 flex-col items-start gap-1">
                  <p className="text-xs font-medium truncate w-full">
                    <span className="text-muted-foreground mr-1">De:</span> 
                    {fb.email}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate w-full" title={fb.uid}>
                    UID: {fb.uid}
                  </p>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
