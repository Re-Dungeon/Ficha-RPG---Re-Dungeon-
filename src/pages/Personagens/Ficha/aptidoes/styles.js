import styled from 'styled-components';

// Cores semânticas das 3 ações principais — só dessa feature, por isso não
// entram no tema global (dourado/azul é o tema do site inteiro, isso aqui não é).
export const COR_GANHAR = '#4ade80';
export const COR_GERENCIAR = '#f97316';
export const COR_REMOVER = '#f87171';

export const StatBar = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

export const StatCard = styled.div`
  flex: 1;
  min-width: 140px;
  background: var(--field-bg);
  border: 1px solid var(--field-border);
  border-left: 3px solid var(--color-accent);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const StatLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const StatValor = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--status-gold-strong);
`;

export const AcoesRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const ColunasRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 24px;
  align-items: start;
`;

export const ColunaCard = styled.div`
  background: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: 12px;
  padding: 20px;
`;

export const ColunaTitulo = styled.h3`
  margin: 0 0 16px;
  padding-bottom: 12px;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--status-gold-strong);
  border-bottom: 1px solid var(--status-gold-border);
`;

export const TabelaHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 16px;
  align-items: center;
  padding: 0 12px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const TabelaBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TabelaRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 16px;
  align-items: center;
  background: var(--bg-card);
  border-left: 2px solid var(--color-accent);
  border-radius: 8px;
  padding: 10px 12px;
`;

export const TabelaAptidaoNome = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`;

export const TabelaNivel = styled.span`
  font-weight: 700;
  color: var(--status-gold-strong);
`;

export const TabelaBonus = styled.span`
  font-weight: 700;
  color: var(--status-gold);
`;

export const TabelaAcoes = styled.div`
  display: flex;
  gap: 6px;
`;

export const AcaoIconButton = styled.button`
  all: unset;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid ${({ $variante }) => ($variante === 'vermelho' ? '#f87171' : 'var(--color-accent)')};
  background: ${({ $variante }) =>
    $variante === 'vermelho' ? 'rgba(248, 113, 113, 0.12)' : 'rgba(91, 124, 250, 0.12)'};
  color: ${({ $variante }) => ($variante === 'vermelho' ? '#f87171' : 'var(--color-accent)')};

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    filter: brightness(1.2);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const VantagensGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
`;

export const VantagemCard = styled.div`
  background: var(--bg-card);
  border-left: 2px solid var(--color-accent);
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const VantagemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

export const VantagemTitulo = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: var(--color-accent);
  font-size: 0.9rem;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

export const VantagemTipo = styled.span`
  flex-shrink: 0;
  font-size: 0.7rem;
  color: var(--text-muted);
  white-space: nowrap;
`;

export const VantagemTexto = styled.p`
  margin: 0;
  font-size: 0.85rem;
  font-style: italic;
  color: var(--text-secondary);
`;

export const NumeroGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

export const NumeroBotao = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  text-align: center;
  padding: 18px 0;
  border-radius: 10px;
  border: 1px solid var(--status-gold-border);
  background: rgba(232, 203, 133, 0.06);
  color: var(--status-gold);
  font-size: 1.2rem;
  font-weight: 700;

  &:hover {
    background: rgba(232, 203, 133, 0.16);
    border-color: var(--status-gold);
  }
`;

export const CatalogoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 12px;
  max-height: 360px;
  overflow-y: auto;
  padding: 4px;
`;

export const CatalogoCard = styled.button`
  all: unset;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  border-radius: 10px;
  border: 1px solid ${({ $selecionado }) => ($selecionado ? 'var(--color-accent)' : 'var(--border-primary)')};
  background: ${({ $selecionado }) => ($selecionado ? 'rgba(91, 124, 250, 0.12)' : 'var(--bg-card)')};
  opacity: ${({ $desabilitado }) => ($desabilitado ? 0.5 : 1)};

  &:not(:disabled):hover {
    border-color: var(--color-accent);
  }
`;

export const CatalogoIcone = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-primary);
`;

export const CatalogoNome = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  color: var(--text-secondary);
`;

export const EnciclopediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
`;

export const EnciclopediaCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
`;

export const EnciclopediaIcone = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
`;

export const EnciclopediaNome = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  color: var(--status-gold-strong);
`;

export const DetalheHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const DetalheIcone = styled.img`
  width: 88px;
  height: 88px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid var(--field-border);
`;

export const DetalheNome = styled.h2`
  margin: 0 0 4px;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1.3rem;
  color: var(--status-gold-strong);
`;

export const DetalheDescricao = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

export const DetalheDivisor = styled.hr`
  margin: 20px 0;
  border: none;
  border-top: 1px solid var(--status-gold-border);
`;

export const ProgressaoTitulo = styled.h3`
  margin: 0 0 12px;
  padding-bottom: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-accent);
  border-bottom: 1px solid var(--border-primary);
`;

export const NiveisLista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const NivelCard = styled.div`
  background: var(--bg-card);
  border-radius: 8px;
  padding: 12px 16px;
`;

export const NivelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-accent);

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-accent);
  }
`;

export const NivelTexto = styled.p`
  margin: 8px 0 0;
  font-size: 0.9rem;
  color: var(--status-gold);
`;

export const NivelCurta = styled.p`
  margin: 8px 0 0;
  padding-top: 8px;
  border-top: 1px solid var(--border-primary);
  font-size: 0.85rem;
  font-style: italic;
  color: var(--text-muted);
`;

export const CatalogoCheckBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0913;

  svg {
    width: 13px;
    height: 13px;
  }
`;
