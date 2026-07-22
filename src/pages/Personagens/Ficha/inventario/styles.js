import styled from 'styled-components';

export const InventarioHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const EspacoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin: 20px 0 12px;
`;

export const EspacoCard = styled.div`
  background: rgba(0, 0, 0, 0.25);
  border-left: 3px solid var(--status-gold);
  border-radius: 8px;
  padding: 14px 16px;
  text-align: center;
`;

export const EspacoLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 6px;
`;

export const EspacoValor = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--status-gold-strong);
  text-shadow: 0 0 12px rgba(232, 203, 133, 0.3);

  &[data-status='ok'] {
    color: #7eff7e;
    text-shadow: 0 0 10px rgba(126, 255, 126, 0.3);
  }

  &[data-status='sobrecarga'] {
    color: #ff6b6b;
    text-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
  }
`;

export const EspacoBarraTrack = styled.div`
  width: 100%;
  height: 10px;
  border-radius: 999px;
  border: 1px solid var(--status-gold-border);
  background: var(--status-track-bg);
  overflow: hidden;
`;

export const EspacoBarraFill = styled.div`
  height: 100%;
  width: ${({ $percentual }) => $percentual}%;
  border-radius: 999px;
  transition: width 0.3s ease;
  background: ${({ $sobrecarga }) =>
    $sobrecarga
      ? 'linear-gradient(90deg, #ff6b6b 0%, #ff4444 100%)'
      : 'linear-gradient(90deg, var(--status-gold) 0%, var(--color-accent) 100%)'};
`;

export const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

// ── Card de item ─────────────────────────────────────────────────────────

export const ItemCardWrapper = styled.div`
  position: relative;
  background: var(--bg-card);
  border: 2px solid ${({ $cor }) => $cor ?? 'var(--border-primary)'};
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;

  &[data-equipado='true'] {
    box-shadow: 0 0 16px rgba(232, 203, 133, 0.35);
  }

  &:hover {
    transform: translateY(-2px);
  }
`;

export const EquipadoBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  background: linear-gradient(135deg, var(--status-gold) 0%, var(--color-primary) 100%);
  color: #1c1830;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ItemImagem = styled.div`
  width: 100%;
  height: 120px;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 2.2rem;
  opacity: 0.9;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ItemConteudo = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`;

export const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

export const ItemNome = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--status-gold-strong);
  line-height: 1.3;
`;

export const QualidadeBadge = styled.span`
  flex-shrink: 0;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
  background: ${({ $cor }) => $cor ?? 'var(--text-muted)'};
  color: #101018;
`;

export const ItemBlocos = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

export const ItemBloco = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  padding: 6px;
  text-align: center;
  min-width: 0;
`;

export const ItemBlocoLabel = styled.div`
  font-size: 0.62rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
`;

export const ItemBlocoValor = styled.div`
  font-size: 0.82rem;
  color: var(--status-gold-strong);
  font-weight: 700;
  overflow-wrap: break-word;
`;

export const ItemRodape = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid var(--border-primary);
  padding-top: 8px;
  margin-top: auto;
`;

export const ItemQuantidade = styled.div`
  font-size: 0.78rem;
  color: var(--text-secondary);
  text-align: center;

  strong {
    color: var(--status-gold-strong);
  }
`;

export const ItemEspacoInfo = styled.div`
  display: flex;
  justify-content: space-around;
  font-size: 0.7rem;
  color: var(--text-secondary);

  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
`;

export const ItemEspacoValor = styled.span`
  color: var(--status-gold-strong);
  font-weight: 700;
`;

export const ItemBotoesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

const VARIANTE_CORES = {
  editar: { border: 'var(--status-gold-border)', color: 'var(--status-gold-strong)' },
  ver: { border: 'var(--border-primary)', color: 'var(--text-secondary)' },
  equipar: { border: '#5ade5e', color: '#7eff7e' },
  deletar: { border: '#ff6b6b', color: '#ff9999' },
};

// ── Diálogo de visualização ────────────────────────────────────────────────

export const ModalImagemGrande = styled.div`
  width: 100%;
  height: 210px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--status-gold-border);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 3rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ModalNomeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
`;

export const ModalStatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const ModalEspacoBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--status-gold-border);
  border-radius: 8px;
  margin-top: 12px;
  overflow: hidden;
`;

export const ModalEspacoColuna = styled.div`
  padding: 10px;
  text-align: center;

  & + & {
    border-left: 1px solid var(--status-gold-border);
  }
`;

export const ModalSecaoTitulo = styled.h5`
  margin: 20px 0 8px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--status-gold-strong);
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const ModalSecaoBox = styled.div`
  border: 1px solid var(--status-gold-border);
  border-radius: 8px;
  padding: 12px 14px;
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.5;
`;

export const ModalHabilidadeNome = styled.div`
  color: var(--status-gold-strong);
  font-weight: 700;
  font-size: 0.85rem;

  & + p {
    margin-top: 2px;
  }
`;

export const ItemBtn = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  text-align: center;
  padding: 6px 4px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid ${({ $variante }) => VARIANTE_CORES[$variante]?.border ?? 'var(--border-primary)'};
  color: ${({ $variante }) => VARIANTE_CORES[$variante]?.color ?? 'var(--text-primary)'};
  background: rgba(255, 255, 255, 0.03);
  transition: filter 0.15s ease;

  &:hover {
    filter: brightness(1.3);
  }
`;
