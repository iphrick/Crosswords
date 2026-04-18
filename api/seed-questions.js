import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './lib/firebase'; // Importa a conexão com o Firestore

// 1. Carregar a chave da API do ambiente
// No Next.js, variáveis de ambiente prefixadas com NEXT_PUBLIC_ são expostas ao cliente.
// Variáveis sem esse prefixo são apenas para o servidor (como é o caso aqui).
const API_KEY = process.env.GEMINI_API_KEY;
const SEED_SECRET = process.env.SEED_SECRET; // Chave secreta para proteger o endpoint
const MODEL_NAME = 'gemini-1.5-flash';

// Instanciar o cliente da IA fora do handler para reutilização em "warm functions".
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: MODEL_NAME }) : null;

// Função utilitária para remover acentos, espaços e converter para maiúsculas (equivalente ao Python)
function sanitizeAnswer(text) {
  if (typeof text !== 'string') {
    return '';
  }
  // Normaliza para NFD (Decomposição Canônica) e remove diacríticos (acentos)
  // Isso transforma 'AÇÃO' em 'ACAO'
  const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Remove espaços e converte para maiúsculas
  return normalized.replace(/\s/g, '').toUpperCase();
}

// Função para construir o prompt da IA, separando a lógica do handler principal.
function buildPrompt(subject, level, num_words, previous_words) {
  // Mapeamento de matérias para suas fontes primárias no site do Planalto.
  const subjectSources = {
    'Direito Constitucional': {
      name: 'Constituição Federal de 1988',
      url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm'
    },
    'Direito Penal': {
      name: 'Código Penal (Decreto-Lei nº 2.848/1940)',
      url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm'
    },
    'Direito Civil': {
      name: 'Código Civil (Lei nº 10.406/2002)',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm'
    },
    'Direito do Trabalho': {
      name: 'Consolidação das Leis do Trabalho - CLT (Decreto-Lei nº 5.452/1943)',
      url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm'
    },
    'Direito Administrativo': {
      name: 'Lei do Processo Administrativo Federal (Lei nº 9.784/1999) e Lei de Licitações (Lei nº 14.133/2021)',
      url: 'http://www.planalto.gov.br/ccivil_03/leis/l9784.htm'
    },
    'Direito Tributário': {
      name: 'Código Tributário Nacional - CTN (Lei nº 5.172/1966)',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm'
    }
  };

  const source = subjectSources[subject] || { name: `legislação sobre ${subject}`, url: 'https://www.planalto.gov.br' };

  const wordsToAvoid = previous_words.slice(-50);
  const avoidClause = wordsToAvoid.length > 0
    ? `5. **Evitar Repetição**: CRUCIAL: Não repita perguntas, respostas ou conceitos das seguintes palavras já usadas: ${wordsToAvoid.join(', ')}.`
    : '';

  return `
      Você é um assistente de IA especialista em Direito brasileiro, criando um jogo de palavras cruzadas educativo.
      Sua tarefa é gerar ${num_words} pares de pergunta e resposta para o tema "${subject}".

      Instruções Detalhadas:
      1.  **Fonte de Conhecimento OBRIGATÓRIA**: Baseie TODAS as perguntas e respostas exclusivamente no texto da seguinte legislação brasileira: ${source.name}, disponível em ${source.url}.
      2.  **Dificuldade Progressiva**: O nível da fase é ${level}. Quanto maior o nível, mais específicos e menos óbvios devem ser os termos e as perguntas. Para o nível ${level}, gere conceitos que exijam um conhecimento um pouco mais aprofundado que o nível anterior.
      3.  **Qualidade da Pergunta**: A pergunta deve ser uma dica clara, concisa e precisa para a resposta, baseada estritamente no texto da lei informada. Deve ser uma definição, uma característica ou um conceito encontrado nos textos legais.
      4.  **Formato da Resposta**:
          - A resposta deve ser uma única palavra.
          - Deve ter entre 2 e 10 letras, sem exceções.
          - Não pode conter espaços, hífens, acentos ou caracteres especiais. Use a forma da palavra sem acentuação (ex: 'ACAO' em vez de 'AÇÃO').
      ${avoidClause}
      6.  **Formato de Saída**: Retorne sua resposta como uma lista de strings, onde cada string tem o formato "PERGUNTA|RESPOSTA". Não inclua numeração, marcadores, explicações ou qualquer texto fora deste formato.

      Exemplo de Saída para 2 palavras:
      Recurso contra decisão de juiz de primeiro grau|APELACAO
      Garantia constitucional contra prisão ilegal|HABEASCORPUS
      `;
}

