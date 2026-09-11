import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CriarPersonagemModal from './CriarPersonagemModal';

import { useAuth } from 'context/AuthContext';
import { getPersonagens, getFirestoreItem } from 'service/storage';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';

import PersonagemCardItem from './PersonagemCardItem';
import { TIPOS_PERSONAGEM } from './Ficha/constants';
import { CardsGrid, EmptyState, PageHeader, PageTitle, PageWrapper, TabsHeader } from './styles';
import { getNome } from 'common/utils/resolveNome';

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
  const [erro, setErro] = useState(null);
  const [selectedPersonagemId, setSelectedPersonagemId] = useState(null);
  const [aba, setAba] = useState(TIPOS_PERSONAGEM[0]);
  const [universos, setUniversos] = useState([]);
  const [selectedUniverso, setSelectedUniverso] = useState(
    () => localStorage.getItem('filtro_universo') || 'ALL',
  );

  useEffect(() => {
    let isMounted = true;
    getPersonagens(currentUser.uid)
      .then(items => {
        if (isMounted) {
          setPersonagens(items);
          setLoading(false);
        }
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar personagens:', error);
        if (isMounted) {
          setErro('Não foi possível carregar seus personagens. Tente novamente.');
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
    getPersonagens(currentUser.uid)
      .then(items => {
        setPersonagens(items);
        setLoading(false);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Falha ao recarregar personagens:', error);
        setErro('Não foi possível recarregar seus personagens. Tente novamente.');
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
    () => {
      return personagens
        .filter(personagem => (personagem.tipo ?? TIPOS_PERSONAGEM[0]) === aba)
        .filter(personagem => {
          if (!selectedUniverso || selectedUniverso === 'ALL') return true;
          if (selectedUniverso === '__NO_UNIVERSE__') return !personagem.universo;
          return personagem.universo === selectedUniverso;
        });
    },
    [personagens, aba, selectedUniverso],
  );

  const mensagemVazio = MENSAGEM_VAZIO[aba];

  useEffect(() => {
    // monta lista única de universos a partir dos personagens carregados
    const ids = Array.from(new Set(personagens.map(p => (p.universo ?? '__NO_UNIVERSE__'))));

    if (ids.length === 0) {
      setUniversos([{ id: 'ALL', nome: 'Todos os Universos' }]);
      return;
    }

    Promise.all(
      ids.map(id => {
        if (id === '__NO_UNIVERSE__') return Promise.resolve({ id: '__NO_UNIVERSE__', nome: 'Sem mesa' });
        return getFirestoreItem('Universo', id)
          .then(item => ({ id, nome: getNome(item) || 'Sem mesa' }))
          .catch(() => ({ id, nome: 'Sem mesa' }));
      }),
    ).then(results => {
      const unique = results.filter(Boolean);
      // prepend 'ALL' option
      setUniversos([{ id: 'ALL', nome: 'Todos os Universos' }, ...unique]);
    });
  }, [personagens]);

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Minhas Fichas</PageTitle>
        <Button variant="contained" onClick={handleCreateClick}>
          Criar Ficha
        </Button>
      </PageHeader>

      <TabsHeader>
        <div className="tabs-wrapper">
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
        </div>

        <div className="filter-wrapper">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={selectedUniverso}
              onChange={e => {
                setSelectedUniverso(e.target.value);
                localStorage.setItem('filtro_universo', e.target.value);
              }}
              displayEmpty
              renderValue={v => {
                const found = universos.find(u => u.id === v);
                return found ? found.nome : 'Todos os Universos';
              }}
              sx={{
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                '& .MuiSelect-select': { padding: '8px 12px' },
              }}
            >
              <MenuItem value="ALL">Todos os Universos</MenuItem>
              {universos
                .filter(u => u.id !== 'ALL')
                .map(u => (
                  <MenuItem key={String(u.id)} value={u.id}>
                    {u.nome}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </div>
      </TabsHeader>

      {loading && (
        <EmptyState>
          <CircularProgress size={28} sx={{ color: 'var(--color-primary)' }} />
        </EmptyState>
      )}

      {!loading && personagensDaAba.length === 0 && (
        <EmptyState>
          {selectedUniverso && selectedUniverso !== 'ALL' ? (
            <p>Nenhum registro encontrado neste universo.</p>
          ) : (
            <>
              <p>{mensagemVazio.texto}</p>
              <Button variant="outlined" onClick={handleCreateClick}>
                {mensagemVazio.botao}
              </Button>
            </>
          )}
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

      <ErrorSnackbar open={!!erro} mensagem={erro} onClose={() => setErro(null)} />
    </PageWrapper>
  );
};

export default Personagens;
