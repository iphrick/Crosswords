const { db } = require('./lib/firebase.js');

// Helper para criar um nome de jogador limpo a partir de email ou telefone.
function sanitizePlayerName(identifier) {
    if (!identifier) return 'Anônimo';
    // Se for um email, pega a parte antes do @. Se for telefone, usa o número.
    const nameBase = identifier.includes('@') ? identifier.split('@')[0] : identifier;
    // Remove todos os caracteres que não são letras ou números.
    // Isso remove '.', '+', '-' etc., deixando um nome limpo para exibição.
    const cleanName = nameBase.replace(/[^a-zA-Z0-9]/g, '');
    return cleanName.length > 0 ? cleanName : 'Jogador';
}

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!db) {
        console.error("A conexão com o Firestore não foi inicializada.");
        return res.status(500).json({ error: 'Erro de configuração do servidor: conexão com o banco de dados falhou.' });
    }

    try {
        const usersSnapshot = await db.collection('users').get();
        if (usersSnapshot.empty) {
            return res.status(200).json({ ranking: [] });
        }

        const players = [];
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            const subjects = userData.subjects || {};
            
            let totalScore = 0;
            let highestLevel = 1;

            // Calcula a pontuação total e o maior nível entre todas as matérias.
            for (const subjectKey in subjects) {
                const subjectData = subjects[subjectKey];
                totalScore += subjectData.score || 0;
                if ((subjectData.level || 1) > highestLevel) {
                    highestLevel = subjectData.level;
                }
            }

            // Adiciona ao ranking apenas jogadores que já pontuaram.
            if (totalScore > 0) {
                players.push({
                    name: sanitizePlayerName(userData.email || userData.phoneNumber),
                    totalScore,
                    highestLevel,
                });
            }
        });

        // Ordena os jogadores pela pontuação e retorna o TOP 50.
        players.sort((a, b) => b.totalScore - a.totalScore);
        return res.status(200).json({ ranking: players.slice(0, 50) });

    } catch (e) {
        console.error(`Erro ao buscar ranking no Firestore: ${e}`);
        return res.status(500).json({ error: `Erro ao buscar dados do ranking: ${e.message || e}` });
    }
}