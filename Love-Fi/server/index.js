require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const express = require('express');
const cors = require('cors'); // Para permitir requisições do frontend
const { OpenAI } = require('openai/index.mjs');
const { google } = require('googleapis');

const app = express();
const port = process.env.PORT || 3001; // Porta do servidor

// Inicializa a OpenAI com sua chave
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Inicializa o cliente do YouTube com sua chave
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
});

app.use(cors()); // Habilita CORS para o frontend poder se comunicar
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// Endpoint para detectar o mood e buscar músicas
app.post('/api/get-music-by-mood', async (req, res) => {
    const { moodText } = req.body;

    if (!moodText) {
        return res.status(400).json({ error: 'Texto do mood é obrigatório.' });
    }

    let detectedMood = 'calmo'; // Mood padrão caso a IA não consiga inferir

    try {
        // 1. Detecção de Mood com OpenAI
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4o", // Você pode experimentar com gpt-4 se tiver acesso
            messages: [
                {
                    role: "system",
                    content: "Você é um assistente especialista em gerar frases de busca para músicas lo-fi. Sua tarefa é analisar o humor, o ambiente e a ocasião descritos pelo usuário e combinar tudo isso em uma única e concisa frase de busca para o YouTube. A frase deve ser descritiva e em português. Gere apenas a frase de busca, sem nenhuma outra palavra ou explicação. Exemplo de entrada: 'Estou em um dia chuvoso no meu trabalho e queria escutar musicas lo-fi para me sentir mais focado nas minhas atividades do trabalho e que me acalmem dos problemas que acontecem.' Exemplo de saída: 'lo-fi para foco e calma em dia chuvoso no trabalho'."
                },
                {
                    role: "user",
                    content: moodText
                }
            ],
            max_tokens: 100,
            temperature: 0.7,
        });

        const youtubeQuery = chatCompletion.choices[0].message.content.trim();
        console.log(`Query gerada pela OpenAI: ${youtubeQuery}`);

        const youtubeResponse = await youtube.search.list({
            q: youtubeQuery,
            part: 'snippet',
            type: 'video',
            maxResults: 5, // Limita a 5 resultados
            videoEmbeddable: 'true', // Garante que os vídeos possam ser incorporados
            topicId: '/m/0glk9', // Opcional: Filtra por gênero musical (Hip Hop/Rap, que lo-fi se enquadra)
            relevanceLanguage: 'en' // Pode ser 'pt' para focar em títulos em português, ou 'en'
        });

        const videos = youtubeResponse.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));

        res.json({ mood: detectedMood, videos });

    } catch (error) {
        console.error('Erro ao processar a requisição:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar músicas.' });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});