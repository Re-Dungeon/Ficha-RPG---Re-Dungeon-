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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>🔍 Visualizar Art</DialogTitle>
      <DialogContent>
        <DialogTwoColumns>
          <ImagePreviewBox>{art.imagem ? <img src={art.imagem} alt={art.nome} /> : '🎴'}</ImagePreviewBox>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 16 }}>
              {CAMPOS_GRID.map(([label, campo]) => (
                <StatGridCell key={campo} style={{ background: 'var(--bg-card)', borderRadius: 6 }}>
                  <StatGridLabel>{label}</StatGridLabel>
                  <StatGridValue>{art[campo] || '-'}</StatGridValue>
                </StatGridCell>
              ))}
            </div>

            {art.descricao && (
              <div style={{ marginTop: 16 }}>
                <NucleoMeta style={{ display: 'block', fontWeight: 600 }}>Descrição:</NucleoMeta>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{art.descricao}</p>
              </div>
            )}
            {art.cantico && (
              <div style={{ marginTop: 16 }}>
                <NucleoMeta style={{ display: 'block', fontWeight: 600 }}>🎵 Cântico:</NucleoMeta>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                  {art.cantico}
                </p>
              </div>
            )}
          </div>
        </DialogTwoColumns>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button variant="contained" onClick={onEditar}>
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
