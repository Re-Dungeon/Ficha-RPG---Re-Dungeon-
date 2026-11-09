import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CriarPersonagemModal from './CriarPersonagemModal';

import { useAuth } from 'context/AuthContext';
import { useSelecao } from 'context/selecaoContext';
import { getPersonagens, getFirestoreItem } from 'service/storage';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';

import PersonagemCardItem from './PersonagemCardItem';
import { TIPOS_PERSONAGEM } from './Ficha/constants';
import { CardsGrid, EmptyState, PageHeader, PageTitle, PageWrapper, TabsHeader } from './styles';
import { getNome } from 'common/utils/resolveNome';
import {
  ORDENACOES,
  filtrarPorNome,
  normalizarOrdenacao,
  ordenarPersonagens,
} from 'common/utils/listaPersonagens';

const lerPreferencia = (chave, padrao) => {
  try {
    return localStorage.getItem(chave) || padrao;
  } catch {
    return padrao;
  }
};

const gravarPreferencia = (chave, valor) => {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // Preferência só de interface: sem localStorage, vale só nesta visita.
  }
};

const TIPO_COMPANHEIROS = 'companheiros';

const ABAS_TIPO = [
  { tipo: TIPOS_PERSONAGEM[0], label: 'Meus Personagens' },
  { tipo: TIPOS_PERSONAGEM[1], label: 'Meus NPCs' },
  { tipo: TIPOS_PERSONAGEM[2], label: 'Minhas Criaturas' },
  { tipo: TIPO_COMPANHEIROS, label: 'Companheiros' },
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
  [TIPO_COMPANHEIROS]: {
    texto: 'Você ainda não tem nenhum companheiro.',
    botao: 'Criar o primeiro companheiro',
  },
};

const ehCompanheiro = personagem => Boolean(personagem?.companheiroDe);

const tipoNormalizado = personagem => personagem?.tipo ?? TIPOS_PERSONAGEM[0];

const filtrarPersonagensDaAba = (personagens, aba, selectedUniverso) => {
  return personagens.filter(personagem => {
    const tipo = tipoNormalizado(personagem);
    const naAba = (() => {
      switch (aba) {
        case TIPO_COMPANHEIROS:
          return ehCompanheiro(personagem);
        case TIPOS_PERSONAGEM[1]:
          return !ehCompanheiro(personagem) && tipo === TIPOS_PERSONAGEM[1];
        case TIPOS_PERSONAGEM[2]:
          return !ehCompanheiro(personagem) && tipo === TIPOS_PERSONAGEM[2];
        case TIPOS_PERSONAGEM[0]:
        default:
          return !ehCompanheiro(personagem) && tipo === TIPOS_PERSONAGEM[0];
      }
    })();

    if (!naAba) {
      return false;
    }

    if (!selectedUniverso || selectedUniverso === 'ALL') {
      return true;
    }
    if (selectedUniverso === '__NO_UNIVERSE__') {
      return !personagem.universo;
    }
    return personagem.universo === selectedUniverso;
  });
};

const Personagens = () => {
  const { currentUser } = useAuth();
  const { limparPersonagem } = useSelecao();
  const navigate = useNavigate();
  const [personagens, setPersonagens] = useState([]);

  // Abrir a lista = nenhuma ficha "em andamento": o link "Fichas" do
  // cabeçalho volta a apontar para cá (o último chat aberto continua lembrado).
  useEffect(() => {
    limparPersonagem();
  }, [limparPersonagem]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [selectedPersonagemId, setSelectedPersonagemId] = useState(null);
  const [aba, setAba] = useState(TIPOS_PERSONAGEM[0]);
  const [universos, setUniversos] = useState([]);
  const [selectedUniverso, setSelectedUniverso] = useState(
    () => localStorage.getItem('filtro_universo') || 'ALL',
  );
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState(() =>
    normalizarOrdenacao(lerPreferencia('ordenacao_personagens', null)),
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
    () =>
      ordenarPersonagens(
        filtrarPorNome(filtrarPersonagensDaAba(personagens, aba, selectedUniverso), busca),
        ordenacao,
      ),
    [personagens, aba, selectedUniverso, busca, ordenacao],
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
          <TextField
            size="small"
            type="search"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome"
            slotProps={{ htmlInput: { 'aria-label': 'Buscar por nome', maxLength: 100 } }}
            sx={{ minWidth: 180, '& .MuiInputBase-root': { background: 'rgba(255,255,255,0.02)', borderRadius: '8px' } }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="ordenacao-personagens-label">Ordenar por</InputLabel>
            <Select
              labelId="ordenacao-personagens-label"
              label="Ordenar por"
              value={ordenacao}
              onChange={e => {
                setOrdenacao(e.target.value);
                gravarPreferencia('ordenacao_personagens', e.target.value);
              }}
              sx={{
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
              }}
            >
              {ORDENACOES.map(({ valor, rotulo }) => (
                <MenuItem key={valor} value={valor}>
                  {rotulo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
          {busca.trim() ? (
            <p>Nenhum resultado para “{busca.trim()}”.</p>
          ) : selectedUniverso && selectedUniverso !== 'ALL' ? (
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
