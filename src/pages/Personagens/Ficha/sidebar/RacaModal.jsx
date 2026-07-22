import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckIcon from '@mui/icons-material/Check';
import PlaceIcon from '@mui/icons-material/Place';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import BoltIcon from '@mui/icons-material/Bolt';
import UpdateIcon from '@mui/icons-material/Update';
import CasinoIcon from '@mui/icons-material/Casino';
import TimerIcon from '@mui/icons-material/Timer';

import { getFirestoreItem, getRacasPorUniverso } from 'service/storage';
import { calcularLimiteHabilidadesBasicas } from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';
import { useSaving } from 'context/SavingContext';

import { PRIMARIOS_LABELS } from '../constants';
import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle, StatusValueRow } from '../styles';
import {
  AcaoBadge,
  AtributoBaseCard,
  AtributoBaseLabel,
  AtributoBaseValor,
  AtributosBaseGrid,
  BonusItem,
  BonusLista,
  DescricaoBox,
  DetalheBanner,
  DetalheNomeGrande,
  DetalheTitulo,
  DetalheTopo,
  HabilidadeCard,
  HabilidadeChip,
  HabilidadeChipsGrid,
  HabilidadeDescricao,
  HabilidadeHeader,
  HabilidadeNome,
  HabilidadesContagem,
  HabilidadesGrid,
  HabilidadesTabsRow,
  HabilidadeTabButton,
  LimiteAtributoLabel,
  LimiteAtributoRow,
  LimiteAtributoValor,
  PickerDetalhe,
  PickerGrupoContagem,
  PickerGrupoHeader,
  PickerGrupoIcone,
  PickerGrupoNome,
  PickerItem,
  PickerLayout,
  PickerSidebar,
  PickerSubgrupoHeader,
  RaridadeBadge,
  SecaoTitulo,
  corRaridade,
} from '../progressao/styles';

const RARIDADES = ['Comum', 'Rara', 'Épica', 'Lendária', 'Mítica'];

