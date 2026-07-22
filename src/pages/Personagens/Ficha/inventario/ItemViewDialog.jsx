import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';

import { getNome } from 'common/utils/resolveNome';

import { ITEM_STAT_CAMPOS, QUALIDADE_META, obterEmojiTipo, obterValorStatItem } from './constants';
import {
  ItemBloco,
  ItemBlocoLabel,
  ItemBlocoValor,
  ItemEspacoValor,
  ItemNome,
  ModalEspacoBox,
  ModalEspacoColuna,
  ModalHabilidadeNome,
  ModalImagemGrande,
  ModalNomeRow,
  ModalSecaoBox,
  ModalSecaoTitulo,
  ModalStatGrid,
  QualidadeBadge,
} from './styles';
import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle } from '../styles';

const ItemViewDialog = ({ open, onClose, item, onEditar }) => {
  if (!item) {
    return null;
  }

  const qualidadeMeta = QUALIDADE_META[item.qualidade] ?? {};
  const emoji = obterEmojiTipo(item.tipo);
  const espacoUnitario = item.pesoUnitario ?? 0;
  const espacoTotal = espacoUnitario * (item.quantidade ?? 1);
  const habilidades = item.habilidadesEspeciais ?? [];

  const celulasExtras = [
    ['Quantidade', item.quantidade],
    ['Status', item.equipado ? '⚔️ Equipado' : '📦 No Inventário'],
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogHeaderRow>
        <DialogHeaderTitle>
          {emoji} {getNome(item)}
        </DialogHeaderTitle>
        <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </DialogFecharButton>
      </DialogHeaderRow>
      <DialogContent>
        <ModalImagemGrande>
          {item.linkImagem ? <img src={item.linkImagem} alt={getNome(item)} /> : emoji}
        </ModalImagemGrande>

        <ModalNomeRow>
          <ItemNome style={{ fontSize: '1.2rem' }}>
            {emoji} {getNome(item)}
          </ItemNome>
        </ModalNomeRow>
        {item.qualidade && (
          <div style={{ marginTop: 8 }}>
            <QualidadeBadge $cor={qualidadeMeta.cor}>{item.qualidade}</QualidadeBadge>
          </div>
        )}

        <ModalStatGrid>
          {ITEM_STAT_CAMPOS.map(([label, campo]) => (
            <ItemBloco key={label}>
              <ItemBlocoLabel>{label}</ItemBlocoLabel>
              <ItemBlocoValor>{obterValorStatItem(item, campo) || '—'}</ItemBlocoValor>
            </ItemBloco>
          ))}
          {celulasExtras.map(([label, valor]) => (
            <ItemBloco key={label}>
              <ItemBlocoLabel>{label}</ItemBlocoLabel>
              <ItemBlocoValor>{valor}</ItemBlocoValor>
            </ItemBloco>
          ))}
        </ModalStatGrid>

        <ModalEspacoBox>
          <ModalEspacoColuna>
            <ItemBlocoLabel>Espaço Unitário</ItemBlocoLabel>
            <ItemEspacoValor style={{ fontSize: '1rem' }}>{espacoUnitario.toFixed(2)}</ItemEspacoValor>
          </ModalEspacoColuna>
          <ModalEspacoColuna>
            <ItemBlocoLabel>Espaço Total</ItemBlocoLabel>
            <ItemEspacoValor style={{ fontSize: '1rem' }}>{espacoTotal.toFixed(2)}</ItemEspacoValor>
          </ModalEspacoColuna>
        </ModalEspacoBox>

        {item.descricao && (
          <>
            <ModalSecaoTitulo>📖 Descrição</ModalSecaoTitulo>
            <ModalSecaoBox>{item.descricao}</ModalSecaoBox>
          </>
        )}

        {habilidades.length > 0 && (
          <>
            <ModalSecaoTitulo>⚡ Habilidades Especiais</ModalSecaoTitulo>
            <ModalSecaoBox>
              {habilidades.map((habilidade, index) => (
                <div key={habilidade.nome ?? index} style={{ marginTop: index > 0 ? 10 : 0 }}>
                  {habilidade.nome && <ModalHabilidadeNome>{habilidade.nome}</ModalHabilidadeNome>}
                  <p style={{ margin: 0 }}>{habilidade.descricao}</p>
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

ItemViewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object,
  onEditar: PropTypes.func.isRequired,
};

ItemViewDialog.defaultProps = {
  item: null,
};

export default ItemViewDialog;
