// pages/api/seed-questions.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase-admin';

const API_KEY = process.env.GEMINI_API_KEY;
const SEED_SECRET = process.env.SEED_SECRET;
const MODEL_NAME = 'gemini-2.0-flash';

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: MODEL_NAME }) : null;

const SUBJECT_SOURCES = {
  'Direito Constitucional': { name: 'Constituição Federal de 1988', url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm' },
  'Direito Penal': { name: 'Código Penal (Decreto-Lei nº 2.848/1940)', url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm' },
  'Direito Civil': { name: 'Código Civil (Lei nº 10.406/2002)', url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm' },
  'Direito do Trabalho': { name: 'CLT (Decreto-Lei nº 5.452/1943)', url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm' },
  'Direito Administrativo': { name: 'Lei nº 9.784/1999 e Lei nº 14.133/2021', url: 'http://www.planalto.gov.br/ccivil_03/leis/l9784.htm' },
  'Direito Tributário': { name: 'Código Tributário Nacional (Lei nº 5.172/1966)', url: 'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm' },
  'Direito Previdenciário - Custeio': { name: 'Lei nº 8.212/1991', url: 'https://www.planalto.gov.br/ccivil_03/leis/l8212cons.htm' },
  'Direito Previdenciário - Benefícios': { name: 'Lei nº 8.213/1991', url: 'https://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm' },
};

function sanitizeAnswer(text) {
  if (typeof text !== 'string') return '';
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '').toUpperCase();
}

function buildPrompt(subject, level, numWords, previousWords) {
  const source = SUBJECT_SOURCES[subject] || { name: `legislação sobre ${subject}`, url: 'https://www.planalto.gov.br' };
  const avoidClause = previousWords.length > 0
    ? `5. **Evitar Repetição**: Não repita: ${previousWords.slice(-50).join(', ')}.`
    : '';
  return `
Você é um assistente de IA especialista em Direito brasileiro, criando um jogo de palavras cruzadas educativo.
Gere ${numWords} pares de pergunta e resposta para o tema "${subject}".

Instruções:
1. Baseie TODAS as perguntas na legislação: ${source.name} (${source.url}).
2. Nível ${level}: quanto maior, mais específicos os termos.
3. Pergunta clara e concisa baseada estritamente no texto da lei.
4. Resposta: uma única palavra, 2-10 letras, sem acentos, espaços ou hífens.
5. **CRÍTICO**: A PERGUNTA NUNCA DEVE CONTER A PALAVRA DA RESPOSTA. Use sinônimos, definições ou referências indiretas.
${avoidClause}
6. Formato de saída: lista de "PERGUNTA|RESPOSTA". Nenhum texto extra.

Exemplo Correto:
Recurso contra decisão de juiz de primeiro grau|APELACAO (Certo)
O que é uma APELACAO?|APELACAO (ERRADO - contém a resposta)
  `.trim();
}

function parseResponse(text) {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.includes('|'))
    .map(line => {
      const [question, rawAnswer] = line.split('|');
      if (!question || !rawAnswer) return null;
      const answer = sanitizeAnswer(rawAnswer);

      // Validação: A pergunta não pode conter a resposta
      const sanitizedQuestion = question.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      if (sanitizedQuestion.includes(answer)) return null;

      if (answer.length >= 2 && answer.length <= 10 && /^[A-Z]+$/.test(answer)) {
        return { question: question.trim(), answer };
      }
      return null;
    })
    .filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { secret, subject = 'Direito Geral', level = 1, previous_words = [] } = req.body;
  if (!SEED_SECRET || secret !== SEED_SECRET) return res.status(401).json({ error: 'Não autorizado.' });
  if (!API_KEY || !model || !db) return res.status(500).json({ error: 'Configuração incompleta no servidor.' });

  const parsedLevel = parseInt(level, 10);
  if (isNaN(parsedLevel) || parsedLevel < 1) return res.status(400).json({ error: 'Nível inválido.' });

  try {
    const prompt = buildPrompt(subject, parsedLevel, 20, previous_words);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = parseResponse(text);

    if (data.length === 0) return res.status(500).json({ error: 'IA retornou formato inválido.' });

    const batch = db.batch();

    // Caminho hierárquico: subjects/[materia]/levels/[nivel]/questions/[id]
    const subjectDoc = db.collection('questions_v2').doc(subject);
    const levelDoc = subjectDoc.collection('levels').doc(parsedLevel.toString());
    const questionsColl = levelDoc.collection('items');

    data.forEach(item => {
      const id = item.answer.toUpperCase();
      const ref = questionsColl.doc(id);
      batch.set(ref, {
        ...item,
        subject,
        level: parsedLevel,
        length: item.answer.length,
        createdAt: new Date()
      });
    });

    await batch.commit();

    return res.status(200).json({
      success: true,
      dataCount: data.length,
      message: `${data.length} perguntas salvas com sucesso para '${subject}' nível ${parsedLevel}.`
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