const RacaModal = ({ open, onClose, personagem, onSave }) => {
  const [racas, setRacas] = useState([]);
  const [universoNome, setUniversoNome] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroRaridade, setFiltroRaridade] = useState('');
  const [grupoExpandido, setGrupoExpandido] = useState(true);
  const [racaVisualizadaId, setRacaVisualizadaId] = useState(null);
  const [abaHabilidade, setAbaHabilidade] = useState('basicas');
  const { executar } = useSaving();

  useEffect(() => {
    if (!open || !personagem.universo) {
      setRacas([]);
      return undefined;
    }
    let isMounted = true;
    getRacasPorUniverso(personagem.universo)
      .then(itens => {
        if (isMounted) {
          setRacas(itens);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar raças:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [open, personagem.universo]);

  useEffect(() => {
    if (!open || !personagem.universo) {
      setUniversoNome('');
      return undefined;
    }
    let isMounted = true;
    getFirestoreItem('Universo', personagem.universo)
      .then(item => {
        if (isMounted) {
          setUniversoNome(getNome(item));
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar universo:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [open, personagem.universo]);

  useEffect(() => {
    if (open) {
      setBusca('');
      setFiltroRaridade('');
      setAbaHabilidade('basicas');
      setGrupoExpandido(true);
      setRacaVisualizadaId(personagem.raca || null);
    }
  }, [open, personagem.raca]);

  const racasFiltradas = useMemo(
    () =>
      racas.filter(item => {
        const nomeOk = getNome(item).toLowerCase().includes(busca.toLowerCase());
        const raridadeOk = !filtroRaridade || item.raridade === filtroRaridade;
        return nomeOk && raridadeOk;
      }),
    [racas, busca, filtroRaridade],
  );

  const gruposPorRaridade = useMemo(
    () =>
      RARIDADES.map(raridade => ({
        raridade,
        itens: racasFiltradas.filter(item => item.raridade === raridade),
      })).filter(grupo => grupo.itens.length > 0),
    [racasFiltradas],
  );

  useEffect(() => {
    if (!racaVisualizadaId && racasFiltradas.length > 0) {
      setRacaVisualizadaId(racasFiltradas[0].id);
    }
  }, [racasFiltradas, racaVisualizadaId]);

  const racaVisualizada = racas.find(item => item.id === racaVisualizadaId) ?? null;
  const ehRacaAtual = Boolean(racaVisualizada) && racaVisualizada.id === personagem.raca;
  const habilidadesAtivas = useMemo(() => personagem.racaHabilidadesAtivas ?? [], [personagem.racaHabilidadesAtivas]);
  const limiteBasicas = racaVisualizada ? calcularLimiteHabilidadesBasicas(racaVisualizada.raridade) : 0;

  const handleEscolher = useCallback(() => {
    if (!racaVisualizada) {
      return undefined;
    }
    return executar(() => onSave({ raca: racaVisualizada.id, racaHabilidadesAtivas: [] }));
  }, [racaVisualizada, onSave, executar]);

  const handleToggleHabilidade = useCallback(
    index => {
      if (!ehRacaAtual) {
        return undefined;
      }
      const ativo = habilidadesAtivas.includes(index);
      if (!ativo && habilidadesAtivas.length >= limiteBasicas) {
        return undefined;
      }
      const nova = ativo ? habilidadesAtivas.filter(item => item !== index) : [...habilidadesAtivas, index];
      return executar(() => onSave({ racaHabilidadesAtivas: nova }));
    },
    [ehRacaAtual, habilidadesAtivas, limiteBasicas, onSave, executar],
  );

  const habilidadesBasicas = racaVisualizada?.habilidadesRaciais?.habilidadesBasicas ?? [];
  const habilidadesAvancadas = racaVisualizada?.habilidadesRaciais?.habilidadesAvancadas ?? [];
  const atributosBasicos = racaVisualizada?.atributosBasicos ?? {};

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogHeaderRow>
        <DialogHeaderTitle>Escolher Raça</DialogHeaderTitle>
        <TextField
          size="small"
          placeholder="Buscar raça..."
          value={busca}
          onChange={event => setBusca(event.target.value)}
          sx={{ flex: 1, maxWidth: 260 }}
        />
        <TextField
          select
          size="small"
          value={filtroRaridade}
          onChange={event => setFiltroRaridade(event.target.value)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="">Todas as raridades</MenuItem>
          {RARIDADES.map(raridade => (
            <MenuItem key={raridade} value={raridade}>
              {raridade}
            </MenuItem>
          ))}
        </TextField>
        <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </DialogFecharButton>
      </DialogHeaderRow>

      <DialogContent>
        {!personagem.universo && (
          <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
            Selecione um Universo no menu lateral Info primeiro.
          </StatusValueRow>
        )}

        {personagem.universo && (
          <PickerLayout>
            <PickerSidebar>
              <PickerGrupoHeader $expandido={grupoExpandido} onClick={() => setGrupoExpandido(current => !current)}>
                <ExpandMoreIcon fontSize="small" />
                <PickerGrupoIcone>
                  <Diversity3Icon fontSize="small" />
                </PickerGrupoIcone>
                <PickerGrupoNome>{universoNome || 'Universo'}</PickerGrupoNome>
                <PickerGrupoContagem>{racasFiltradas.length}</PickerGrupoContagem>
              </PickerGrupoHeader>

              {grupoExpandido &&
                gruposPorRaridade.map(grupo => (
                  <React.Fragment key={grupo.raridade}>
                    <PickerSubgrupoHeader>
                      <span>{grupo.raridade}</span>
                      <span>({grupo.itens.length})</span>
                    </PickerSubgrupoHeader>
                    {grupo.itens.map(item => (
                      <PickerItem
                        key={item.id}
                        type="button"
                        $selecionado={item.id === racaVisualizadaId}
                        onClick={() => setRacaVisualizadaId(item.id)}
                      >
                        <span>{getNome(item)}</span>
                        <RaridadeBadge $cor={corRaridade(item.raridade)}>{item.raridade}</RaridadeBadge>
                      </PickerItem>
                    ))}
                  </React.Fragment>
                ))}
              {grupoExpandido && gruposPorRaridade.length === 0 && (
                <StatusValueRow style={{ display: 'block' }}>Nenhuma raça encontrada.</StatusValueRow>
              )}
            </PickerSidebar>

            <PickerDetalhe>
              {!racaVisualizada && <StatusValueRow>Selecione uma raça na lista ao lado.</StatusValueRow>}

              {racaVisualizada && (
                <>
                  <DetalheTopo>
                    <DetalheTitulo>
                      <DetalheNomeGrande>{getNome(racaVisualizada).toUpperCase()}</DetalheNomeGrande>
                      {racaVisualizada.raridade && (
                        <RaridadeBadge $cor={corRaridade(racaVisualizada.raridade)}>
                          {racaVisualizada.raridade}
                        </RaridadeBadge>
                      )}
                    </DetalheTitulo>
                    <Button variant="contained" disabled={ehRacaAtual} onClick={handleEscolher}>
                      {ehRacaAtual ? 'Selecionada' : 'Escolher'}
                    </Button>
                  </DetalheTopo>

                  {racaVisualizada.linkImagem && <DetalheBanner src={racaVisualizada.linkImagem} alt="" />}

                  <SecaoTitulo>Descrição</SecaoTitulo>
                  <DescricaoBox>{racaVisualizada.descricao || 'Sem descrição cadastrada.'}</DescricaoBox>

                  <SecaoTitulo>Atributos Base</SecaoTitulo>
                  <AtributosBaseGrid>
                    {Object.entries(PRIMARIOS_LABELS).map(
                      ([chave, label]) =>
                        atributosBasicos[chave] && (
                          <AtributoBaseCard key={chave}>
                            <AtributoBaseLabel>{label}</AtributoBaseLabel>
                            <AtributoBaseValor>{atributosBasicos[chave]}</AtributoBaseValor>
                          </AtributoBaseCard>
                        ),
                    )}
                  </AtributosBaseGrid>

                  {atributosBasicos.limiteMaximoAtributo && (
                    <>
                      <SecaoTitulo>Limite Máximo de Atributo</SecaoTitulo>
                      <LimiteAtributoRow>
                        <LimiteAtributoLabel>Limite de Atributo</LimiteAtributoLabel>
                        <LimiteAtributoValor>{atributosBasicos.limiteMaximoAtributo}</LimiteAtributoValor>
                      </LimiteAtributoRow>
                    </>
                  )}

                  <SecaoTitulo>
                    Habilidades Raciais
                    <HabilidadesContagem>
                      {habilidadesAtivas.length}/{limiteBasicas === Infinity ? '∞' : limiteBasicas}
                    </HabilidadesContagem>
                  </SecaoTitulo>

                  <HabilidadesTabsRow>
                    <HabilidadeTabButton
                      type="button"
                      $ativo={abaHabilidade === 'basicas'}
                      onClick={() => setAbaHabilidade('basicas')}
                    >
                      <StarIcon fontSize="inherit" /> Básicas
                    </HabilidadeTabButton>
                    <HabilidadeTabButton
                      type="button"
                      $ativo={abaHabilidade === 'avancadas'}
                      onClick={() => setAbaHabilidade('avancadas')}
                    >
                      <LocalFireDepartmentIcon fontSize="inherit" /> Avançadas
                    </HabilidadeTabButton>
                  </HabilidadesTabsRow>

                  {abaHabilidade === 'basicas' && (
                    <HabilidadesGrid>
                      {habilidadesBasicas.map((habilidade, index) => {
                        const ativo = ehRacaAtual && habilidadesAtivas.includes(index);
                        const bloqueado = ehRacaAtual && !ativo && habilidadesAtivas.length >= limiteBasicas;
                        return (
                          <HabilidadeCard
                            key={index}
                            $ativo={ativo}
                            $clicavel={ehRacaAtual}
                            role={ehRacaAtual ? 'button' : undefined}
                            tabIndex={ehRacaAtual ? 0 : undefined}
                            aria-pressed={ehRacaAtual ? ativo : undefined}
                            onClick={ehRacaAtual ? () => handleToggleHabilidade(index) : undefined}
                            onKeyDown={
                              ehRacaAtual
                                ? event => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      handleToggleHabilidade(index);
                                    }
                                  }
                                : undefined
                            }
                          >
                            <HabilidadeHeader>
                              <HabilidadeNome>
                                <AutoAwesomeIcon fontSize="inherit" />
                                {habilidade.nome}
                              </HabilidadeNome>
                              {ehRacaAtual && (
                                <StatusValueRow>
                                  {ativo ? 'Ativa' : bloqueado ? 'Limite atingido' : 'Toque p/ ativar'}
                                </StatusValueRow>
                              )}
                            </HabilidadeHeader>
                            <HabilidadeDescricao>{habilidade.descricao}</HabilidadeDescricao>
                            {Array.isArray(habilidade.bonus) && habilidade.bonus.length > 0 && (
                              <BonusLista>
                                {habilidade.bonus.map((linha, linhaIndex) => (
                                  <BonusItem key={linhaIndex}>
                                    <RemoveIcon fontSize="inherit" />
                                    {linha}
                                  </BonusItem>
                                ))}
                              </BonusLista>
                            )}
                          </HabilidadeCard>
                        );
                      })}
                      {habilidadesBasicas.length === 0 && (
                        <StatusValueRow>Nenhuma habilidade básica cadastrada.</StatusValueRow>
                      )}
                    </HabilidadesGrid>
                  )}

                  {abaHabilidade === 'avancadas' && (
                    <HabilidadesGrid>
                      {habilidadesAvancadas.map((habilidade, index) => (
                        <HabilidadeCard key={index}>
                          <HabilidadeHeader>
                            <HabilidadeNome>
                              <AutoAwesomeIcon fontSize="inherit" />
                              {habilidade.nome}
                            </HabilidadeNome>
                            {habilidade.acao && <AcaoBadge>{habilidade.acao}</AcaoBadge>}
                          </HabilidadeHeader>
                          <HabilidadeDescricao>{habilidade.descricao}</HabilidadeDescricao>
                          <HabilidadeChipsGrid>
                            {habilidade.alcance && (
                              <HabilidadeChip>
                                <PlaceIcon fontSize="inherit" />
                                <span>{habilidade.alcance}</span>
                              </HabilidadeChip>
                            )}
                            {habilidade.alvo && (
                              <HabilidadeChip>
                                <GpsFixedIcon fontSize="inherit" />
                                <span>{habilidade.alvo}</span>
                              </HabilidadeChip>
                            )}
                            {habilidade.custo && (
                              <HabilidadeChip>
                                <BoltIcon fontSize="inherit" />
                                <span>{habilidade.custo}</span>
                              </HabilidadeChip>
                            )}
                            {habilidade.recarga && (
                              <HabilidadeChip>
                                <UpdateIcon fontSize="inherit" />
                                <span>{habilidade.recarga}</span>
                              </HabilidadeChip>
                            )}
                            {habilidade.dados && (
                              <HabilidadeChip>
                                <CasinoIcon fontSize="inherit" />
                                <span>{habilidade.dados}</span>
                              </HabilidadeChip>
                            )}
                            {habilidade.duracao && (
                              <HabilidadeChip>
                                <TimerIcon fontSize="inherit" />
                                <span>{habilidade.duracao}</span>
                              </HabilidadeChip>
                            )}
                          </HabilidadeChipsGrid>
                          {Array.isArray(habilidade.bonus) && habilidade.bonus.length > 0 && (
                            <BonusLista>
                              {habilidade.bonus.map((linha, linhaIndex) => (
                                <BonusItem key={linhaIndex} $variante="check">
                                  <CheckIcon fontSize="inherit" />
                                  {linha}
                                </BonusItem>
                              ))}
                            </BonusLista>
                          )}
                        </HabilidadeCard>
                      ))}
                      {habilidadesAvancadas.length === 0 && (
                        <StatusValueRow>Nenhuma habilidade avançada cadastrada.</StatusValueRow>
                      )}
                    </HabilidadesGrid>
                  )}
                </>
              )}
            </PickerDetalhe>
          </PickerLayout>
        )}
      </DialogContent>
    </Dialog>
  );
};

RacaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default RacaModal;
