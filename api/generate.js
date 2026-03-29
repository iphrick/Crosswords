import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Carregar a chave da API do ambiente
// No Next.js, variáveis de ambiente prefixadas com NEXT_PUBLIC_ são expostas ao cliente.
// Variáveis sem esse prefixo são apenas para o servidor (como é o caso aqui).
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash';

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
  let avoid_clause = "";
  if (previous_words && previous_words.length > 0) {
    // Evita as últimas 50 palavras para não sobrecarregar o prompt
    const words_to_avoid = previous_words.slice(-50);
    avoid_clause = `CRUCIAL: Não repita perguntas, respostas ou conceitos das seguintes palavras já usadas: ${words_to_avoid.join(', ')}.`;
  }

  return `
      Você é um especialista em Direito criando um jogo de palavras cruzadas educativo.
      Sua tarefa é gerar ${num_words} pares de pergunta e resposta para uma cruzadinha.

      Tema Principal: ${subject}
      Nível da Fase: ${level}

      Instruções Detalhadas:
      1.  **Dificuldade Progressiva**: O nível da fase é ${level}. Quanto maior o nível, mais específicos e menos óbvios devem ser os termos e as perguntas. Para o nível ${level}, gere conceitos que exijam um conhecimento um pouco mais aprofundado que o nível anterior. Evite termos muito básicos se o nível for alto.
      2.  **Qualidade da Pergunta**: A pergunta deve ser uma dica clara, concisa e precisa para a resposta. Deve ser uma definição, uma característica ou um sinônimo relacionado ao termo jurídico.
      3.  **Formato da Resposta**:
          - A resposta deve ser uma única palavra.
          - Deve ter entre 2 e 10 letras, sem exceções.
          - Não pode conter espaços, hífens, acentos ou caracteres especiais. Use a forma da palavra sem acentuação (ex: 'ACAO' em vez de 'AÇÃO').
      4.  **Evitar Repetição**: ${avoid_clause}
      5.  **Formato de Saída**: Retorne sua resposta como uma lista de strings, onde cada string tem o formato "PERGUNTA|RESPOSTA". Não inclua numeração, marcadores, explicações ou qualquer texto fora deste formato.

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

  // Verifica se a chave da API está configurada
  if (!API_KEY || !model) {
    console.error("GEMINI_API_KEY não encontrada nas variáveis de ambiente.");
    return res.status(500).json({ error: 'Erro de configuração do servidor: GEMINI_API_KEY está faltando.' });
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
  const num_words = Math.min(5 + (parsedLevel - 1), 10); // Começa com 5, aumenta 1 por nível, máximo 10

  try {
    const prompt = buildPrompt(subject, parsedLevel, num_words, previous_words);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text_content = response.text();
    
    const crossword_data = parseGeminiResponse(text_content);

    if (crossword_data.length < num_words) {
      console.warn(`Alerta: A IA gerou apenas ${crossword_data.length} de ${num_words} palavras solicitadas.`);
    }

    if (crossword_data.length === 0) {
      return res.status(500).json({ error: "A IA retornou um formato inesperado ou não gerou palavras válidas. Tente novamente." });
    }

    return res.status(200).json({ crossword: crossword_data });

  } catch (e) {
    console.error(`Erro no log do servidor: ${e}`);
    return res.status(500).json({ error: `Erro na geração: ${e.message || e}` });
  }
}