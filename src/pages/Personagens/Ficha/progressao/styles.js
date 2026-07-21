import styled from 'styled-components';

const RARIDADE_CORES = {
  comum: '#5b7cfa',
  rara: '#4ade80',
  epica: '#a78bfa',
  lendaria: '#fb923c',
  mitica: '#f472b6',
  celestial: '#f4dda2',
};

const DIACRITICOS = new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g');

export const corRaridade = raridade =>
  RARIDADE_CORES[
    (raridade ?? '')
      .toString()
      .normalize('NFD')
      .replace(DIACRITICOS, '')
      .toLowerCase()
  ] ?? 'var(--text-muted)';

export const PickerLayout = styled.div`
  display: flex;
  gap: 20px;
  align-items: stretch;
  min-height: 55vh;
  max-height: 68vh;
  margin-top: 8px;
`;

export const PickerSidebar = styled.div`
  width: 240px;
  flex-shrink: 0;
  overflow-y: auto;
  padding-right: 4px;
`;

export const PickerGrupoHeader = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 4px 8px 10px;
  border-left: 3px solid #f87171;
  margin-bottom: 8px;

  svg {
    transition: transform 0.15s ease;
    transform: rotate(${({ $expandido }) => ($expandido ? '0deg' : '-90deg')});
    color: var(--text-secondary);
    flex-shrink: 0;
  }
`;

export const PickerGrupoIcone = styled.span`
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 113, 113, 0.15);
  border: 1px solid #f87171;
  color: #f87171;
`;

export const PickerGrupoNome = styled.span`
  flex: 1;
  text-align: left;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PickerGrupoContagem = styled.span`
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: #f87171;
  color: #1c1830;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const PickerItem = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 6px;
  border-radius: 8px;
  border: 1px solid ${({ $selecionado }) => ($selecionado ? 'var(--color-accent)' : 'var(--border-primary)')};
  background: ${({ $selecionado }) => ($selecionado ? 'rgba(91, 124, 250, 0.12)' : 'var(--bg-card)')};
  color: var(--text-primary);
  font-size: 0.82rem;

  &:hover {
    border-color: var(--color-accent);
  }
`;

export const RaridadeBadge = styled.span`
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  color: ${({ $cor }) => $cor};
  border: 1px solid ${({ $cor }) => $cor};
  background: ${({ $cor }) => $cor}22;
  white-space: nowrap;
`;

export const PickerDetalhe = styled.div`
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding-right: 4px;
`;

export const DetalheTopo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const DetalheTitulo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const DetalheNomeGrande = styled.h2`
  margin: 0;
  font-family: 'Cinzel', Georgia, 'Times New Roman', serif;
  font-size: 1.4rem;
  color: var(--text-primary);
`;

export const DetalheBanner = styled.img`
  width: 100%;
  max-height: 240px;
  object-fit: cover;
  border-radius: 10px;
  margin-top: 16px;
  border: 1px solid var(--border-primary);
`;

export const SecaoTitulo = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 24px 0 12px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);

  &::before {
    content: '';
    width: 3px;
    height: 16px;
    border-radius: 2px;
    background: var(--color-accent);
    flex-shrink: 0;
  }
`;

export const DescricaoBox = styled.p`
  margin: 0;
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--text-secondary);
`;

export const AtributosBaseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
`;

export const AtributoBaseCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const AtributoBaseLabel = styled.span`
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-accent);
`;

export const AtributoBaseValor = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
`;

export const LimiteAtributoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border: 1px solid var(--field-border);
  border-left: 3px solid var(--color-accent);
  border-radius: 8px;
  padding: 12px 16px;
`;

export const LimiteAtributoLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const LimiteAtributoValor = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--status-gold-strong);
`;

export const HabilidadesContagem = styled.span`
  margin-left: 2px;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
`;

export const HabilidadesTabsRow = styled.div`
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 16px;
`;

export const HabilidadeTabButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ $ativo }) => ($ativo ? 'var(--status-gold-strong)' : 'var(--text-secondary)')};
  border-bottom: 2px solid ${({ $ativo }) => ($ativo ? 'var(--status-gold)' : 'transparent')};

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const HabilidadesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  padding-bottom: 4px;
`;

export const HabilidadeCard = styled.div`
  box-sizing: border-box;
  background: var(--bg-card);
  border: 1px solid ${({ $ativo }) => ($ativo ? 'var(--color-accent)' : 'var(--border-primary)')};
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  ${({ $clicavel }) => $clicavel && 'cursor: pointer;'}

  &:hover {
    ${({ $clicavel }) => $clicavel && 'border-color: var(--color-accent);'}
  }
`;

export const HabilidadeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const HabilidadeNome = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.92rem;

  svg {
    width: 16px;
    height: 16px;
    color: var(--status-gold);
    flex-shrink: 0;
  }
`;

export const AcaoBadge = styled.span`
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid #fb923c;
  color: #fb923c;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const HabilidadeDescricao = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
`;

export const HabilidadeChipsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
`;

export const HabilidadeChip = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--field-bg);
  border: 1px solid var(--field-border);
  font-size: 0.7rem;
  color: var(--text-secondary);
  overflow: hidden;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    width: 13px;
    height: 13px;
    color: var(--color-accent);
    flex-shrink: 0;
  }
`;

export const BonusLista = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const PickerSubgrupoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  margin: 4px 0 6px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-accent);
`;

export const HabilidadeCriarArtButton = styled.button`
  all: unset;
  box-sizing: border-box;
  align-self: flex-end;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid ${({ $criada }) => ($criada ? '#4ade80' : 'var(--color-accent)')};
  color: ${({ $criada }) => ($criada ? '#4ade80' : 'var(--color-accent)')};
  background: ${({ $criada }) => ($criada ? 'rgba(74, 222, 128, 0.12)' : 'rgba(91, 124, 250, 0.12)')};

  &:not(:disabled):hover {
    filter: brightness(1.2);
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

export const ProgressoPainel = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  padding: 16px 20px;
  margin-top: 16px;
`;

export const ProgressoHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const ProgressoTitulo = styled.h4`
  margin: 0 0 4px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
`;

export const ProgressoSubtitulo = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

export const ProgressoMetaBadge = styled.span`
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
`;

export const ProgressoBarraTrack = styled.div`
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--field-bg);
  border: 1px solid var(--border-primary);
  margin: 24px 0 8px;
`;

export const ProgressoBarraFill = styled.div`
  position: absolute;
  inset: 0;
  width: ${({ $percentual }) => $percentual}%;
  background: var(--color-accent);
  border-radius: 999px;
  transition: width 0.3s ease;
`;

export const ProgressoMarcosRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

export const ProgressoMarcoLabel = styled.span`
  font-size: 0.78rem;
  color: var(--text-secondary);
`;

export const ProgressoMarcoValor = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-accent);
`;

export const BonusItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);

  svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    margin-top: 2px;
    color: ${({ $variante }) => ($variante === 'check' ? '#4ade80' : 'var(--text-muted)')};
  }
`;
