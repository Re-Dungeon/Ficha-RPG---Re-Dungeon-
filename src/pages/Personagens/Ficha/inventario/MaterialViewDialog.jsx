import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';

import { getNome } from 'common/utils/resolveNome';
import { corRaridade, RaridadeBadge } from '../progressao/styles';

import { MATERIAL_STAT_CAMPOS, obterValorStatItem } from './constants';
import {
  ItemBloco,
  ItemBlocoLabel,
  ItemBlocoValor,
  ItemNome,
  ModalImagemGrande,
  ModalNomeRow,
  ModalSecaoBox,
  ModalSecaoTitulo,
  ModalStatGrid,
} from './styles';
import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle } from '../styles';

const MaterialViewDialog = ({ open, onClose, material, onEditar }) => {
  if (!material) {
    return null;
  }

  const celulasExtras = [['Quantidade', material.quantidade]];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogHeaderRow>
        <DialogHeaderTitle>🧱 {getNome(material)}</DialogHeaderTitle>
        <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </DialogFecharButton>
      </DialogHeaderRow>
      <DialogContent>
        <ModalImagemGrande>
          {material.linkImagem ? <img src={material.linkImagem} alt={getNome(material)} /> : '🧱'}
        </ModalImagemGrande>

        <ModalNomeRow>
          <ItemNome style={{ fontSize: '1.2rem' }}>🧱 {getNome(material)}</ItemNome>
        </ModalNomeRow>
        {material.raridade && (
          <div style={{ marginTop: 8 }}>
            <RaridadeBadge $cor={corRaridade(material.raridade)}>{material.raridade}</RaridadeBadge>
          </div>
        )}

        <ModalStatGrid>
          {MATERIAL_STAT_CAMPOS.map(([label, campo]) => (
            <ItemBloco key={label}>
              <ItemBlocoLabel>{label}</ItemBlocoLabel>
              <ItemBlocoValor>{obterValorStatItem(material, campo) || '—'}</ItemBlocoValor>
            </ItemBloco>
          ))}
          {celulasExtras.map(([label, valor]) => (
            <ItemBloco key={label}>
              <ItemBlocoLabel>{label}</ItemBlocoLabel>
              <ItemBlocoValor>{valor}</ItemBlocoValor>
            </ItemBloco>
          ))}
        </ModalStatGrid>

        {material.descricao && (
          <>
            <ModalSecaoTitulo>📖 Descrição</ModalSecaoTitulo>
            <ModalSecaoBox>{material.descricao}</ModalSecaoBox>
          </>
        )}

        {material.propriedades && (
          <>
            <ModalSecaoTitulo>🔬 Propriedades</ModalSecaoTitulo>
            <ModalSecaoBox>{material.propriedades}</ModalSecaoBox>
          </>
        )}
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

MaterialViewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  material: PropTypes.object,
  onEditar: PropTypes.func.isRequired,
};

MaterialViewDialog.defaultProps = {
  material: null,
};

export default MaterialViewDialog;
