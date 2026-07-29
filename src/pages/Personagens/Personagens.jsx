import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CriarPersonagemModal from './CriarPersonagemModal';

import { useAuth } from 'context/AuthContext';
import { getPersonagens } from 'service/storage';

import PersonagemCardItem from './PersonagemCardItem';
import { TIPOS_PERSONAGEM } from './Ficha/constants';
import { CardsGrid, EmptyState, PageHeader, PageTitle, PageWrapper } from './styles';

const ABAS_TIPO = [
  { tipo: TIPOS_PERSONAGEM[0], label: 'Meus Personagens' },
  { tipo: TIPOS_PERSONAGEM[1], label: 'Meus NPCs' },
  { tipo: TIPOS_PERSONAGEM[2], label: 'Minhas Criaturas' },
];

const MENSAGEM_VAZIO = {
  [TIPOS_PERSONAGEM[0]]: {
    texto: 'Você ainda não tem nenhum personagem.',
    botao: 'Criar o primeiro personagem',
  },
  [TIPOS_PERSONAGEM[1]]: {
    texto: 'Você ainda não tem nenhum NPC.',
    botao: 'Criar o primeiro NPC',
  },
  [TIPOS_PERSONAGEM[2]]: {
    texto: 'Você ainda não tem nenhuma criatura.',
    botao: 'Criar a primeira criatura',
  },
};

const Personagens = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [personagens, setPersonagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersonagemId, setSelectedPersonagemId] = useState(null);
  const [aba, setAba] = useState(TIPOS_PERSONAGEM[0]);

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleCreated = useCallback(() => {
    setLoading(true);
    getPersonagens(currentUser.uid).then(items => {
      setPersonagens(items);
      setLoading(false);
    });
  }, [currentUser.uid]);

  const handleOpenPersonagem = useCallback(
    personagemId => {
      setSelectedPersonagemId(personagemId);
      navigate(`/personagens/${personagemId}`);
    },
    [navigate],
  );

  const personagensDaAba = useMemo(
    () =>
      personagens.filter(personagem => (personagem.tipo ?? TIPOS_PERSONAGEM[0]) === aba),
    [personagens, aba],
  );

  const mensagemVazio = MENSAGEM_VAZIO[aba];

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Minhas Fichas</PageTitle>
        <Button variant="contained" onClick={handleCreateClick}>
          Criar Ficha
        </Button>
      </PageHeader>

      <Tabs
        value={aba}
        onChange={(_event, novaAba) => setAba(novaAba)}
        variant="scrollable"
        scrollButtons="auto"
        textColor="inherit"
      >
        {ABAS_TIPO.map(({ tipo, label }) => (
          <Tab key={tipo} value={tipo} label={label} />
        ))}
      </Tabs>

      {loading && (
        <EmptyState>
          <CircularProgress size={28} sx={{ color: 'var(--color-primary)' }} />
        </EmptyState>
      )}

      {!loading && personagensDaAba.length === 0 && (
        <EmptyState>
          <p>{mensagemVazio.texto}</p>
          <Button variant="outlined" onClick={handleCreateClick}>
            {mensagemVazio.botao}
          </Button>
        </EmptyState>
      )}

      {!loading && personagensDaAba.length > 0 && (
        <CardsGrid>
          {personagensDaAba.map(personagem => (
            <PersonagemCardItem
              key={personagem.id}
              personagem={personagem}
              onClick={() => handleOpenPersonagem(personagem.id)}
              isSelected={selectedPersonagemId === personagem.id}
            />
          ))}
        </CardsGrid>
      )}

      <CriarPersonagemModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onCreated={handleCreated}
      />
    </PageWrapper>
  );
};

export default Personagens;
