import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

import { getNome } from 'common/utils/resolveNome';

import { ART_STAT_CAMPOS, DOMINIO_LABELS, TIPO_ACAO_META, TIPO_ART_META } from './constants';
import {
  ArtCardBody,
  ArtCardFooter,
  ArtCardHeader,
  ArtCardHeaderInfo,
  ArtCardWrapper,
  ArtDescricao,
  ArtImageThumb,
  ArtMetaText,
  ArtNome,
  ArtTabs,
  Badge,
  BadgeRow,
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

  const [tab, setTab] = useState('descricao');

  return (
    <ArtCardWrapper data-bloqueada={!art.ativa}>
      <ArtCardHeader>
        <ArtImageThumb>{art.imagem ? <img src={art.imagem} alt={art.nome} /> : '🎴'}</ArtImageThumb>
        <ArtCardHeaderInfo>
          <div>
            <ArtNome>{art.nome}</ArtNome>
            <ArtMetaText>
              Núcleo: <strong>{nucleo?.nome ?? 'Desconhecido'}</strong>
            </ArtMetaText>
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

      {/* Descrição / Cântico tabs (apresentação somente) */}
      {(art.descricao !== undefined || art.cantico !== undefined) && (
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
          </ArtTabs>

          {tab === 'descricao' ? (
            <ArtDescricao>{art.descricao || ''}</ArtDescricao>
          ) : (
            <ArtDescricao>
              <strong>🎵 Cântico:</strong> {art.cantico || ''}
            </ArtDescricao>
          )}
        </ArtCardBody>
      )}

      <ArtCardFooter>
        <Button
          size="small"
          variant="outlined"
          onClick={onVer}
          sx={{
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 700,
            px: 1.2,
            py: 0.5,
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 18px rgba(33,61,150,0.14)',
            },
          }}
        >
          🔍 Ver
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={onEditar}
          sx={{
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 700,
            px: 1.2,
            py: 0.5,
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 18px rgba(91,124,250,0.16)',
            },
          }}
        >
          ✏️ Editar
        </Button>
        <Button
          size="small"
          variant={art.ativa ? 'contained' : 'outlined'}
          onClick={onToggleAtiva}
          sx={{
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 700,
            px: 1.2,
            py: 0.5,
            background: art.ativa ? 'linear-gradient(90deg, rgba(108,99,255,0.95), rgba(91,124,250,0.95))' : undefined,
            boxShadow: art.ativa ? '0 10px 20px rgba(33,61,150,0.18)' : undefined,
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: art.ativa ? '0 12px 24px rgba(33,61,150,0.22)' : '0 8px 18px rgba(91,124,250,0.16)',
            },
          }}
        >
          {art.ativa ? 'Ativa' : '🔒 Bloqueada'}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={onRemover}
          sx={{
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 700,
            px: 1.2,
            py: 0.5,
            borderColor: 'rgba(248,113,113,0.4)',
            color: '#fda4af',
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 18px rgba(239,68,68,0.16)',
            },
          }}
        >
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
