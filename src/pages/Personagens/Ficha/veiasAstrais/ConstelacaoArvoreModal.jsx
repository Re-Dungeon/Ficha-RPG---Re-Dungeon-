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
import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle, PowerCombatBadge, StatusValueRow } from '../styles';

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
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogHeaderRow style={{ borderBottomColor: `${cor}55` }}>
          <DialogHeaderTitle style={{ flex: 1, color: cor, textShadow: `0 0 12px ${cor}66` }}>
            {getNome(divindade) || 'Veias Astrais'}
          </DialogHeaderTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PowerCombatBadge>PC disponível: {pcDisponivel}</PowerCombatBadge>
            <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </DialogFecharButton>
          </div>
        </DialogHeaderRow>

        <DialogContent>
          {divindade?.descricao && (
            <StatusValueRow style={{ display: 'block', margin: '8px 0 16px' }}>{divindade.descricao}</StatusValueRow>
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
                  {nos
                    .filter(no => no.parentId && layout.posicoes.has(no.parentId))
                    .map(no => {
                      const de = layout.posicoes.get(no.parentId);
                      const ate = layout.posicoes.get(no.id);
                      const desbloqueado = idsDesbloqueados.includes(no.id);
                      return (
                        <line
                          key={no.id}
                          x1={de.x}
                          y1={de.y}
                          x2={ate.x}
                          y2={ate.y}
                          strokeWidth={2}
                          style={{ stroke: desbloqueado ? cor : 'rgba(255, 255, 255, 0.15)' }}
                        />
                      );
                    })}
                </svg>

                {nos.map(no => {
                  const pos = layout.posicoes.get(no.id);
                  const desbloqueado = idsDesbloqueados.includes(no.id);
                  const disponivel = !desbloqueado && (!no.parentId || idsDesbloqueados.includes(no.parentId));
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
