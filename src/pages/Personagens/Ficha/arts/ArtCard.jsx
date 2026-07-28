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

const ArtCard = ({ art, nucleo, condicoes, onVer, onEditar, onRemover, onToggleAtiva }) => {
  const tipoMeta = TIPO_ART_META[art.tipo] ?? {};
  const acaoMeta = TIPO_ACAO_META[art.tipoAcao] ?? {};

  const condicoesAplicadas = useMemo(() => {
    const ids = art.condicoesAplicadas ?? [];
    return ids.map(id => condicoes.find(condicao => condicao.id === id)).filter(Boolean);
  }, [art.condicoesAplicadas, condicoes]);

  return (
    <ArtCardWrapper data-bloqueada={!art.ativa}>
      <ArtCardHeader>
        <ImageThumb $size={120}>{art.imagem ? <img src={art.imagem} alt={art.nome} /> : '🎴'}</ImageThumb>
        <ArtCardHeaderInfo>
          <div>
            <ArtNome>{art.nome}</ArtNome>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Núcleo: <strong>{nucleo?.nome ?? 'Desconhecido'}</strong>
            </div>
          </div>
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
                🔮 Domínio: {String(art.dominio).padStart(2, '0')} — {DOMINIO_LABELS[art.dominio]}
              </Badge>
            )}
            {art.circuloMagico && <Badge $cor="#5b7cfa">🔵 Círculo: {art.circuloMagico}</Badge>}
            {!art.ativa && <Badge $cor="#ef4444">🔒 Bloqueada</Badge>}
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
      {art.cantico && (
        <ArtDescricao style={{ fontStyle: 'italic', paddingTop: 0 }}>
          <strong>🎵 Cântico:</strong> {art.cantico}
        </ArtDescricao>
      )}

      <ArtCardFooter>
        <Button size="small" variant="outlined" onClick={onVer}>
          🔍 Ver
        </Button>
        <Button size="small" variant="outlined" onClick={onEditar}>
          ✏️ Editar
        </Button>
        <Button size="small" variant={art.ativa ? 'contained' : 'outlined'} onClick={onToggleAtiva}>
          {art.ativa ? 'Ativa' : '🔒 Bloqueada'}
        </Button>
        <Button size="small" variant="outlined" color="error" onClick={onRemover}>
          🗑️ Remover
        </Button>
      </ArtCardFooter>
    </ArtCardWrapper>
  );
};

ArtCard.propTypes = {
  art: PropTypes.object.isRequired,
  nucleo: PropTypes.object,
  condicoes: PropTypes.array,
  onVer: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
  onToggleAtiva: PropTypes.func.isRequired,
};

ArtCard.defaultProps = {
  nucleo: null,
  condicoes: [],
};

export default ArtCard;
