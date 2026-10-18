import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatOutlined';
import GridOnIcon from '@mui/icons-material/GridOn';

import { useAuth } from 'context/AuthContext';
import { useSelecao } from 'context/selecaoContext';
import { getPersonagens, getRmCampanha } from 'service/storage';
import { campanhaIdsDosPersonagens, personagensNaCampanha } from 'common/utils/chat';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';
import { CardsGrid, EmptyState, PageHeader, PageTitle, PageWrapper } from 'pages/Personagens/styles';

import { CampanhaCard, CampanhaCardBody, CampanhaCardImagem, CampanhaPersonagens } from './styles';

// "Minhas Campanhas": derivado dos próprios personagens (`campanhas` de cada
// ficha) — o doc da campanha não guarda a lista de jogadores.
const Campanhas = () => {
  const { currentUser } = useAuth();
  const { limparCampanha } = useSelecao();
  const navigate = useNavigate();
  const [campanhas, setCampanhas] = useState([]);

  // Espelho da lista de fichas: esquece o chat aberto, mas mantém a ficha
  // lembrada para o link "Fichas" voltar para ela.
  useEffect(() => {
    limparCampanha();
  }, [limparCampanha]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const carregar = async () => {
      try {
        const personagens = await getPersonagens(currentUser.uid);
        const ids = campanhaIdsDosPersonagens(personagens);
        const docs = await Promise.all(ids.map(id => getRmCampanha(id).catch(() => null)));
        const itens = docs
          .filter(Boolean)
          .map(campanha => ({
            ...campanha,
            personagens: personagensNaCampanha(personagens, campanha.id),
          }))
          .sort((a, b) => (a.nome ?? '').localeCompare(b.nome ?? ''));
        if (isMounted) setCampanhas(itens);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar campanhas:', error);
        if (isMounted) setErro('Não foi possível carregar suas campanhas. Tente novamente.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    carregar();
    return () => {
      isMounted = false;
    };
  }, [currentUser.uid]);

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Minhas Campanhas</PageTitle>
      </PageHeader>

      {loading && (
        <EmptyState>
          <CircularProgress size={28} sx={{ color: 'var(--color-primary)' }} />
        </EmptyState>
      )}

      {!loading && campanhas.length === 0 && (
        <EmptyState>
          <p>Nenhum dos seus personagens está em uma campanha.</p>
          <p>Vincule a campanha na aba Perfil da ficha do personagem.</p>
        </EmptyState>
      )}

      {!loading && campanhas.length > 0 && (
        <CardsGrid>
          {campanhas.map(campanha => (
            <CampanhaCard key={campanha.id}>
              {campanha.linkImagem && (
                <CampanhaCardImagem src={campanha.linkImagem} alt={campanha.nome} />
              )}
              <CampanhaCardBody>
                <h3>{campanha.nome}</h3>
                <CampanhaPersonagens>
                  {campanha.personagens.map(personagem => personagem.nome).join(', ')}
                </CampanhaPersonagens>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<ChatBubbleOutlineIcon />}
                    onClick={() => navigate(`/campanhas/${campanha.id}/chat`)}
                  >
                    Abrir chat
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<GridOnIcon />}
                    onClick={() => navigate(`/campanhas/${campanha.id}/grid`)}
                  >
                    Abrir grid
                  </Button>
                </Box>
              </CampanhaCardBody>
            </CampanhaCard>
          ))}
        </CardsGrid>
      )}

      <ErrorSnackbar open={!!erro} mensagem={erro} onClose={() => setErro(null)} />
    </PageWrapper>
  );
};

export default Campanhas;
