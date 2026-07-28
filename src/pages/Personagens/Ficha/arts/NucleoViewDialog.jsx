import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import {
  DialogTwoColumns,
  EssenciaTexto,
  EssenciaTitle,
  HeaderDivider,
  ImagePreviewBox,
  NucleoEssenceCard,
  NucleoInfoGrid,
  NucleoMeta,
  NucleoNome,
  NucleoStatCard,
  NucleoStatLabel,
  NucleoStatValue,
  NucleoImageWrapper,
  ViewDialogHeader,
  ViewHeaderLeft,
  ViewHeaderIcon,
  ViewTitleMain,
  ViewTitleSub,
} from './styles';

const NucleoViewDialog = ({ open, onClose, nucleo, onEditar }) => {
  if (!nucleo) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" sx={{ '& .MuiPaper-root': { borderRadius: '28px', overflow: 'hidden', background: 'rgba(10, 8, 20, 0.96)', border: '1px solid rgba(171, 140, 255, 0.18)', boxShadow: '0 40px 90px rgba(0,0,0,0.42)' } }}>
      <ViewDialogHeader>
        <ViewHeaderLeft>
          <ViewHeaderIcon>🔮</ViewHeaderIcon>
          <div>
            <ViewTitleMain>Visualizar Núcleo</ViewTitleMain>
            <ViewTitleSub>Ficha lendária do núcleo com informações e essência.</ViewTitleSub>
          </div>
        </ViewHeaderLeft>
        <div />
      </ViewDialogHeader>
      <DialogContent sx={{ padding: { xs: '16px 16px 20px', md: '20px 24px 24px' }, maxHeight: '90vh', overflow: 'hidden' }}>
        <DialogTwoColumns>
          <NucleoImageWrapper>
            <ImagePreviewBox>
              {nucleo.imagem ? <img src={nucleo.imagem} alt={nucleo.nome} /> : '🎨'}
            </ImagePreviewBox>
          </NucleoImageWrapper>
          <div>
            <NucleoNome style={{ fontSize: '1.5rem', marginBottom: 14, letterSpacing: '0.02em' }}>{nucleo.nome}</NucleoNome>
            <NucleoInfoGrid>
              <NucleoStatCard>
                <NucleoStatLabel>Tipo</NucleoStatLabel>
                <NucleoStatValue>{nucleo.tipo || 'Não definido'}</NucleoStatValue>
              </NucleoStatCard>
              <NucleoStatCard>
                <NucleoStatLabel>Bônus</NucleoStatLabel>
                <NucleoStatValue>{nucleo.bonus || 'Nenhum'}</NucleoStatValue>
              </NucleoStatCard>
            </NucleoInfoGrid>

            <HeaderDivider />

            <NucleoEssenceCard>
              <EssenciaTitle>✨ Essência</EssenciaTitle>
              <EssenciaTexto>{nucleo.descricao || 'Sem descrição'}</EssenciaTexto>
            </NucleoEssenceCard>
          </div>
        </DialogTwoColumns>
      </DialogContent>
      <DialogActions sx={{ gap: 2, padding: '16px 24px 20px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Button onClick={onClose} sx={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', padding: '10px 18px', borderRadius: '999px', minWidth: 140, background: 'rgba(255,255,255,0.04)', transition: 'all 200ms ease', '&:hover': { background: 'rgba(255,255,255,0.08)', boxShadow: '0 10px 24px rgba(0,0,0,0.22)' } }}>
          Fechar
        </Button>
        <Button
          variant="contained"
          onClick={onEditar}
          sx={{
            minWidth: 140,
            padding: '10px 18px',
            borderRadius: '999px',
            color: '#111',
            background: 'linear-gradient(90deg, rgba(232,203,133,1), rgba(255,223,119,0.96))',
            boxShadow: '0 16px 32px rgba(232,203,133,0.24)',
            transition: 'all 200ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 20px 36px rgba(232,203,133,0.28)',
            },
          }}
        >
          ✏️ Editar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

NucleoViewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  nucleo: PropTypes.object,
  onEditar: PropTypes.func.isRequired,
};

NucleoViewDialog.defaultProps = {
  nucleo: null,
};

export default NucleoViewDialog;
