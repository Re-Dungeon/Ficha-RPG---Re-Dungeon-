import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import { getNome } from 'common/utils/resolveNome';

import { DOMINIO_LABELS, TIPO_ACAO_META, TIPO_ART_META } from './constants';
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

const CAMPOS_GRID = [
  ['Recarga', 'recarga'],
  ['Ação', 'tipoAcao'],
  ['Duração', 'duracao'],
  ['Alcance', 'alcance'],
  ['Alvos', 'alvos'],
  ['Custo', 'custo'],
  ['Dados', 'dados'],
];

const VarianteCard = ({ variante, art, nucleo, condicoes, onVer, onEditar, onRemover }) => {
  const tipoMeta = TIPO_ART_META[variante.tipo] ?? {};
  const acaoMeta = TIPO_ACAO_META[variante.tipoAcao] ?? {};

  const condicoesAplicadas = useMemo(() => {
    const ids = variante.condicoesAplicadas ?? [];
    return ids.map(id => condicoes.find(condicao => condicao.id === id)).filter(Boolean);
  }, [variante.condicoesAplicadas, condicoes]);

  return (
    <ArtCardWrapper>
      <ArtCardHeader>
        <ImageThumb $size={120}>
          {variante.imagem ? <img src={variante.imagem} alt={variante.nome} /> : '🎴'}
        </ImageThumb>
        <ArtCardHeaderInfo>
          <div>
            <ArtNome>{variante.nome}</ArtNome>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Art: <strong>{art?.nome ?? 'Desconhecida'}</strong> · Núcleo:{' '}
              <strong>{nucleo?.nome ?? 'Desconhecido'}</strong>
            </div>
          </div>
          <BadgeRow>
            {variante.tipo && (
              <Badge $cor={tipoMeta.cor}>
                {tipoMeta.icone} {variante.tipo}
              </Badge>
            )}
            {variante.tipoAcao && (
              <Badge>
                {acaoMeta.icone} {variante.tipoAcao}
              </Badge>
            )}
            {variante.dominio && (
              <Badge $cor="#A78BFA">
                🔮 Domínio: {String(variante.dominio).padStart(2, '0')} — {DOMINIO_LABELS[variante.dominio]}
              </Badge>
            )}
            {variante.circuloMagico && <Badge $cor="#5b7cfa">🔵 Círculo: {variante.circuloMagico}</Badge>}
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
        {CAMPOS_GRID.map(([label, campo]) => (
          <StatGridCell key={campo}>
            <StatGridLabel>{label}</StatGridLabel>
            <StatGridValue>{variante[campo] || '-'}</StatGridValue>
          </StatGridCell>
        ))}
      </StatGrid>

      {variante.descricao && <ArtDescricao>{variante.descricao}</ArtDescricao>}
      {variante.cantico && (
        <ArtDescricao style={{ fontStyle: 'italic', paddingTop: 0 }}>
          <strong>🎵 Cântico:</strong> {variante.cantico}
        </ArtDescricao>
      )}

      <ArtCardFooter>
        <Button size="small" variant="outlined" onClick={onVer}>
          🔍 Ver
        </Button>
        <Button size="small" variant="outlined" onClick={onEditar}>
          ✏️ Editar
        </Button>
        <Button size="small" variant="outlined" color="error" onClick={onRemover}>
          🗑️ Remover
        </Button>
      </ArtCardFooter>
    </ArtCardWrapper>
  );
};

VarianteCard.propTypes = {
  variante: PropTypes.object.isRequired,
  art: PropTypes.object,
  nucleo: PropTypes.object,
  condicoes: PropTypes.array,
  onVer: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onRemover: PropTypes.func.isRequired,
};

VarianteCard.defaultProps = {
  art: null,
  nucleo: null,
  condicoes: [],
};

export default VarianteCard;
