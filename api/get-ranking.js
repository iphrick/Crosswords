import { db } from './lib/firebase';

// Helper para extrair um nome amigável do e-mail do usuário.
function getNameFromEmail(email) {
    if (!email) return 'Anônimo';
    return email.split('@')[0];
}

export default async function handler(req, res) {
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
                    name: getNameFromEmail(userData.email || userData.phoneNumber),
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