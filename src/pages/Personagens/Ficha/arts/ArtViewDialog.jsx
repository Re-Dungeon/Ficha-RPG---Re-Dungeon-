import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { getNome } from 'common/utils/resolveNome';

import { DOMINIO_LABELS, TIPO_ART_META } from './constants';
import {
  ArtNome,
  Badge,
  DialogTwoColumns,
  ImagePreviewBox,
  NucleoMeta,
  StatGridCell,
  StatGridLabel,
  StatGridValue,
  ViewDialogHeader,
  ViewHeaderLeft,
  ViewHeaderIcon,
  ViewTitleMain,
  ViewTitleSub,
  ViewStatsGrid,
  DescriptionCard,
} from './styles';

const CAMPOS_GRID = [
  ['Custo', 'custo'],
  ['Recarga', 'recarga'],
  ['Duração', 'duracao'],
  ['Alcance', 'alcance'],
  ['Alvos', 'alvos'],
  ['Dados', 'dados'],
];

const ArtViewDialog = ({ open, onClose, art, nucleo, condicoes, onEditar }) => {
  if (!art) {
    return null;
  }

  const tipoMeta = TIPO_ART_META[art.tipo] ?? {};
  const condicoesAplicadas = (art.condicoesAplicadas ?? [])
    .map(id => condicoes.find(condicao => condicao.id === id))
    .filter(Boolean);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <ViewDialogHeader>
        <ViewHeaderLeft>
          <ViewHeaderIcon>🎴</ViewHeaderIcon>
          <div>
            <ViewTitleMain>Visualizar Arte</ViewTitleMain>
            <ViewTitleSub>Informações completas da habilidade.</ViewTitleSub>
          </div>
        </ViewHeaderLeft>
        <div />
      </ViewDialogHeader>
      <DialogContent sx={{ padding: '10px 14px' }}>
        <DialogTwoColumns>
          <ImagePreviewBox>
            {art.imagem ? <img src={art.imagem} alt={art.nome} /> : '🎴'}
          </ImagePreviewBox>
          <div>
            <ArtNome style={{ fontSize: '1.3rem', marginBottom: 12 }}>{art.nome}</ArtNome>
            <NucleoMeta style={{ display: 'block' }}>
              <strong>Núcleo:</strong> {nucleo?.nome ?? 'Desconhecido'}
            </NucleoMeta>
            {art.tipo && (
              <NucleoMeta style={{ display: 'block', marginTop: 4 }}>
                <strong>Tipo:</strong>{' '}
                <Badge $cor={tipoMeta.cor}>
                  {tipoMeta.icone} {art.tipo}
                </Badge>
              </NucleoMeta>
            )}
            {art.dominio && (
              <NucleoMeta style={{ display: 'block', marginTop: 4 }}>
                <strong>Domínio:</strong> {art.dominio} — {DOMINIO_LABELS[art.dominio]}
              </NucleoMeta>
            )}
            {art.circuloMagico && (
              <NucleoMeta style={{ display: 'block', marginTop: 4 }}>
                <strong>Círculo Mágico:</strong> {art.circuloMagico}
              </NucleoMeta>
            )}
            {condicoesAplicadas.length > 0 && (
              <NucleoMeta style={{ display: 'block', marginTop: 4 }}>
                <strong>Condições Aplicadas:</strong> {condicoesAplicadas.map(getNome).join(', ')}
              </NucleoMeta>
            )}

            <ViewStatsGrid>
              {CAMPOS_GRID.map(([label, campo]) => (
                <StatGridCell key={campo} style={{ background: 'var(--bg-card)', borderRadius: 6 }}>
                  <StatGridLabel>{label}</StatGridLabel>
                  <StatGridValue>{art[campo] || '-'}</StatGridValue>
                </StatGridCell>
              ))}
            </ViewStatsGrid>

            {art.descricao && (
              <DescriptionCard>
                <div>
                  <NucleoMeta style={{ display: 'block', fontWeight: 600 }}>📜 Descrição</NucleoMeta>
                  <div style={{ marginTop: 6, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{art.descricao}</div>
                </div>
              </DescriptionCard>
            )}
            {art.cantico && (
              <DescriptionCard>
                <div>
                  <NucleoMeta style={{ display: 'block', fontWeight: 600, marginTop: 12 }}>🎵 Cântico</NucleoMeta>
                  <div style={{ marginTop: 6, fontStyle: 'italic', color: 'var(--text-secondary)' }}>{art.cantico}</div>
                </div>
              </DescriptionCard>
            )}
          </div>
        </DialogTwoColumns>
      </DialogContent>
      <DialogActions sx={{ gap: 2, padding: '8px 14px' }}>
        <Button onClick={onClose} sx={{ border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: 1 }}>
          Fechar
        </Button>
        <Button
          variant="contained"
          onClick={onEditar}
          sx={{
            background: 'linear-gradient(90deg, rgba(108,99,255,0.95), rgba(91,124,250,0.95))',
            boxShadow: '0 10px 24px rgba(33,61,150,0.18)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: 1,
          }}
        >
          ✏️ Editar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ArtViewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  art: PropTypes.object,
  nucleo: PropTypes.object,
  condicoes: PropTypes.array,
  onEditar: PropTypes.func.isRequired,
};

ArtViewDialog.defaultProps = {
  art: null,
  nucleo: null,
  condicoes: [],
};

export default ArtViewDialog;
