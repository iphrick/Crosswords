import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
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

  // Shared style tokens
  const font = 'Inter, system-ui, sans-serif';
  const cardBg = 'rgba(255,255,255,0.025)';
  const cardBorder = '1px solid rgba(255,255,255,0.06)';
  const labelStyle = { fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.30)', fontFamily: font };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginBottom: '16px' }} />
        <p style={{ ...labelStyle, color: '#34d399', letterSpacing: '0.2em', animation: 'pulse 2s ease-in-out infinite' }}>Carregando Sistema...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: 'rgba(255,255,255,0.85)', fontFamily: font }}>
      <Head>
        <title>JuriQuest | Insights</title>
      </Head>

      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '40px 28px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* ── Header ── */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontFamily: font }}>Central de Insights</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(16,185,129,0.6)' }} />
                <span style={{ ...labelStyle, fontSize: '10px', letterSpacing: '0.2em' }}>Analytics Dashboard</span>
              </div>
            </div>
          </div>
          
          <Link href="/">
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700,
              fontFamily: font, cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Voltar ao Jogo
            </button>
          </Link>
        </header>

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Total */}
          <div style={{
            background: cardBg, border: cardBorder, borderRadius: '20px',
            padding: '28px 24px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
          }}>
            <span style={labelStyle}>Volume Total</span>
            <span style={{ fontSize: '48px', fontWeight: 900, color: '#fff', lineHeight: 1, fontFamily: font, fontVariantNumeric: 'tabular-nums' }}>{total}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', ...labelStyle, marginTop: '4px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
              Registros
            </span>
          </div>

          {/* Positives */}
          <div style={{
            background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '20px',
            padding: '28px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(16,185,129,0.3)' }} />
            <span style={{ ...labelStyle, color: 'rgba(52,211,153,0.6)' }}>Elogios & Ideias</span>
            <span style={{ fontSize: '48px', fontWeight: 900, color: '#34d399', lineHeight: 1, fontFamily: font, fontVariantNumeric: 'tabular-nums' }}>{positives}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(16,185,129,0.08)', ...labelStyle, color: 'rgba(52,211,153,0.7)', marginTop: '4px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              Feedback Positivo
            </span>
          </div>

          {/* Negatives */}
          <div style={{
            background: 'rgba(244,63,94,0.03)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: '20px',
            padding: '28px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(244,63,94,0.3)' }} />
            <span style={{ ...labelStyle, color: 'rgba(251,113,133,0.6)' }}>Críticas & Bugs</span>
            <span style={{ fontSize: '48px', fontWeight: 900, color: '#fb7185', lineHeight: 1, fontFamily: font, fontVariantNumeric: 'tabular-nums' }}>{negatives}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(244,63,94,0.08)', ...labelStyle, color: 'rgba(251,113,133,0.7)', marginTop: '4px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4" stroke="#080c14" fill="none"/><path d="M12 17h.01" stroke="#080c14" fill="none"/></svg>
              Reportes
            </span>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between',
          background: cardBg, border: cardBorder, borderRadius: '20px', padding: '16px 20px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              <span style={{ ...labelStyle, color: 'rgba(255,255,255,0.50)' }}>Filtrar:</span>
            </div>

            <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {[
                { key: 'all', label: 'Todos', color: null },
                { key: 'positive', label: 'Elogios', color: '#10b981' },
                { key: 'negative', label: 'Críticas', color: '#f43f5e' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setSentimentFilter(f.key)}
                  style={{
                    padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    fontSize: '11px', fontWeight: 700, fontFamily: font, transition: 'all 0.25s',
                    background: sentimentFilter === f.key
                      ? (f.color || 'rgba(255,255,255,0.08)')
                      : 'transparent',
                    color: sentimentFilter === f.key
                      ? (f.color ? '#fff' : '#fff')
                      : 'rgba(255,255,255,0.30)',
                    boxShadow: sentimentFilter === f.key && f.color
                      ? `0 4px 16px ${f.color}40`
                      : 'none'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px', padding: '8px 32px 8px 12px',
                color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 700, fontFamily: font,
                outline: 'none', cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center'
              }}
            >
              <option value="desc">Mais Recentes</option>
              <option value="asc">Mais Antigos</option>
            </select>
          </div>
        </div>

        {/* ── Feedbacks Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredFeedbacks.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '80px 24px', textAlign: 'center',
              border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '28px',
              background: 'rgba(255,255,255,0.015)'
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4, #10b981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '24px', boxShadow: '0 0 40px rgba(6,182,212,0.25)'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#080c14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#fff', fontFamily: font }}>Sem feedbacks no momento</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.40)', maxWidth: '360px', lineHeight: 1.6, fontFamily: font }}>
                Tudo limpo por aqui. Aguarde as próximas interações dos usuários.
              </p>
            </div>
          ) : (
            filteredFeedbacks.map(fb => {
              const isPositive = fb.sentiment === 'positive';
              const accentColor = isPositive ? '#10b981' : '#f43f5e';
              const accentText = isPositive ? '#34d399' : '#fb7185';
              const accentBg = isPositive ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)';
              const accentBorder = isPositive ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)';

              return (
                <div key={fb.id} style={{
                  background: cardBg, border: cardBorder, borderRadius: '20px',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                  transition: 'border-color 0.3s, box-shadow 0.3s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${accentColor}30`; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Card Header */}
                  <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '6px 14px', borderRadius: '10px',
                      background: accentBg, border: `1px solid ${accentBorder}`,
                      fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                      letterSpacing: '0.1em', color: accentText, fontFamily: font
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor, boxShadow: `0 0 8px ${accentColor}99` }} />
                      {isPositive ? 'Elogio' : 'Crítica'}
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', ...labelStyle, fontSize: '10px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {fb.createdAt instanceof Date 
                        ? fb.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) 
                        : 'Desconhecida'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '4px 28px 28px', flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', fontFamily: font }}>
                      &ldquo;{fb.message}&rdquo;
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div style={{
                    padding: '20px 24px', background: 'rgba(0,0,0,0.2)',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', gap: '12px'
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: font }}>{fb.email}</p>
                      <p style={{ margin: 0, ...labelStyle, fontSize: '9px', marginTop: '2px' }}>Conta de Usuário</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
