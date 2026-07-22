import styled from 'styled-components';

// ── Cards de Divindade (grade na aba) ───────────────────────────────────

export const DivindadeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

export const DivindadeCardButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  overflow: hidden;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    border-color: var(--border-hover);
    transform: translateY(-2px);
  }
`;

export const DivindadeImagem = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const DivindadeInfo = styled.div`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const DivindadeNomeTitulo = styled.h3`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1rem;
  color: var(--status-gold-strong);
`;

export const DivindadeDescricaoTexto = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const DivindadeProgressoBadge = styled.span`
  align-self: flex-start;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-accent);
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 999px;
  padding: 3px 10px;
`;

// ── Árvore de veias (modal) ──────────────────────────────────────────────

export const ArvoreScrollArea = styled.div`
  position: relative;
  overflow: auto;
  padding: 32px 16px;
  background: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.08), transparent 60%);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
`;

// Marca d'água com a imagem da divindade — fixa (não rola com a árvore, já
// que fica fora de `ArvoreCanvas`), opacidade/saturação vêm de
// `ARVORE_FUNDO_OPACIDADE`/`ARVORE_FUNDO_SATURACAO` em `constants.js`.
export const ArvoreFundoImagem = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: ${({ $src }) => ($src ? `url(${$src})` : 'none')};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  opacity: ${({ $opacidade }) => $opacidade};
  filter: saturate(${({ $saturacao }) => $saturacao});
  pointer-events: none;
`;

export const ArvoreCanvas = styled.div`
  position: relative;
  z-index: 1;
  margin: 0 auto;
`;

export const NoWrapper = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 118px;
  z-index: 1;
`;

export const NoCirculo = styled.button`
  all: unset;
  box-sizing: border-box;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 1.4rem;
  background: ${({ $desbloqueado, $cor }) => ($desbloqueado ? `${$cor}1f` : 'var(--bg-card)')};
  border: 2px solid
    ${({ $desbloqueado, $disponivel, $cor }) =>
      $desbloqueado ? $cor : $disponivel ? `${$cor}80` : 'var(--border-primary)'};
  box-shadow: ${({ $desbloqueado, $cor }) => ($desbloqueado ? `0 0 14px ${$cor}73` : 'none')};
  opacity: ${({ $desbloqueado, $disponivel }) => ($desbloqueado || $disponivel ? 1 : 0.5)};
  transition:
    transform 0.15s ease,
    filter 0.15s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  &:hover {
    transform: scale(1.08);
    filter: brightness(1.15);
  }
`;

export const NoNomeLabel = styled.span`
  font-size: 0.7rem;
  text-align: center;
  line-height: 1.2;
  color: ${({ $desbloqueado }) => ($desbloqueado ? 'var(--text-primary)' : 'var(--text-muted)')};
`;

export const NoCustoBadge = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--color-accent);
`;

// ── Dialog de informações/desbloqueio de uma veia ────────────────────────
// Cor do tema é a cor real da divindade (`divindade.cor`, ver constants.js);
// bloqueado/desbloqueado só muda o ícone/rótulo, não a cor do card.

export const VeiaDialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ $cor }) => $cor}55;
`;

export const VeiaDialogTitulo = styled.h3`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({ $cor }) => $cor};
  text-shadow: 0 0 12px ${({ $cor }) => $cor}66;
`;

export const VeiaDialogFechar = styled.button`
  all: unset;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid ${({ $cor }) => $cor};
  border-radius: 6px;
  color: ${({ $cor }) => $cor};

  &:hover {
    background: ${({ $cor }) => $cor}1a;
  }
`;

export const VeiaDialogBody = styled.div`
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const VeiaSecaoLabel = styled.span`
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 4px;
`;

export const VeiaSecaoTexto = styled.p`
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--text-primary);
`;

export const VeiaStatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  align-items: stretch;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  overflow: hidden;
`;

export const VeiaStatDivisor = styled.div`
  background: var(--border-primary);
`;

export const VeiaStatCell = styled.div`
  padding: 12px 16px;
  text-align: center;
`;

export const VeiaStatLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 4px;
`;

export const VeiaStatValor = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ $cor }) => $cor ?? 'var(--text-primary)'};
`;

export const VeiaEstadoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

export const VeiaEstadoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: ${({ $cor }) => $cor};
  border: 1px solid ${({ $cor }) => $cor};
  background: ${({ $cor }) => $cor}1f;

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const VeiaDesbloquearBotao = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  padding: 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1c1830;
  background: linear-gradient(90deg, var(--status-gold) 0%, var(--color-accent) 100%);
  transition: filter 0.15s ease;

  &:hover {
    filter: brightness(1.08);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    filter: none;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const VeiaBloquearBotao = styled(VeiaDesbloquearBotao)`
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid #ef4444;

  &:hover {
    background: rgba(239, 68, 68, 0.22);
    filter: none;
  }
`;

export const VeiaAvisoInsuficiente = styled.p`
  margin: 0;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: #ef4444;
`;

// ── Núcleo Central (resumo de aprimoramentos ativos, FUNCIONALIDADES.md §20) ──

export const NucleoDialogSubtitulo = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

export const NucleoDialogTitulo = styled.h4`
  margin: 0 0 4px;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
`;

export const NucleoDialogContagem = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-secondary);
`;

export const NucleoGrupo = styled.div`
  border-left: 3px solid ${({ $cor }) => $cor};
  padding-left: 16px;
  margin-bottom: 20px;
`;

export const NucleoGrupoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

export const NucleoGrupoNome = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${({ $cor }) => $cor};
`;

export const NucleoGrupoContagem = styled.span`
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
`;

export const NucleoVeiaCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--bg-card);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 8px;
`;

export const NucleoVeiaCheck = styled.span`
  flex-shrink: 0;
  margin-top: 2px;
  color: #4ade80;
  display: flex;

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const NucleoVeiaIcone = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $cor }) => $cor}22;
  color: ${({ $cor }) => $cor};
  overflow: hidden;

  svg {
    width: 14px;
    height: 14px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const NucleoVeiaTexto = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-secondary);
`;

export const NucleoVeiaNome = styled.span`
  font-weight: 700;
  color: ${({ $cor }) => $cor};
`;

export const NucleoVeiaNivel = styled.span`
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-left: 4px;
`;

export const NucleoDialogRodape = styled.div`
  text-align: center;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-primary);
  font-size: 0.85rem;
  color: var(--text-secondary);

  strong {
    color: var(--status-gold-strong);
  }
`;

export const NucleoVazio = styled.p`
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  padding: 24px 0;
`;
