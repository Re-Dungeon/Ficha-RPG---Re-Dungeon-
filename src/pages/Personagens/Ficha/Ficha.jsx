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
import EqualizerIcon from '@mui/icons-material/Equalizer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HubIcon from '@mui/icons-material/Hub';
import PetsIcon from '@mui/icons-material/Pets';

import { getPersonagem, removePersonagem, updatePersonagem } from 'service/storage';
import { SavingProvider } from 'context/SavingContext';
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
import { CULTIVO_UNIVERSO_ID } from './cultivo/constants';
import { FichaLayout, FichaMain, TabsBar } from './styles';

const Ficha = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setHeaderExtra } = useOutletContext();
  const [personagem, setPersonagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState('atributos');
  const [dialogExcluir, setDialogExcluir] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [sidebarExpandida, setSidebarExpandida] = useState(true);
  const [modalAtivo, setModalAtivo] = useState(null);
  const [erroExclusao, setErroExclusao] = useState(null);

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

  useEffect(() => {
    if (!personagem) {
      return undefined;
    }
    setHeaderExtra({ nome: personagem.nome, onVoltar: handleVoltar });
    return () => setHeaderExtra(null);
  }, [personagem, handleVoltar, setHeaderExtra]);

  if (loading || !personagem) {
    return (
      <FichaMain>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </FichaMain>
    );
  }

  const mostrarCultivo = personagem.universo === CULTIVO_UNIVERSO_ID;

  return (
    <SavingProvider>
      <FichaLayout>
        <FichaSidebar
          expandida={sidebarExpandida}
          onAlternar={() => setSidebarExpandida(current => !current)}
          onAbrirModal={setModalAtivo}
          mostrarCultivo={mostrarCultivo}
        />

        <FichaMain>
          <TabsBar>
            <Tabs
              value={aba}
              onChange={(_event, novaAba) => setAba(novaAba)}
              variant="scrollable"
              scrollButtons="auto"
              textColor="inherit"
            >
              <Tab value="atributos" label="Atributos" icon={<EqualizerIcon fontSize="small" />} iconPosition="start" />
              <Tab value="aptidoes" label="Aptidões" icon={<AutoAwesomeIcon fontSize="small" />} iconPosition="start" />
              <Tab value="arts" label="Artes" icon={<AutoFixHighIcon fontSize="small" />} iconPosition="start" />
              <Tab value="inventario" label="Inventário" icon={<Inventory2Icon fontSize="small" />} iconPosition="start" />
              <Tab
                value="treinamento"
                label="Treinamento"
                icon={<FitnessCenterIcon fontSize="small" />}
                iconPosition="start"
              />
              <Tab value="veiasAstrais" label="Veias Astrais" icon={<HubIcon fontSize="small" />} iconPosition="start" />
              <Tab value="companheiro" label="Companheiro" icon={<PetsIcon fontSize="small" />} iconPosition="start" />
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
            {aba === 'inventario' && <InventarioTab personagem={personagem} />}
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
          {mostrarCultivo && (
            <CultivoModal
              open={modalAtivo === 'cultivo'}
              onClose={fecharModal}
              personagem={personagem}
              onSave={handleSave}
            />
          )}
          <SorteModal open={modalAtivo === 'sorte'} onClose={fecharModal} personagem={personagem} onSave={handleSave} />
          <LojaModal open={modalAtivo === 'loja'} onClose={fecharModal} personagem={personagem} onSave={handleSave} />
          <CondicoesModal
            open={modalAtivo === 'condicoes'}
            onClose={fecharModal}
            personagem={personagem}
            onSave={handleSave}
          />
          <CodexModal open={modalAtivo === 'codex'} onClose={fecharModal} personagem={personagem} />

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
