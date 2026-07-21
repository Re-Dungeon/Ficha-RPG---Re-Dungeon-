import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';
import PlaceIcon from '@mui/icons-material/Place';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import BoltIcon from '@mui/icons-material/Bolt';
import UpdateIcon from '@mui/icons-material/Update';
import CasinoIcon from '@mui/icons-material/Casino';
import TimerIcon from '@mui/icons-material/Timer';

import { addArt, getClassesPorUniverso, getFirestoreItem } from 'service/storage';
import { calcularPowerCombat, calcularPrimariosTotais, calcularSecundarios } from 'common/utils/formulas';
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
  HabilidadeCriarArtButton,
  HabilidadeDescricao,
  HabilidadeHeader,
  HabilidadeNome,
  HabilidadesGrid,
  HabilidadesTabsRow,
  HabilidadeTabButton,
  PickerDetalhe,
  PickerGrupoContagem,
  PickerGrupoHeader,
  PickerGrupoIcone,
  PickerGrupoNome,
  PickerItem,
  PickerLayout,
  PickerSidebar,
  PickerSubgrupoHeader,
  ProgressoBarraFill,
  ProgressoBarraTrack,
  ProgressoHeader,
  ProgressoMarcoLabel,
  ProgressoMarcoValor,
  ProgressoMarcosRow,
  ProgressoMetaBadge,
  ProgressoPainel,
  ProgressoSubtitulo,
  ProgressoTitulo,
  RaridadeBadge,
  SecaoTitulo,
  corRaridade,
} from '../progressao/styles';

const RARIDADES = ['Comum', 'Rara', 'Épica', 'Lendária', 'Mítica'];
const MARCOS_PC = [100, 200, 300];
const MAX_CLASSES = 3;

