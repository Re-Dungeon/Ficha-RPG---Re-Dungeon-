import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';

import { calcularCadeiaBloqueio, calcularCustoDesbloqueio } from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';

import DesbloquearNoDialog from './DesbloquearNoDialog';
import NoNode from './NoNode';
import { calcularLayoutArvore } from './arvoreLayout';
import { ARVORE_FUNDO_OPACIDADE, ARVORE_FUNDO_SATURACAO, corDivindade } from './constants';
import { ArvoreCanvas, ArvoreFundoImagem, ArvoreScrollArea } from './styles';
import { PowerCombatBadge, StatusValueRow } from '../styles';

const ConstelacaoArvoreModal = ({
  open,
  veias,
  divindade,
  idsDesbloqueados,
  pcDisponivel,
  onClose,
  onDesbloquear,
  onBloquear,
}) => {
  const [noSelecionadoId, setNoSelecionadoId] = useState(null);

  const nos = veias;
  const layout = useMemo(() => calcularLayoutArvore(nos), [nos]);
  const cor = corDivindade(divindade);

  const noSelecionado = nos.find(no => no.id === noSelecionadoId) ?? null;
  const jaDesbloqueado = noSelecionado ? idsDesbloqueados.includes(noSelecionado.id) : false;
  const desbloqueioInfo =
    noSelecionado && !jaDesbloqueado ? calcularCustoDesbloqueio(nos, noSelecionado.id, idsDesbloqueados) : null;
  const bloqueioInfo =
    noSelecionado && jaDesbloqueado ? calcularCadeiaBloqueio(nos, noSelecionado.id, idsDesbloqueados) : null;
  const nomeDivindade = (getNome(divindade) || 'Veias Astrais').toUpperCase();

  const handleDesbloquear = async () => {
    if (!desbloqueioInfo || desbloqueioInfo.cadeia.length === 0) {
      return;
    }
    await onDesbloquear(desbloqueioInfo.cadeia, desbloqueioInfo.custoTotal);
    setNoSelecionadoId(null);
  };

  const handleBloquear = async () => {
    if (!bloqueioInfo || bloqueioInfo.cadeia.length === 0) {
      return;
    }
    await onBloquear(
      bloqueioInfo.cadeia.map(no => no.id),
      bloqueioInfo.custoRecuperado,
    );
    setNoSelecionadoId(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xl"
        scroll="paper"
        slotProps={{
          paper: {
            sx: {
              width: 'min(95vw, 1500px)',
              maxWidth: '95vw',
              maxHeight: '92vh',
              m: 2,
              overflow: 'hidden',
              borderRadius: '22px',
              background: 'linear-gradient(180deg, rgba(33, 27, 52, 0.94), rgba(18, 14, 28, 0.94))',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              boxShadow: '0 24px 60px rgba(8, 6, 17, 0.38)',
            },
          },
        }}
      >
        <div
          style={{
            position: 'relative',
            padding: '22px 24px 18px',
            background: `linear-gradient(180deg, rgba(17, 13, 24, 0.98) 0%, rgba(13, 10, 20, 0.92) 100%)`,
            borderBottom: `1px solid ${cor}55`,
            boxShadow: `inset 0 -1px 0 ${cor}22, 0 18px 32px rgba(0, 0, 0, 0.18)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at 50% 20%, ${cor}28 0%, transparent 52%)`,
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 94,
            }}
          >
            <div
              style={{
                width: '100%',
                textAlign: 'center',
                minWidth: 0,
                paddingRight: 190,
                paddingLeft: 190,
              }}
            >
              <div
                style={{
                  margin: 0,
                  fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif",
                  fontSize: 'clamp(1.3rem, 2.1vw, 2.7rem)',
                  lineHeight: 1.08,
                  letterSpacing: '0.12em',
                  color: cor,
                  textTransform: 'uppercase',
                  textShadow: `0 0 18px ${cor}66, 0 0 42px ${cor}33`,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {nomeDivindade}
              </div>

            </div>

            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <PowerCombatBadge
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  background: `linear-gradient(180deg, rgba(15, 20, 35, 0.9), rgba(17, 14, 24, 0.8))`,
                  border: `1px solid ${cor}88`,
                  boxShadow: `0 0 18px ${cor}33, inset 0 0 10px rgba(255,255,255,0.04)`,
                  fontSize: '0.76rem',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                <span aria-hidden="true">✦</span>
                {pcDisponivel} PC
              </PowerCombatBadge>

              <button
                type="button"
                aria-label="Fechar"
                onClick={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: `1px solid ${cor}88`,
                  background: `rgba(15, 18, 30, 0.68)`,
                  color: cor,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: `0 0 12px ${cor}22`,
                  flexShrink: 0,
                }}
                onMouseEnter={event => {
                  event.currentTarget.style.background = `rgba(255,255,255,0.06)`;
                  event.currentTarget.style.boxShadow = `0 0 18px ${cor}55`;
                  event.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={event => {
                  event.currentTarget.style.background = 'rgba(15, 18, 30, 0.68)';
                  event.currentTarget.style.boxShadow = `0 0 12px ${cor}22`;
                  event.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>

        <DialogContent sx={{ p: '18px 20px 20px', background: 'rgba(8, 7, 14, 0.4)' }}>
          {divindade?.descricao && (
            <div
              style={{
                margin: '0 0 18px',
                padding: '14px 18px',
                borderRadius: 12,
                border: `1px solid ${cor}33`,
                background: `linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))`,
                boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.02), 0 10px 24px rgba(0,0,0,0.12)`,
              }}
            >
              <StatusValueRow
                style={{
                  display: 'block',
                  lineHeight: 1.75,
                  fontSize: '0.98rem',
                  letterSpacing: '0.02em',
                  color: 'rgba(255,255,255,0.86)',
                }}
              >
                {divindade.descricao}
              </StatusValueRow>
            </div>
          )}

          {nos.length === 0 ? (
            <StatusValueRow>Nenhuma veia cadastrada para esta divindade.</StatusValueRow>
          ) : (
            <ArvoreScrollArea
              style={{ background: `radial-gradient(circle at 50% 0%, ${cor}22, transparent 60%)` }}
            >
              <ArvoreFundoImagem
                $src={divindade?.linkImagem}
                $opacidade={ARVORE_FUNDO_OPACIDADE}
                $saturacao={ARVORE_FUNDO_SATURACAO}
              />
              <ArvoreCanvas style={{ width: layout.largura, height: layout.altura }}>
                <svg
                  width={layout.largura}
                  height={layout.altura}
                  style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
                >
                  {nos.flatMap(no =>
                    (no.parentIds ?? [])
                      .filter(parentId => layout.posicoes.has(parentId))
                      .map(parentId => {
                        const de = layout.posicoes.get(parentId);
                        const ate = layout.posicoes.get(no.id);
                        const desbloqueado = idsDesbloqueados.includes(no.id);
                        return (
                          <line
                            key={`${parentId}-${no.id}`}
                            x1={de.x}
                            y1={de.y}
                            x2={ate.x}
                            y2={ate.y}
                            strokeWidth={2}
                            style={{ stroke: desbloqueado ? cor : 'rgba(255, 255, 255, 0.15)' }}
                          />
                        );
                      }),
                  )}
                </svg>

                {nos.map(no => {
                  const pos = layout.posicoes.get(no.id);
                  const desbloqueado = idsDesbloqueados.includes(no.id);
                  const disponivel =
                    !desbloqueado && (no.parentIds ?? []).every(parentId => idsDesbloqueados.includes(parentId));
                  return (
                    <NoNode
                      key={no.id}
                      no={no}
                      x={pos.x}
                      y={pos.y}
                      desbloqueado={desbloqueado}
                      disponivel={disponivel}
                      cor={cor}
                      onClick={() => setNoSelecionadoId(no.id)}
                    />
                  );
                })}
              </ArvoreCanvas>
            </ArvoreScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <DesbloquearNoDialog
        open={Boolean(noSelecionado)}
        no={noSelecionado}
        cor={cor}
        jaDesbloqueado={jaDesbloqueado}
        cadeia={desbloqueioInfo?.cadeia ?? []}
        custoTotal={desbloqueioInfo?.custoTotal ?? 0}
        cadeiaBloqueio={bloqueioInfo?.cadeia ?? []}
        custoRecuperado={bloqueioInfo?.custoRecuperado ?? 0}
        pcDisponivel={pcDisponivel}
        onClose={() => setNoSelecionadoId(null)}
        onDesbloquear={handleDesbloquear}
        onBloquear={handleBloquear}
      />
    </>
  );
};

ConstelacaoArvoreModal.propTypes = {
  open: PropTypes.bool.isRequired,
  veias: PropTypes.array,
  divindade: PropTypes.object,
  idsDesbloqueados: PropTypes.array.isRequired,
  pcDisponivel: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onDesbloquear: PropTypes.func.isRequired,
  onBloquear: PropTypes.func.isRequired,
};

ConstelacaoArvoreModal.defaultProps = {
  veias: [],
  divindade: null,
};

export default ConstelacaoArvoreModal;
