import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';

import { getPersonagem, removePersonagem, updatePersonagem } from 'service/storage';

import AtributosTab from './tabs/AtributosTab';
import AptidoesTab from './tabs/AptidoesTab';
import ArtsTab from './tabs/ArtsTab';
import InventarioTab from './tabs/InventarioTab';
import TreinamentoTab from './tabs/TreinamentoTab';
import VeiasAstraisTab from './tabs/VeiasAstraisTab';
import FichaSidebar from './sidebar/FichaSidebar';
import InfoModal from './sidebar/InfoModal';
import AptidaoConsultaModal from './sidebar/AptidaoConsultaModal';
import RacaModal from './sidebar/RacaModal';
import ClasseModal from './sidebar/ClasseModal';
import SorteModal from './sidebar/SorteModal';
import LojaModal from './sidebar/LojaModal';
import CondicoesModal from './sidebar/CondicoesModal';
import CodexModal from './sidebar/CodexModal';
import { FichaLayout, FichaMain, HeaderTitleRow, PageHeader, PageTitle } from './styles';

const Ficha = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [personagem, setPersonagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState('atributos');
  const [dialogExcluir, setDialogExcluir] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [sidebarExpandida, setSidebarExpandida] = useState(true);
  const [modalAtivo, setModalAtivo] = useState(null);

  useEffect(() => {
    let isMounted = true;

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
    await removePersonagem(id);
    navigate('/personagens', { replace: true });
  }, [id, navigate]);

  const fecharModal = useCallback(() => setModalAtivo(null), []);

  if (loading || !personagem) {
    return (
      <FichaMain>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </FichaMain>
    );
  }

  return (
    <FichaLayout>
      <FichaSidebar
        expandida={sidebarExpandida}
        onAlternar={() => setSidebarExpandida(current => !current)}
        onAbrirModal={setModalAtivo}
      />

      <FichaMain>
        <PageHeader>
          <HeaderTitleRow>
            <IconButton aria-label="Voltar" onClick={handleVoltar} sx={{ color: 'var(--text-primary)' }}>
              <ArrowBackIcon />
            </IconButton>
            <PageTitle>{personagem.nome}</PageTitle>
          </HeaderTitleRow>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setDialogExcluir(true)}
          >
            Excluir Personagem
          </Button>
        </PageHeader>

        <Tabs
          value={aba}
          onChange={(_event, novaAba) => setAba(novaAba)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="inherit"
          slotProps={{ indicator: { style: { backgroundColor: 'var(--color-accent)' } } }}
        >
          <Tab value="atributos" label="Atributos" />
          <Tab value="aptidoes" label="Aptidões" />
          <Tab value="arts" label="Artes" />
          <Tab value="inventario" label="Inventário" />
          <Tab value="treinamento" label="Treinamento" />
          <Tab value="veiasAstrais" label="Veias Astrais" />
        </Tabs>

        {aba === 'atributos' && <AtributosTab personagem={personagem} onSave={handleSave} />}
        {aba === 'aptidoes' && <AptidoesTab personagem={personagem} onSave={handleSave} />}
        {aba === 'arts' && <ArtsTab personagem={personagem} onSave={handleSave} />}
        {aba === 'inventario' && <InventarioTab personagem={personagem} onSave={handleSave} />}
        {aba === 'treinamento' && <TreinamentoTab personagem={personagem} onSave={handleSave} />}
        {aba === 'veiasAstrais' && <VeiasAstraisTab personagem={personagem} onSave={handleSave} />}

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
        <SorteModal open={modalAtivo === 'sorte'} onClose={fecharModal} personagem={personagem} onSave={handleSave} />
        <LojaModal open={modalAtivo === 'loja'} onClose={fecharModal} personagem={personagem} onSave={handleSave} />
        <CondicoesModal
          open={modalAtivo === 'condicoes'}
          onClose={fecharModal}
          personagem={personagem}
          onSave={handleSave}
        />
        <CodexModal open={modalAtivo === 'codex'} onClose={fecharModal} personagem={personagem} />
      </FichaMain>
    </FichaLayout>
  );
};

export default Ficha;
