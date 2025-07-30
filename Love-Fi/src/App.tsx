import { useState } from 'react';
import './App.css'; // Importa o CSS para este componente
import MoodMusicPlayer from './components/MoodMusicPlayer'; // Importa o novo componente de player

function App() {
  const [moodText, setMoodText] = useState(''); // Estado para o texto digitado pelo usuário
  const [videos, setVideos] = useState([]); // Estado para armazenar os vídeos do YouTube
  const [loading, setLoading] = useState(false); // Estado para controlar o loading
  const [error, setError] = useState<string | null>(null); // Estado para erros

  const fetchMusic = async () => {
    setLoading(true);
    setError(null);
    setVideos([]); // Limpa vídeos anteriores ao iniciar uma nova busca

    try {
      // URL para o seu backend. import.meta.env.VITE_BACKEND_PORT lê do .env (Vite)
      const backendPort = import.meta.env.VITE_BACKEND_PORT || '3001';
      const backendUrl = `http://localhost:${backendPort}/api/get-music-by-mood`;

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moodText }), // Envia o texto do mood para o backend
      });

      if (!response.ok) {
        // Se a resposta não for OK (status 4xx, 5xx), tenta ler a mensagem de erro do backend
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro desconhecido ao buscar músicas.');
      }

      const data = await response.json(); // Pega os dados da resposta (mood detectado e vídeos)
      setVideos(data.videos); // Atualiza o estado com os vídeos recebidos
    } catch (err: any) {
      setError(err.message); // Define a mensagem de erro
      console.error('Erro ao buscar músicas:', err);
    } finally {
      setLoading(false); // Finaliza o loading
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Love-Fi</h1>
        <p>Descreva seu mood e encontre a trilha sonora perfeita!</p>
      </header>

      <main className="content">
        <div className="input-section">
          <textarea
            className="mood-input"
            rows={4}
            placeholder="Ex: 'Me sinto calmo e preciso de algo para focar', 'Estou feliz e quero algo animado', 'Um pouco nostálgico, pensando na vida...'"
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)} // Atualiza o estado moodText
          ></textarea>
          <button
            className="submit-button"
            onClick={fetchMusic}
            disabled={loading || moodText.trim() === ''} // Desabilita o botão enquanto carrega ou se o texto estiver vazio
          >
            {loading ? 'Buscando...' : 'Encontrar Minha Vibe'}
          </button>
        </div>

        {error && <p className="error-message">Erro: {error}</p>}

        {/* Renderiza o componente MoodMusicPlayer passando os vídeos */}
        <MoodMusicPlayer videos={videos} />
      </main>
    </div>
  );
}

export default App;