import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';

import { getNome } from 'common/utils/resolveNome';
import { corRaridade, RaridadeBadge } from '../progressao/styles';

import { RECEITA_STAT_CAMPOS, obterValorStatItem } from './constants';
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

const ReceitaViewDialog = ({ open, onClose, receita, onEditar }) => {
  if (!receita) {
    return null;
  }

  const materiaisNecessarios = receita.materiais ?? [];
  const celulasExtras = [['Quantidade', receita.quantidade]];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogHeaderRow>
        <DialogHeaderTitle>📜 {getNome(receita)}</DialogHeaderTitle>
        <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </DialogFecharButton>
      </DialogHeaderRow>
      <DialogContent>
        <ModalImagemGrande>
          {receita.linkImagem ? <img src={receita.linkImagem} alt={getNome(receita)} /> : '📜'}
        </ModalImagemGrande>

        <ModalNomeRow>
          <ItemNome style={{ fontSize: '1.2rem' }}>📜 {getNome(receita)}</ItemNome>
        </ModalNomeRow>
        {receita.raridade && (
          <div style={{ marginTop: 8 }}>
            <RaridadeBadge $cor={corRaridade(receita.raridade)}>{receita.raridade}</RaridadeBadge>
          </div>
        )}

        <ModalStatGrid>
          {RECEITA_STAT_CAMPOS.map(([label, campo]) => (
            <ItemBloco key={label}>
              <ItemBlocoLabel>{label}</ItemBlocoLabel>
              <ItemBlocoValor>{obterValorStatItem(receita, campo) || '—'}</ItemBlocoValor>
            </ItemBloco>
          ))}
          {celulasExtras.map(([label, valor]) => (
            <ItemBloco key={label}>
              <ItemBlocoLabel>{label}</ItemBlocoLabel>
              <ItemBlocoValor>{valor}</ItemBlocoValor>
            </ItemBloco>
          ))}
        </ModalStatGrid>

        {receita.descricao && (
          <>
            <ModalSecaoTitulo>📖 Descrição</ModalSecaoTitulo>
            <ModalSecaoBox>{receita.descricao}</ModalSecaoBox>
          </>
        )}

        {materiaisNecessarios.length > 0 && (
          <>
            <ModalSecaoTitulo>🧱 Materiais Necessários</ModalSecaoTitulo>
            <ModalSecaoBox>
              {materiaisNecessarios.map((material, index) => (
                <div key={material.materialId ?? material.nome ?? index}>
                  {material.nome ?? material.materialId} {material.quantidade ? `x${material.quantidade}` : ''}
                </div>
              ))}
            </ModalSecaoBox>
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

ReceitaViewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  receita: PropTypes.object,
  onEditar: PropTypes.func.isRequired,
};

ReceitaViewDialog.defaultProps = {
  receita: null,
};

export default ReceitaViewDialog;
