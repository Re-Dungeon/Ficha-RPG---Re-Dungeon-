import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Drawer from '@mui/material/Drawer';

import EqualizerIcon from '@mui/icons-material/Equalizer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HubIcon from '@mui/icons-material/Hub';
import PetsIcon from '@mui/icons-material/Pets';

import {
  getPersonagem,
  removePersonagem,
  subscribePersonagem,
  updatePersonagem,
} from 'service/storage';
import { useSelecao } from 'context/selecaoContext';
import { SavingProvider } from 'context/SavingContext';

import useIsMobile from 'hooks/useIsMobile';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';

import AtributosTab from './tabs/AtributosTab';
import AptidoesTab from './tabs/AptidoesTab';
import ArtsTab from './tabs/ArtsTab';
import InventarioTab from './tabs/InventarioTab';
import TreinamentoTab from './tabs/TreinamentoTab';
import VeiasAstraisTab from './tabs/VeiasAstraisTab';
import CompanheiroTab from './tabs/CompanheiroTab';
import FichaSidebar from './sidebar/FichaSidebar';
import InfoModal from './sidebar/InfoModal';
import AptidaoConsultaModal from './sidebar/AptidaoConsultaModal';
import RacaModal from './sidebar/RacaModal';
import ClasseModal from './sidebar/ClasseModal';
import ReputacaoModal from './sidebar/ReputacaoModal';
import NivelModal from './sidebar/NivelModal';
import CultivoModal from './sidebar/CultivoModal';
import SorteModal from './sidebar/SorteModal';
import LojaModal from './sidebar/LojaModal';
import CondicoesModal from './sidebar/CondicoesModal';
import CodexModal from './sidebar/CodexModal';
import ChatModal, { ChatModalConteudo } from './sidebar/ChatModal';
import NotesModal from './notes/NotesModal';
import StatusFaixa from './StatusFaixa';
import { FichaChatPainel, FichaLayout, FichaMain } from './styles';

const ABAS_VALIDAS = [
  'atributos',
  'aptidoes',
  'arts',
  'inventario',
  'treinamento',
  'veiasAstrais',
  'companheiro',
];
const ABA_PADRAO = 'atributos';

const STORAGE_KEY_CHAT_LATERAL = 'reDungeonChatLateralCampanha';

const lerChatLateralPersistido = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const valor = window.localStorage.getItem(STORAGE_KEY_CHAT_LATERAL);
  return valor || null;
};

