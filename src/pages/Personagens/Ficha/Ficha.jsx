import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HubIcon from '@mui/icons-material/Hub';
import PetsIcon from '@mui/icons-material/Pets';

import { getPersonagem, removePersonagem, updatePersonagem } from 'service/storage';
import { useSelecao } from 'context/selecaoContext';
import { SavingProvider } from 'context/SavingContext';
import { MOBILE } from 'common/styles/breakpoints';
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
import ChatModal from './sidebar/ChatModal';
import NotesModal from './notes/NotesModal';
import { FichaLayout, FichaMain, TabsBar } from './styles';

// `labelCurto`: rótulo das abas no celular (ícone em cima, aba estreita).
const ABAS = [
  { value: 'atributos', label: 'Atributos', labelCurto: 'Atributos', Icon: EqualizerIcon },
  { value: 'aptidoes', label: 'Aptidões', labelCurto: 'Aptidões', Icon: AutoAwesomeIcon },
  { value: 'arts', label: 'Artes', labelCurto: 'Artes', Icon: AutoFixHighIcon },
  { value: 'inventario', label: 'Inventário', labelCurto: 'Inventário', Icon: Inventory2Icon },
  { value: 'treinamento', label: 'Treinamento', labelCurto: 'Treino', Icon: FitnessCenterIcon },
  { value: 'veiasAstrais', label: 'Veias Astrais', labelCurto: 'Veias', Icon: HubIcon },
  { value: 'companheiro', label: 'Companheiro', labelCurto: 'Comp.', Icon: PetsIcon },
];

const Ficha = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setHeaderExtra } = useOutletContext();
  const { selecionarPersonagem } = useSelecao();
  const isMobile = useIsMobile();
  const [personagem, setPersonagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState('atributos');
  const [dialogExcluir, setDialogExcluir] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [sidebarExpandida, setSidebarExpandida] = useState(true);
  // Celular: a sidebar vira uma gaveta (Drawer), fechada por padrão.
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [modalAtivo, setModalAtivo] = useState(null);
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

  const handleSave = useCallback(
    async patch => {
      await updatePersonagem(id, patch);
      setPersonagem(current => ({ ...current, ...patch }));
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

  const handleInventarioAtualizado = useCallback(() => {
    setInventarioAtualizacoes(current => current + 1);
  }, []);

  useEffect(() => {
    if (!personagem) {
      return undefined;
    }
    setHeaderExtra({ nome: personagem.nome, onVoltar: handleVoltar });
    return () => setHeaderExtra(null);
  }, [personagem, handleVoltar, setHeaderExtra]);

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
          <TabsBar>
            {isMobile && (
              <IconButton
                aria-label="Abrir menu da ficha"
                onClick={() => setGavetaAberta(true)}
                sx={{ color: 'var(--status-gold)', flexShrink: 0 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Tabs
              value={aba}
              onChange={(_event, novaAba) => setAba(novaAba)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile={isMobile}
              textColor="inherit"
              sx={{ [MOBILE]: { flex: 1, minWidth: 0, '& .MuiTabs-scrollButtons': { width: 24 } } }}
            >
              {ABAS.map(({ value, label, labelCurto, Icon }) =>
                isMobile ? (
                  <Tab
                    key={value}
                    value={value}
                    label={labelCurto}
                    aria-label={label}
                    icon={<Icon fontSize="small" />}
                    iconPosition="top"
                    sx={{ minWidth: 64, minHeight: 56, px: 1, py: 0.75, fontSize: '0.68rem' }}
                  />
                ) : (
                  <Tab key={value} value={value} label={label} icon={<Icon fontSize="small" />} iconPosition="start" />
                ),
              )}
            </Tabs>
          </TabsBar>

          <ErrorBoundary key={aba} mensagem="Não foi possível exibir esta aba. Troque de aba ou recarregue a página.">
            {aba === 'atributos' && (
              <AtributosTab
                personagem={personagem}
                onSave={handleSave}
                onExcluir={() => setDialogExcluir(true)}
              />
            )}
            {aba === 'aptidoes' && <AptidoesTab personagem={personagem} onSave={handleSave} />}
            {aba === 'arts' && <ArtsTab personagem={personagem} />}
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
          <ChatModal open={modalAtivo === 'chat'} onClose={fecharModal} personagem={personagem} />
          <NotesModal open={modalAtivo === 'notas'} onClose={fecharModal} personagem={personagem} />

          <ErrorSnackbar
            open={!!erroExclusao}
            mensagem={erroExclusao}
            onClose={() => setErroExclusao(null)}
          />
        </FichaMain>
      </FichaLayout>
    </SavingProvider>
  );
};

export default Ficha;