const ClasseModal = ({ open, onClose, personagem, onSave }) => {
  const [classes, setClasses] = useState([]);
  const [universoNome, setUniversoNome] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroRaridade, setFiltroRaridade] = useState('');
  const [grupoExpandido, setGrupoExpandido] = useState(true);
  const [classeVisualizadaId, setClasseVisualizadaId] = useState(null);
  const [abaHabilidade, setAbaHabilidade] = useState('basicas');
  const [artsCriadas, setArtsCriadas] = useState(() => new Set());
  const { executar } = useSaving();

  useEffect(() => {
    if (!open || !personagem.universo) {
      setClasses([]);
      return undefined;
    }
    let isMounted = true;
    getClassesPorUniverso(personagem.universo).then(itens => {
      if (isMounted) {
        setClasses(itens);
      }
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
    getFirestoreItem('Universo', personagem.universo).then(item => {
      if (isMounted) {
        setUniversoNome(getNome(item));
      }
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
      setArtsCriadas(new Set());
      setClasseVisualizadaId((personagem.classes ?? [])[0] ?? null);
    }
  }, [open, personagem.classes]);

  const classesFiltradas = useMemo(
    () =>
      classes.filter(item => {
        const nomeOk = getNome(item).toLowerCase().includes(busca.toLowerCase());
        const raridadeOk = !filtroRaridade || item.raridade === filtroRaridade;
        return nomeOk && raridadeOk;
      }),
    [classes, busca, filtroRaridade],
  );

  const gruposPorRaridade = useMemo(
    () =>
      RARIDADES.map(raridade => ({
        raridade,
        itens: classesFiltradas.filter(item => item.raridade === raridade),
      })).filter(grupo => grupo.itens.length > 0),
    [classesFiltradas],
  );

  useEffect(() => {
    if (!classeVisualizadaId && classesFiltradas.length > 0) {
      setClasseVisualizadaId(classesFiltradas[0].id);
    }
  }, [classesFiltradas, classeVisualizadaId]);

  const classeVisualizada = classes.find(item => item.id === classeVisualizadaId) ?? null;
  const classesSelecionadas = useMemo(() => personagem.classes ?? [], [personagem.classes]);
  const jaEscolhida = Boolean(classeVisualizada) && classesSelecionadas.includes(classeVisualizada.id);
  const bloqueada = !jaEscolhida && classesSelecionadas.length >= MAX_CLASSES;

  const primariosTotais = calcularPrimariosTotais(
    personagem.atributosBase,
    personagem.atributosExtra,
    personagem.atributosBonus,
  );
  const secundariosTotais = calcularSecundarios(
    primariosTotais,
    personagem.secundariosBase,
    personagem.secundariosExtra,
    personagem.secundariosBonus,
  );
  const powerCombat = calcularPowerCombat(primariosTotais, secundariosTotais);

  const proximoMarcoIndex = MARCOS_PC.findIndex(marco => powerCombat < marco);
  const metaAtual = proximoMarcoIndex === -1 ? MARCOS_PC.length : proximoMarcoIndex + 1;
  const proximoMarcoValor = proximoMarcoIndex === -1 ? MARCOS_PC[MARCOS_PC.length - 1] : MARCOS_PC[proximoMarcoIndex];
  const ultimoMarco = MARCOS_PC[MARCOS_PC.length - 1];

  const handleEscolher = useCallback(() => {
    if (!classeVisualizada || bloqueada) {
      return undefined;
    }
    const nova = jaEscolhida
      ? classesSelecionadas.filter(id => id !== classeVisualizada.id)
      : [...classesSelecionadas, classeVisualizada.id];
    return executar(() => onSave({ classes: nova }));
  }, [classeVisualizada, jaEscolhida, bloqueada, classesSelecionadas, onSave, executar]);

  const handleCriarArt = useCallback(
    (habilidade, tipoLista, index) => {
      if (!classeVisualizada) {
        return undefined;
      }
      const chave = `${classeVisualizada.id}-${tipoLista}-${index}`;
      return executar(async () => {
        await addArt(personagem.id, {
          origem: 'classe',
          classeId: classeVisualizada.id,
          habilidadeId: `${tipoLista}-${index}`,
          nome: habilidade.nome,
          descricao: habilidade.descricao ?? '',
          ativa: true,
        });
        setArtsCriadas(current => new Set(current).add(chave));
      });
    },
    [classeVisualizada, personagem.id, executar],
  );

  const atributosBasicos = classeVisualizada?.atributosBasicos ?? {};
  const habilidadesBasicas = classeVisualizada?.habilidadesBasicas ?? [];
  const habilidadesAvancadas = classeVisualizada?.habilidadesAvancadas ?? [];

  const renderHabilidadeCard = (habilidade, tipoLista, index) => {
    const chave = classeVisualizada ? `${classeVisualizada.id}-${tipoLista}-${index}` : `${tipoLista}-${index}`;
    const criada = artsCriadas.has(chave);
    return (
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
        <HabilidadeCriarArtButton
          type="button"
          aria-label={criada ? `${habilidade.nome} já virou Art` : `Criar Art a partir de ${habilidade.nome}`}
          $criada={criada}
          disabled={criada}
          onClick={() => handleCriarArt(habilidade, tipoLista, index)}
        >
          <CheckIcon fontSize="inherit" />
        </HabilidadeCriarArtButton>
      </HabilidadeCard>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogHeaderRow>
        <DialogHeaderTitle>Escolher Classe</DialogHeaderTitle>
        <TextField
          size="small"
          placeholder="Buscar classe..."
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
        <div style={{ display: 'flex', gap: 8 }}>
          <DialogFecharButton type="button" aria-label="Voltar" onClick={onClose}>
            <KeyboardReturnIcon fontSize="small" />
          </DialogFecharButton>
          <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </DialogFecharButton>
        </div>
      </DialogHeaderRow>

      <DialogContent>
        {!personagem.universo && (
          <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
            Selecione um Universo no menu lateral Info primeiro.
          </StatusValueRow>
        )}

        {personagem.universo && (
          <>
            <PickerLayout>
              <PickerSidebar>
                <PickerGrupoHeader $expandido={grupoExpandido} onClick={() => setGrupoExpandido(current => !current)}>
                  <ExpandMoreIcon fontSize="small" />
                  <PickerGrupoIcone>
                    <Diversity3Icon fontSize="small" />
                  </PickerGrupoIcone>
                  <PickerGrupoNome>{universoNome || 'Universo'}</PickerGrupoNome>
                  <PickerGrupoContagem>{classes.length}</PickerGrupoContagem>
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
                          $selecionado={item.id === classeVisualizadaId}
                          onClick={() => setClasseVisualizadaId(item.id)}
                        >
                          <span>{getNome(item)}</span>
                          <RaridadeBadge $cor={corRaridade(item.raridade)}>{item.raridade}</RaridadeBadge>
                        </PickerItem>
                      ))}
                    </React.Fragment>
                  ))}
                {grupoExpandido && gruposPorRaridade.length === 0 && (
                  <StatusValueRow style={{ display: 'block' }}>Nenhuma classe encontrada.</StatusValueRow>
                )}
              </PickerSidebar>

              <PickerDetalhe>
                {!classeVisualizada && <StatusValueRow>Selecione uma classe na lista ao lado.</StatusValueRow>}

                {classeVisualizada && (
                  <>
                    <DetalheTopo>
                      <DetalheTitulo>
                        <DetalheNomeGrande>{getNome(classeVisualizada).toUpperCase()}</DetalheNomeGrande>
                        {classeVisualizada.raridade && (
                          <RaridadeBadge $cor={corRaridade(classeVisualizada.raridade)}>
                            {classeVisualizada.raridade}
                          </RaridadeBadge>
                        )}
                      </DetalheTitulo>
                      <Button
                        variant={jaEscolhida ? 'outlined' : 'contained'}
                        disabled={bloqueada}
                        onClick={handleEscolher}
                      >
                        {jaEscolhida ? 'Escolhida' : bloqueada ? 'Limite atingido' : 'Escolher'}
                      </Button>
                    </DetalheTopo>

                    {classeVisualizada.linkImagem && <DetalheBanner src={classeVisualizada.linkImagem} alt="" />}

                    <SecaoTitulo>Descrição</SecaoTitulo>
                    <DescricaoBox>{classeVisualizada.descricao || 'Sem descrição cadastrada.'}</DescricaoBox>

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

                    <SecaoTitulo>Habilidades da Classe</SecaoTitulo>
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
                        {habilidadesBasicas.map((habilidade, index) => renderHabilidadeCard(habilidade, 'basica', index))}
                        {habilidadesBasicas.length === 0 && (
                          <StatusValueRow>Nenhuma habilidade básica cadastrada.</StatusValueRow>
                        )}
                      </HabilidadesGrid>
                    )}
                    {abaHabilidade === 'avancadas' && (
                      <HabilidadesGrid>
                        {habilidadesAvancadas.map((habilidade, index) => renderHabilidadeCard(habilidade, 'avancada', index))}
                        {habilidadesAvancadas.length === 0 && (
                          <StatusValueRow>Nenhuma habilidade avançada cadastrada.</StatusValueRow>
                        )}
                      </HabilidadesGrid>
                    )}
                  </>
                )}
              </PickerDetalhe>
            </PickerLayout>

            <ProgressoPainel>
              <ProgressoHeader>
                <div>
                  <ProgressoTitulo>Progresso de desbloqueio de classes</ProgressoTitulo>
                  <ProgressoSubtitulo>Use seu Power Combat para liberar as próximas classes.</ProgressoSubtitulo>
                </div>
                <ProgressoMetaBadge>
                  Meta {metaAtual} de {MARCOS_PC.length} a {proximoMarcoValor} PC
                </ProgressoMetaBadge>
              </ProgressoHeader>
              <ProgressoBarraTrack>
                <ProgressoBarraFill $percentual={Math.min(100, (powerCombat / ultimoMarco) * 100)} />
              </ProgressoBarraTrack>
              <ProgressoMarcosRow>
                <ProgressoMarcoLabel>Classe 1</ProgressoMarcoLabel>
                <ProgressoMarcoLabel>Classe 2</ProgressoMarcoLabel>
                <ProgressoMarcoLabel>Classe 3</ProgressoMarcoLabel>
              </ProgressoMarcosRow>
              <ProgressoMarcosRow style={{ marginTop: 4 }}>
                <ProgressoMarcoValor>
                  {powerCombat} / {ultimoMarco} PC
                </ProgressoMarcoValor>
                <span />
                <ProgressoMarcoValor>Próxima meta: {proximoMarcoValor} PC</ProgressoMarcoValor>
              </ProgressoMarcosRow>
            </ProgressoPainel>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

ClasseModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ClasseModal;
