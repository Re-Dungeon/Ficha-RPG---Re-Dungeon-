import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import { getNome } from 'common/utils/resolveNome';

import { DOMINIO_LABELS, TIPO_ACAO_META, TIPO_ART_META } from './constants';
import CondicaoViewDialog from '../condicoes/CondicaoViewDialog';
import {
  ArtCardBody,
  ArtCardFooter,
  ArtCardHeader,
  ArtCardHeaderInfo,
  ArtCardWrapper,
  ArtDescricao,
  ArtNome,
  ArtTabs,
  Badge,
  BadgeRow,
  ImageThumb,
  StatGrid,
  StatGridCell,
  StatGridLabel,
  StatGridValue,
  ConditionList,
  ConditionItem,
  ConditionIcon,
  ConditionName,
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

  const [tab, setTab] = useState('descricao');
  const [condicaoVisualizadaId, setCondicaoVisualizadaId] = useState(null);

  const condicaoVisualizada = condicoesAplicadas.find(
    condicao => condicao.id === condicaoVisualizadaId,
  );

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

      {(variante.descricao !== undefined || variante.cantico !== undefined || condicoesAplicadas.length > 0) && (
        <ArtCardBody>
          <ArtTabs>
            <Button
              size="small"
              variant={tab === 'descricao' ? 'contained' : 'outlined'}
              onClick={() => setTab('descricao')}
              sx={{
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 700,
                px: 1,
                py: 0.3,
              }}
            >
              Descrição
            </Button>
            <Button
              size="small"
              variant={tab === 'cantigo' ? 'contained' : 'outlined'}
              onClick={() => setTab('cantigo')}
              sx={{
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 700,
                px: 1,
                py: 0.3,
              }}
            >
              Cântico
            </Button>
            {condicoesAplicadas.length > 0 && (
              <Button
                size="small"
                variant={tab === 'condicoes' ? 'contained' : 'outlined'}
                onClick={() => setTab('condicoes')}
                sx={{
                  borderRadius: 999,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 1,
                  py: 0.3,
                }}
              >
                Condições
              </Button>
            )}
          </ArtTabs>

          {tab === 'descricao' ? (
            <ArtDescricao>{variante.descricao || ''}</ArtDescricao>
          ) : tab === 'cantigo' ? (
            <ArtDescricao>
              <strong>🎵 Cântico:</strong> {variante.cantico || ''}
            </ArtDescricao>
          ) : (
            <ConditionList>
              {condicoesAplicadas.map(condicao => (
                <ConditionItem
                  key={condicao.id}
                  type="button"
                  onClick={() => setCondicaoVisualizadaId(condicao.id)}
                >
                  <ConditionIcon>
                    {condicao.linkImagem ? <img src={condicao.linkImagem} alt={getNome(condicao)} /> : '⚠️'}
                  </ConditionIcon>
                  <ConditionName>{getNome(condicao)}</ConditionName>
                </ConditionItem>
              ))}
            </ConditionList>
          )}
        </ArtCardBody>
      )}

      <CondicaoViewDialog
        open={Boolean(condicaoVisualizada)}
        onClose={() => setCondicaoVisualizadaId(null)}
        condicao={condicaoVisualizada}
      />

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
