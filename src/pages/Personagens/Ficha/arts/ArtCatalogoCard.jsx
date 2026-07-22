import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import { getNome } from 'common/utils/resolveNome';

import { ART_STAT_CAMPOS, DOMINIO_LABELS, TIPO_ACAO_META, TIPO_ART_META } from './constants';
import {
  ArtCardFooter,
  ArtCardHeader,
  ArtCardHeaderInfo,
  ArtCardWrapper,
  ArtDescricao,
  ArtNome,
  Badge,
  BadgeRow,
  ImageThumb,
  StatGrid,
  StatGridCell,
  StatGridLabel,
  StatGridValue,
} from './styles';

// Card compacto de Art usado nas abas "Catálogo" e "Habilidade de Classe" do
// CriarArtDialog — mesma linguagem visual do ArtCard da ficha, mas com um único
// botão de rodapé ("Escolher") em vez das ações de editar/remover/ativar.
const ArtCatalogoCard = ({ art, condicoes, disabled, onEscolher }) => {
  const tipoMeta = TIPO_ART_META[art.tipo] ?? {};
  const acaoMeta = TIPO_ACAO_META[art.tipoAcao] ?? {};

  const condicoesAplicadas = useMemo(() => {
    const ids = art.condicoesAplicadas ?? [];
    return ids.map(id => condicoes.find(condicao => condicao.id === id)).filter(Boolean);
  }, [art.condicoesAplicadas, condicoes]);

  return (
    <ArtCardWrapper>
      <ArtCardHeader>
        <ImageThumb $size={72}>{art.imagem ? <img src={art.imagem} alt={art.nome} /> : '🎴'}</ImageThumb>
        <ArtCardHeaderInfo>
          <ArtNome>{art.nome}</ArtNome>
          <BadgeRow>
            {art.tipo && (
              <Badge $cor={tipoMeta.cor}>
                {tipoMeta.icone} {art.tipo}
              </Badge>
            )}
            {art.tipoAcao && (
              <Badge>
                {acaoMeta.icone} {art.tipoAcao}
              </Badge>
            )}
            {art.dominio && (
              <Badge $cor="#A78BFA">
                🔮 {DOMINIO_LABELS[art.dominio]}
              </Badge>
            )}
            {art.circuloMagico && <Badge $cor="#5b7cfa">🔵 {art.circuloMagico}</Badge>}
          </BadgeRow>
          {condicoesAplicadas.length > 0 && (
            <BadgeRow>
              {condicoesAplicadas.map(condicao => (
                <Badge key={condicao.id} $cor="#ef4444">
                  ⚠️ {getNome(condicao)}
                </Badge>
              ))}
            </BadgeRow>
          )}
        </ArtCardHeaderInfo>
      </ArtCardHeader>

      <StatGrid>
        {ART_STAT_CAMPOS.map(([label, campo]) => (
          <StatGridCell key={campo}>
            <StatGridLabel>{label}</StatGridLabel>
            <StatGridValue>{art[campo] || '-'}</StatGridValue>
          </StatGridCell>
        ))}
      </StatGrid>

      {art.descricao && <ArtDescricao>{art.descricao}</ArtDescricao>}

      <ArtCardFooter>
        <Button size="small" variant="contained" fullWidth disabled={disabled} onClick={onEscolher}>
          Escolher
        </Button>
      </ArtCardFooter>
    </ArtCardWrapper>
  );
};

ArtCatalogoCard.propTypes = {
  art: PropTypes.object.isRequired,
  condicoes: PropTypes.array,
  disabled: PropTypes.bool,
  onEscolher: PropTypes.func.isRequired,
};

ArtCatalogoCard.defaultProps = {
  condicoes: [],
  disabled: false,
};

export default ArtCatalogoCard;
