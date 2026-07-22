import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import { getNome } from 'common/utils/resolveNome';
import { corRaridade, RaridadeBadge } from '../progressao/styles';
import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle, StatusValueRow } from '../styles';

import {
  CatalogoAdicionarBtn,
  CatalogoCondicaoDescricao,
  CatalogoCondicaoIcone,
  CatalogoCondicaoInfo,
  CatalogoCondicaoItem,
  CatalogoCondicaoNome,
  CatalogoCondicoesLista,
} from './styles';

const CondicoesCatalogoDialog = ({ open, onClose, catalogo, busca, onBuscaChange, temUniverso, onAdicionar }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogHeaderRow>
      <DialogHeaderTitle>📋 Códex de Condições</DialogHeaderTitle>
      <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </DialogFecharButton>
    </DialogHeaderRow>

    <DialogContent>
      <TextField
        fullWidth
        size="small"
        placeholder="🔍 Buscar condição..."
        value={busca}
        onChange={event => onBuscaChange(event.target.value)}
        sx={{ marginBottom: 2, marginTop: 1 }}
      />

      {!temUniverso && (
        <StatusValueRow style={{ display: 'block' }}>
          Selecione um Universo no menu lateral Info primeiro.
        </StatusValueRow>
      )}

      {temUniverso && catalogo.length === 0 && (
        <StatusValueRow style={{ display: 'block' }}>Nenhuma condição encontrada.</StatusValueRow>
      )}

      <CatalogoCondicoesLista>
        {catalogo.map(item => (
          <CatalogoCondicaoItem key={item.id}>
            <CatalogoCondicaoIcone>
              {item.linkImagem ? <img src={item.linkImagem} alt="" /> : '⚠️'}
            </CatalogoCondicaoIcone>
            <CatalogoCondicaoInfo>
              <CatalogoCondicaoNome>{getNome(item)}</CatalogoCondicaoNome>
              {item.descricao && <CatalogoCondicaoDescricao>{item.descricao}</CatalogoCondicaoDescricao>}
              {item.raridade && (
                <div>
                  <RaridadeBadge $cor={corRaridade(item.raridade)}>{item.raridade}</RaridadeBadge>
                </div>
              )}
            </CatalogoCondicaoInfo>
            <CatalogoAdicionarBtn
              type="button"
              aria-label={`Adicionar ${getNome(item)}`}
              onClick={() => onAdicionar(item.id)}
            >
              <AddIcon fontSize="small" />
            </CatalogoAdicionarBtn>
          </CatalogoCondicaoItem>
        ))}
      </CatalogoCondicoesLista>
    </DialogContent>
  </Dialog>
);

CondicoesCatalogoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  catalogo: PropTypes.array.isRequired,
  busca: PropTypes.string.isRequired,
  onBuscaChange: PropTypes.func.isRequired,
  temUniverso: PropTypes.bool.isRequired,
  onAdicionar: PropTypes.func.isRequired,
};

export default CondicoesCatalogoDialog;