// Função para analisar a resposta da IA e transformá-la em dados estruturados.
function parseGeminiResponse(text_content) {
  const lines = text_content.split("\n").filter(line => line.trim() !== '');
  const crossword_data = [];

  for (const line of lines) {
    if (line.includes("|")) {
      const parts = line.split("|", 2);
      if (parts.length === 2) {
        const question = parts[0].trim();
        const answer = sanitizeAnswer(parts[1]);

        // Validação mais estrita da resposta
        if (answer.length >= 2 && answer.length <= 10 && /^[A-Z]+$/.test(answer)) {
          crossword_data.push({ question, answer });
        }
      }
    }
  }
  return crossword_data;
}

// Handler para a API Route
export default async function handler(req, res) {
  // Garante que a requisição seja POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Protege o endpoint com uma chave secreta
  const { secret } = req.body;
  if (!SEED_SECRET || secret !== SEED_SECRET) {
    return res.status(401).json({ error: 'Acesso não autorizado.' });
  }

  // Verifica se a chave da API está configurada
  if (!API_KEY || !model || !db) {
    console.error("GEMINI_API_KEY não encontrada nas variáveis de ambiente.");
    const missing = !API_KEY ? 'GEMINI_API_KEY' : !db ? 'Firebase Config' : 'Model';
    return res.status(500).json({ error: `Erro de configuração do servidor: ${missing} está faltando.` });
  }

  // Extrai dados do corpo da requisição, com valores padrão
  const { subject = "Direito Geral", level = 1, previous_words = [] } = req.body;
  
  // Validação de entrada para maior robustez
  const parsedLevel = parseInt(level, 10);
  if (isNaN(parsedLevel) || parsedLevel < 1) {
    return res.status(400).json({ error: 'O nível (level) deve ser um número positivo.' });
  }
  if (typeof subject !== 'string' || subject.trim() === '') {
    return res.status(400).json({ error: 'O tema (subject) não pode ser vazio.' });
  }

  // Aumenta a quantidade de palavras com o nível
  const num_words = 20; // Gera um lote maior de palavras para popular o banco

  try {
    const prompt = buildPrompt(subject, parsedLevel, num_words, previous_words);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text_content = response.text();
    
    const crossword_data = parseGeminiResponse(text_content);

    if (crossword_data.length === 0) {
      return res.status(500).json({ error: "A IA retornou um formato inesperado ou não gerou palavras válidas. Tente novamente." });
    }

    // --- INÍCIO DA LÓGICA DE SALVAMENTO NO FIRESTORE ---
    const batch = db.batch();
    const questionsCollection = db.collection('questions');
    let savedCount = 0;

    crossword_data.forEach(item => {
        // Cria um ID de documento baseado no tema, nível e resposta para evitar duplicatas fáceis.
        // Ex: direito_penal_1_CULPA (substituindo hífens por underscores para conformidade)
        const docId = `${subject.replace(/\s+/g, '_').toLowerCase()}_${parsedLevel}_${item.answer}`;
        const docRef = questionsCollection.doc(docId);
        
        batch.set(docRef, {
            question: item.question,
            answer: item.answer,
            subject: subject,
            level: parsedLevel,
            length: item.answer.length,
            createdAt: new Date(),
        });
        savedCount++;
    });

    await batch.commit();
    // --- FIM DA LÓGICA DE SALVAMENTO ---

    return res.status(200).json({ message: `${savedCount} de ${crossword_data.length} perguntas geradas foram salvas com sucesso para o tema '${subject}' nível ${parsedLevel}.` });
  } catch (e) {
    console.error(`Erro no log do servidor: ${e}`);
    return res.status(500).json({ error: `Erro na geração: ${e.message || e}` });
  }
}