const Ficha = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setHeaderExtra } = useOutletContext();
  const { selecionarPersonagem } = useSelecao();
  const isMobile = useIsMobile();
  const [personagem, setPersonagem] = useState(null);
  const [loading, setLoading] = useState(true);
  // A aba aberta fica na URL (?aba=): F5 e links voltam para a mesma aba.
  const [searchParams, setSearchParams] = useSearchParams();
  const abaDaUrl = searchParams.get('aba');
  const aba = ABAS_VALIDAS.includes(abaDaUrl) ? abaDaUrl : ABA_PADRAO;
  const setAba = useCallback(
    novaAba => setSearchParams({ aba: novaAba }, { replace: true }),
    [setSearchParams],
  );
  const [dialogExcluir, setDialogExcluir] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [sidebarExpandida, setSidebarExpandida] = useState(true);
  // Celular: a sidebar vira uma gaveta (Drawer), fechada por padrão.
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [modalAtivo, setModalAtivo] = useState(null);
  const [chatLateralCampanhaId, setChatLateralCampanhaId] = useState(() =>
    lerChatLateralPersistido(),
  );
  const [erroExclusao, setErroExclusao] = useState(null);
  const [inventarioAtualizacoes, setInventarioAtualizacoes] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setPersonagem(null);

    getPersonagem(id)
      .then(item => {
        if (!isMounted) {
          return;
        }
        if (!item) {
          navigate('/personagens', { replace: true });
          return;
        }
        setPersonagem(item);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          navigate('/personagens', { replace: true });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  // Ao vivo depois da primeira carga: o PV mudado pelo token no grid, outra
  // aba ou outro aparelho aparecem aqui sem recarregar a página.
  const carregado = Boolean(personagem);
  useEffect(() => {
    if (!carregado) return undefined;
    return subscribePersonagem(
      id,
      dados => {
        if (dados) setPersonagem(dados);
      },
      () => {},
    );
  }, [carregado, id]);

  // `base` de cada save: o personagem que a aba tinha ao montar o patch
  // (padrão: o atual da tela). updatePersonagem mescla em três vias, então o
  // que o jogador não mudou não sobrescreve um valor mais novo do Firestore.
  const personagemRef = useRef(personagem);
  useEffect(() => {
    personagemRef.current = personagem;
  }, [personagem]);

  const handleSave = useCallback(
    async (patch, { base } = {}) => {
      const gravado = await updatePersonagem(id, patch, {
        base: base ?? personagemRef.current,
      });
      setPersonagem(current => ({ ...current, ...(gravado ?? patch) }));
    },
    [id],
  );

  const handleVoltar = useCallback(() => {
    navigate('/personagens');
  }, [navigate]);

  const handleExcluir = useCallback(async () => {
    setExcluindo(true);
    try {
      await removePersonagem(id);
      navigate('/personagens', { replace: true });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Falha ao excluir personagem:', error);
      setErroExclusao('Não foi possível excluir o personagem. Verifique sua conexão e tente novamente.');
      setExcluindo(false);
    }
  }, [id, navigate]);

  const fecharModal = useCallback(() => setModalAtivo(null), []);

  const abrirModalDaGaveta = useCallback(chave => {
    setGavetaAberta(false);
    setModalAtivo(chave);
  }, []);

  const abrirChatLateral = useCallback(campanhaId => {
    setChatLateralCampanhaId(campanhaId);
    setModalAtivo(null);
  }, []);

  const fecharChatLateral = useCallback(() => {
    setChatLateralCampanhaId(null);
  }, []);

  const handleInventarioAtualizado = useCallback(() => {
    setInventarioAtualizacoes(current => current + 1);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (chatLateralCampanhaId) {
      window.localStorage.setItem(STORAGE_KEY_CHAT_LATERAL, chatLateralCampanhaId);
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY_CHAT_LATERAL);
  }, [chatLateralCampanhaId]);

  // `labelCurto`: rótulo da aba no celular (Layout põe as abas numa 2ª linha,
  // com o ícone em cima).
  const tabsFicha = useMemo(
    () => [
      { value: 'atributos', label: 'Atributos', icon: <EqualizerIcon fontSize="small" /> },
      { value: 'aptidoes', label: 'Aptidões', icon: <AutoAwesomeIcon fontSize="small" /> },
      { value: 'arts', label: 'Artes', icon: <AutoFixHighIcon fontSize="small" /> },
      { value: 'inventario', label: 'Inventário', icon: <Inventory2Icon fontSize="small" /> },
      {
        value: 'treinamento',
        label: 'Treinamento',
        labelCurto: 'Treino',
        icon: <FitnessCenterIcon fontSize="small" />,
      },
      { value: 'veiasAstrais', label: 'Veias Astrais', labelCurto: 'Veias', icon: <HubIcon fontSize="small" /> },
      { value: 'companheiro', label: 'Companheiro', labelCurto: 'Comp.', icon: <PetsIcon fontSize="small" /> },
    ],
    [],
  );

  useEffect(() => {
    if (!personagem) {
      return undefined;
    }
    setHeaderExtra({
      nome: personagem.nome,
      onVoltar: handleVoltar,
      // Celular: o ☰ da gaveta fica ao lado das abas, no cabeçalho.
      onAbrirMenu: isMobile ? () => setGavetaAberta(true) : undefined,
      tabs: {
        value: aba,
        onChange: (_event, novaAba) => setAba(novaAba),
        items: tabsFicha,
      },
    });
    return () => setHeaderExtra(null);
  }, [aba, handleVoltar, isMobile, personagem, setAba, setHeaderExtra, tabsFicha]);

  // Lembra a ficha aberta para o link "Campanhas" do cabeçalho abrir o chat
  // da campanha deste personagem (e "Fichas" voltar para cá depois).
  useEffect(() => {
    if (personagem) selecionarPersonagem(personagem);
  }, [personagem, selecionarPersonagem]);

  if (loading || !personagem) {
    return (
      <FichaMain>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </FichaMain>
    );
  }

  return (
    <SavingProvider>
      <FichaLayout>
        {isMobile ? (
          <Drawer
            open={gavetaAberta}
            onClose={() => setGavetaAberta(false)}
            slotProps={{ paper: { sx: { background: 'var(--bg-secondary)' } } }}
          >
            <FichaSidebar
              expandida
              naGaveta
              onAlternar={() => setGavetaAberta(false)}
              onAbrirModal={abrirModalDaGaveta}
            />
          </Drawer>
        ) : (
          <FichaSidebar
            expandida={sidebarExpandida}
            onAlternar={() => setSidebarExpandida(current => !current)}
            onAbrirModal={setModalAtivo}
          />
        )}

        <FichaMain>
          <StatusFaixa personagem={personagem} />

          <ErrorBoundary key={aba} mensagem="Não foi possível exibir esta aba. Troque de aba ou recarregue a página.">
            {aba === 'atributos' && (
              <AtributosTab
                personagem={personagem}
                onSave={handleSave}
                onExcluir={() => setDialogExcluir(true)}
              />
            )}
            {aba === 'aptidoes' && <AptidoesTab personagem={personagem} onSave={handleSave} />}
            {aba === 'arts' && <ArtsTab personagem={personagem} onSave={handleSave} />}
            {aba === 'inventario' && (
              <InventarioTab personagem={personagem} inventarioAtualizacoes={inventarioAtualizacoes} />
            )}
            {aba === 'treinamento' && <TreinamentoTab personagem={personagem} onSave={handleSave} />}
            {aba === 'veiasAstrais' && <VeiasAstraisTab personagem={personagem} onSave={handleSave} />}
            {aba === 'companheiro' && <CompanheiroTab personagem={personagem} />}
          </ErrorBoundary>

          <Dialog open={dialogExcluir} onClose={() => setDialogExcluir(false)}>
            <DialogTitle>Excluir Personagem</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Tem certeza que deseja excluir <strong>{personagem.nome}</strong>? Essa ação não pode ser
                desfeita.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogExcluir(false)} disabled={excluindo}>
                Cancelar
              </Button>
              <Button color="error" variant="contained" onClick={handleExcluir} disabled={excluindo}>
                Excluir
              </Button>
            </DialogActions>
          </Dialog>

          <InfoModal open={modalAtivo === 'info'} onClose={fecharModal} personagem={personagem} onSave={handleSave} />
          <AptidaoConsultaModal open={modalAtivo === 'aptidao'} onClose={fecharModal} personagem={personagem} />
          <RacaModal open={modalAtivo === 'raca'} onClose={fecharModal} personagem={personagem} onSave={handleSave} />
          <ClasseModal open={modalAtivo === 'classe'} onClose={fecharModal} personagem={personagem} onSave={handleSave} />
          <ReputacaoModal
            open={modalAtivo === 'reputacao'}
            onClose={fecharModal}
            personagem={personagem}
            onSave={handleSave}
          />
          <NivelModal open={modalAtivo === 'nivel'} onClose={fecharModal} personagem={personagem} onSave={handleSave} />
          <CultivoModal
            open={modalAtivo === 'cultivo'}
            onClose={fecharModal}
            personagem={personagem}
            onSave={handleSave}
          />
          <SorteModal open={modalAtivo === 'sorte'} onClose={fecharModal} personagem={personagem} onSave={handleSave} />
          <LojaModal
            open={modalAtivo === 'loja'}
            onClose={fecharModal}
            personagem={personagem}
            onSave={handleSave}
            onInventarioAtualizado={handleInventarioAtualizado}
          />
          <CondicoesModal
            open={modalAtivo === 'condicoes'}
            onClose={fecharModal}
            personagem={personagem}
            onSave={handleSave}
          />
          <CodexModal open={modalAtivo === 'codex'} onClose={fecharModal} personagem={personagem} />
          <ChatModal
            open={modalAtivo === 'chat'}
            onClose={fecharModal}
            personagem={personagem}
            onAbrirPainelLateral={abrirChatLateral}
          />
          <NotesModal open={modalAtivo === 'notas'} onClose={fecharModal} personagem={personagem} />

          <ErrorSnackbar
            open={!!erroExclusao}
            mensagem={erroExclusao}
            onClose={() => setErroExclusao(null)}
          />
        </FichaMain>

        {chatLateralCampanhaId &&
          (isMobile ? (
            <Drawer
              open={Boolean(chatLateralCampanhaId)}
              onClose={fecharChatLateral}
              anchor="right"
              slotProps={{
                paper: {
                  sx: {
                    width: '100vw',
                    maxWidth: '100vw',
                    height: '100dvh',
                    maxHeight: '100dvh',
                    borderRadius: 0,
                    background: 'var(--bg-secondary)',
                    borderLeft: '1px solid var(--border-primary)',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    pt: 'env(safe-area-inset-top)',
                    pb: 'env(safe-area-inset-bottom)',
                  },
                },
              }}
            >
              <Box sx={{ width: '100%', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden' }}>
                <ChatModalConteudo
                  personagem={personagem}
                  modo="painel"
                  onClose={fecharChatLateral}
                  campanhaIdInicial={chatLateralCampanhaId}
                />
              </Box>
            </Drawer>
          ) : (
            <FichaChatPainel>
              <ChatModalConteudo
                personagem={personagem}
                modo="painel"
                onClose={fecharChatLateral}
                campanhaIdInicial={chatLateralCampanhaId}
              />
            </FichaChatPainel>
          ))}
      </FichaLayout>
    </SavingProvider>
  );
};

export default Ficha;
