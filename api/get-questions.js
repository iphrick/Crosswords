import { db } from './lib/firebase.js';

// Função para embaralhar um array (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!db) {
    console.error("A conexão com o Firestore não foi inicializada.");
    return res.status(500).json({ error: 'Erro de configuração do servidor: conexão com o banco de dados falhou.' });
  }

  const { subject = "Direito Geral", level = 1, previous_words = [] } = req.body;

  const parsedLevel = parseInt(level, 10);
  if (isNaN(parsedLevel) || parsedLevel < 1) {
    return res.status(400).json({ error: 'O nível (level) deve ser um número positivo.' });
  }

  // Determina quantas palavras buscar com base no nível
  const num_words_to_fetch = Math.min(5 + (parsedLevel - 1), 10);

  try {
    const questionsCollection = db.collection('questions');
    // Constrói a query para buscar perguntas do tema e nível corretos
    const query = questionsCollection.where('subject', '==', subject).where('level', '==', parsedLevel);

    const snapshot = await query.get();

    if (snapshot.empty) {
      const errorMessage = `Nenhuma pergunta encontrada para o tema '${subject}' no nível ${parsedLevel}. É preciso popular o banco de dados primeiro usando o endpoint /api/seed-questions.`;
      console.error(errorMessage);
      return res.status(404).json({ error: errorMessage });
    }

    let allQuestions = [];
    snapshot.forEach(doc => {
      allQuestions.push(doc.data());
    });

    // Filtra palavras que o jogador já resolveu nesta sessão
    const availableQuestions = allQuestions.filter(q => !previous_words.includes(q.answer));
    
    // Embaralha e pega o número necessário de perguntas
    const shuffledQuestions = shuffleArray(availableQuestions);
    const selectedQuestions = shuffledQuestions.slice(0, num_words_to_fetch);

    if (selectedQuestions.length === 0) {
        return res.status(404).json({ error: "Não há mais perguntas novas disponíveis para este nível. Tente resetar o progresso ou popule mais perguntas." });
    }

    return res.status(200).json({ crossword: selectedQuestions });

  } catch (e) {
    console.error(`Erro ao buscar perguntas no Firestore: ${e}`);
    return res.status(500).json({ error: `Erro ao buscar dados: ${e.message || e}` });
  }
}