import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'context/AuthContext';
import { getPersonagens } from 'service/storage';

import PersonagemCardItem from './PersonagemCardItem';
import { CardsGrid, EmptyState, PageHeader, PageTitle, PageWrapper } from './styles';

const Personagens = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [personagens, setPersonagens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getPersonagens(currentUser.uid).then(items => {
      if (isMounted) {
        setPersonagens(items);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentUser.uid]);

  const handleCreateClick = useCallback(() => {
    navigate('/personagens/novo');
  }, [navigate]);

  const handleOpenPersonagem = useCallback(
    personagemId => {
      navigate(`/personagens/${personagemId}`);
    },
    [navigate],
  );

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Meus Personagens</PageTitle>
        <Button variant="contained" onClick={handleCreateClick}>
          Criar Personagem
        </Button>
      </PageHeader>

      {loading && (
        <EmptyState>
          <CircularProgress size={28} sx={{ color: 'var(--color-primary)' }} />
        </EmptyState>
      )}

      {!loading && personagens.length === 0 && (
        <EmptyState>
          <p>Você ainda não tem nenhum personagem.</p>
          <Button variant="outlined" onClick={handleCreateClick}>
            Criar o primeiro personagem
          </Button>
        </EmptyState>
      )}

      {!loading && personagens.length > 0 && (
        <CardsGrid>
          {personagens.map(personagem => (
            <PersonagemCardItem
              key={personagem.id}
              personagem={personagem}
              onClick={() => handleOpenPersonagem(personagem.id)}
            />
          ))}
        </CardsGrid>
      )}
    </PageWrapper>
  );
};

export default Personagens;
