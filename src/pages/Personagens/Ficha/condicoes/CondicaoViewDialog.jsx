import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';

import { getNome } from 'common/utils/resolveNome';
import { corRaridade, RaridadeBadge } from '../progressao/styles';
import { DialogFecharButton, DialogHeaderRow } from '../styles';

import { formatarDataAplicacao } from './constants';
import {
  DetalheCondicaoIcone,
  DetalheCondicaoNome,
  DetalheCondicaoTopo,
  InfoCelula,
  InfoGrid,
  InfoLabel,
  InfoValor,
  RodapeCondicaoData,
  SecaoCondicaoBox,
  SecaoCondicaoItem,
  SecaoCondicaoLista,
  SecaoCondicaoTitulo,
} from './styles';

const CondicaoViewDialog = ({ open, onClose, condicao, ativo }) => {
  if (!condicao) {
    return null;
  }

  const efeitos = condicao.efeitos ?? [];
  const interacoes = condicao.interacoes ?? [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogHeaderRow style={{ justifyContent: 'flex-end' }}>
        <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </DialogFecharButton>
      </DialogHeaderRow>

      <DialogContent>
        <DetalheCondicaoTopo>
          <DetalheCondicaoIcone>
            {condicao.linkImagem ? <img src={condicao.linkImagem} alt="" /> : '⚠️'}
          </DetalheCondicaoIcone>
          <DetalheCondicaoNome>{getNome(condicao)}</DetalheCondicaoNome>
          {condicao.raridade && (
            <RaridadeBadge $cor={corRaridade(condicao.raridade)}>{condicao.raridade}</RaridadeBadge>
          )}
        </DetalheCondicaoTopo>

        {condicao.descricao && (
          <>
            <SecaoCondicaoTitulo>📖 Descrição</SecaoCondicaoTitulo>
            <SecaoCondicaoBox>{condicao.descricao}</SecaoCondicaoBox>
          </>
        )}

        <InfoGrid>
          <InfoCelula>
            <InfoLabel>Duração</InfoLabel>
            <InfoValor>{condicao.duracao || '—'}</InfoValor>
          </InfoCelula>
          <InfoCelula>
            <InfoLabel>Raridade</InfoLabel>
            <InfoValor>{condicao.raridade || '—'}</InfoValor>
          </InfoCelula>
          <InfoCelula>
            <InfoLabel>Aplicação</InfoLabel>
            <InfoValor>{condicao.aplicacao || '—'}</InfoValor>
          </InfoCelula>
        </InfoGrid>

        {efeitos.length > 0 && (
          <>
            <SecaoCondicaoTitulo>⚡ Efeitos</SecaoCondicaoTitulo>
            <SecaoCondicaoLista>
              {efeitos.map((efeito, index) => (
                <SecaoCondicaoItem key={index}>{efeito}</SecaoCondicaoItem>
              ))}
            </SecaoCondicaoLista>
          </>
        )}

        {interacoes.length > 0 && (
          <>
            <SecaoCondicaoTitulo>🔗 Interações</SecaoCondicaoTitulo>
            <SecaoCondicaoLista>
              {interacoes.map((interacao, index) => (
                <SecaoCondicaoItem key={index}>{interacao}</SecaoCondicaoItem>
              ))}
            </SecaoCondicaoLista>
          </>
        )}

        {ativo?.aplicadoEm && (
          <RodapeCondicaoData>Adicionada em {formatarDataAplicacao(ativo.aplicadoEm)}</RodapeCondicaoData>
        )}
      </DialogContent>
    </Dialog>
  );
};

CondicaoViewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  condicao: PropTypes.object,
  ativo: PropTypes.object,
};

CondicaoViewDialog.defaultProps = {
  condicao: null,
  ativo: null,
};

export default CondicaoViewDialog;
