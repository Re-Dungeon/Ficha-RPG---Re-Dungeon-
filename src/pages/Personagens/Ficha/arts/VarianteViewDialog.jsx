import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
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

const VarianteViewDialog = ({ open, onClose, variante, art, nucleo, condicoes, onEditar }) => {
  if (!variante) {
    return null;
  }

  const tipoMeta = TIPO_ART_META[variante.tipo] ?? {};
  const condicoesAplicadas = (variante.condicoesAplicadas ?? [])
    .map(id => condicoes.find(condicao => condicao.id === id))
    .filter(Boolean);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <ViewDialogHeader>
        <ViewHeaderLeft>
          <ViewHeaderIcon>🎴</ViewHeaderIcon>
          <div>
            <ViewTitleMain>Visualizar Variante</ViewTitleMain>
            <ViewTitleSub>Informações completas da variante.</ViewTitleSub>
          </div>
        </ViewHeaderLeft>
        <div />
      </ViewDialogHeader>
      <DialogContent sx={{ padding: '10px 14px' }}>
        <DialogTwoColumns>
          <ImagePreviewBox>
            {variante.imagem ? <img src={variante.imagem} alt={variante.nome} /> : '🎴'}
          </ImagePreviewBox>
          <div>
            <ArtNome style={{ fontSize: '1.3rem', marginBottom: 12 }}>{variante.nome}</ArtNome>
            <NucleoMeta style={{ display: 'block' }}>
              <strong>Art:</strong> {art?.nome ?? 'Desconhecida'}
            </NucleoMeta>
            <NucleoMeta style={{ display: 'block', marginTop: 4 }}>
              <strong>Núcleo:</strong> {nucleo?.nome ?? 'Desconhecido'}
            </NucleoMeta>
            {variante.tipo && (
              <NucleoMeta style={{ display: 'block', marginTop: 4 }}>
                <strong>Tipo:</strong>{' '}
                <Badge $cor={tipoMeta.cor}>
                  {tipoMeta.icone} {variante.tipo}
                </Badge>
              </NucleoMeta>
            )}
            {variante.dominio && (
              <NucleoMeta style={{ display: 'block', marginTop: 4 }}>
                <strong>Domínio:</strong> {variante.dominio} — {DOMINIO_LABELS[variante.dominio]}
              </NucleoMeta>
            )}
            {variante.circuloMagico && (
              <NucleoMeta style={{ display: 'block', marginTop: 4 }}>
                <strong>Círculo Mágico:</strong> {variante.circuloMagico}
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
                  <StatGridValue>{variante[campo] || '-'}</StatGridValue>
                </StatGridCell>
              ))}
            </ViewStatsGrid>

            {variante.descricao && (
              <DescriptionCard>
                <div>
                  <NucleoMeta style={{ display: 'block', fontWeight: 600 }}>📜 Descrição</NucleoMeta>
                  <div style={{ marginTop: 6, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{variante.descricao}</div>
                </div>
              </DescriptionCard>
            )}
            {variante.cantico && (
              <DescriptionCard>
                <div>
                  <NucleoMeta style={{ display: 'block', fontWeight: 600, marginTop: 12 }}>🎵 Cântico</NucleoMeta>
                  <div style={{ marginTop: 6, fontStyle: 'italic', color: 'var(--text-secondary)' }}>{variante.cantico}</div>
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

VarianteViewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  variante: PropTypes.object,
  art: PropTypes.object,
  nucleo: PropTypes.object,
  condicoes: PropTypes.array,
  onEditar: PropTypes.func.isRequired,
};

VarianteViewDialog.defaultProps = {
  variante: null,
  art: null,
  nucleo: null,
  condicoes: [],
};

export default VarianteViewDialog;
