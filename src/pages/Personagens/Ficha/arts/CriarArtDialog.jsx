import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as yup from 'yup';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
// DialogTitle não é usado — cabeçalho customizado usado no lugar
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';
import PlaceIcon from '@mui/icons-material/Place';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import BoltIcon from '@mui/icons-material/Bolt';
import UpdateIcon from '@mui/icons-material/Update';
import CasinoIcon from '@mui/icons-material/Casino';
import TimerIcon from '@mui/icons-material/Timer';

import { getArtesPorUniverso, getFirestoreItem } from 'service/storage';
import { campoCurtoSchema, descricaoSchema, nomeSchema, urlImagemSchema } from 'common/utils/yupSchemas';
import { getNome } from 'common/utils/resolveNome';

import {
  AcaoBadge,
  BonusItem,
  BonusLista,
  HabilidadeCard,
  HabilidadeChip,
  HabilidadeChipsGrid,
  HabilidadeDescricao,
  HabilidadeHeader,
  HabilidadeNome,
  HabilidadesGrid,
} from '../progressao/styles';
import { StatusValueRow } from '../styles';
import ArtCatalogoCard from './ArtCatalogoCard';
import { ART_AUTORAL_INICIAL, DOMINIO_LABELS, TIPO_ACAO_OPTIONS, TIPO_ART_OPTIONS } from './constants';
import { ArtsGrid, CatalogArtsGrid } from './styles';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px 8px 24px;
  background: linear-gradient(180deg, rgba(29,27,47,0.7), rgba(20,16,33,0.6));
  border-bottom: 1px solid rgba(255,255,255,0.04);
  animation: ${fadeIn} 220ms ease;
`;

const HeaderLeft = styled.div`
  display:flex; align-items:center; gap:12px;
`;
const HeaderIcon = styled.div`
  width:48px; height:48px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, rgba(108,99,255,0.12), rgba(232,195,106,0.06)); color:var(--color-accent);
  box-shadow: 0 8px 20px rgba(16,14,28,0.4);
`;

const HeaderTitle = styled.div`
  display:flex; flex-direction:column;
`;

const TitleMain = styled.div`
  font-weight:700; font-size:1.05rem; color:var(--text-primary);
`;

const TitleSub = styled.div`
  font-size:0.82rem; color:var(--text-secondary);
`;

const SectionCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.35);
`;

const SectionHeader = styled.div`
  display:flex; align-items:center; gap:8px; margin-bottom:10px; font-weight:700; color:var(--text-primary);
`;

const TwoColGrid = styled.div`
  display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; align-items:start;
  @media (max-width:720px){ grid-template-columns:1fr; }
`;

const UniformGrid = styled.div`
  display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; align-items:start;
  @media (max-width:920px){ grid-template-columns: repeat(2, 1fr); }
  @media (max-width:520px){ grid-template-columns:1fr; }
`;

const StyledTextField = styled(TextField)`
  && {
    .MuiOutlinedInput-root { border-radius: 10px; background: rgba(255,255,255,0.02); transition: box-shadow 180ms ease, border-color 180ms ease; }
    .MuiOutlinedInput-root:hover { box-shadow: 0 6px 18px rgba(91,124,250,0.04); }
    .MuiOutlinedInput-root.Mui-focused { box-shadow: 0 10px 34px rgba(108,99,255,0.08); border-color: rgba(108,99,255,0.36); }
    .MuiInputLabel-root { color: var(--text-secondary); }
    .MuiFormHelperText-root { color: var(--text-secondary); }
  }
`;

const LargeTextarea = styled(StyledTextField)`
  && { .MuiOutlinedInput-root { min-height:140px; } }
`;

const ActionsRight = styled.div`
  display:flex; gap:12px; align-items:center; justify-content:flex-end; padding:12px 24px;
`;

const OutlineButton = styled(Button)`
  && { border:1px solid rgba(255,255,255,0.06); color:var(--text-primary); background:transparent; padding:10px 18px; border-radius:10px; }
`;

const PrimaryButton = styled(Button)`
  && { background: linear-gradient(90deg, rgba(108,99,255,0.95), rgba(91,124,250,0.95)); color:#fff; padding:10px 20px; border-radius:10px; box-shadow:0 12px 36px rgba(33,61,150,0.18); }
`;

const artAutoralSchema = yup.object({
  nome: nomeSchema,
  tipo: yup.string().required(),
  dominio: yup.number().min(1).max(5).required(),
  recarga: campoCurtoSchema,
  duracao: campoCurtoSchema,
  alcance: campoCurtoSchema,
  alvos: campoCurtoSchema,
  custo: campoCurtoSchema,
  dados: campoCurtoSchema,
  tipoAcao: yup.string().required(),
  imagem: urlImagemSchema,
  circuloMagico: campoCurtoSchema,
  cantico: descricaoSchema,
  descricao: descricaoSchema,
});

// Campos do item de catálogo que, se existirem, são copiados pro doc da Art do
// personagem — assim o card redesenhado tem o que mostrar mesmo pra Arts de
// origem "catalogo" (o catálogo `artes` não é garantido ter todos esses campos).
// `tipo`/`tipoAcao`/`condicoesAplicadas` ficam de fora dessa lista de match direto
// porque o catálogo usa `classificacao`/`acao`/objetos completos de condição — ver
// extrairCamposArt abaixo.
const CAMPOS_ART_CATALOGO = [
  'dominio',
  'custo',
  'dados',
  'recarga',
  'duracao',
  'alcance',
  'alvos',
  'descricao',
  'imagem',
  'cantico',
  'circuloMagico',
];

const extrairCamposArt = item => {
  const campos = Object.fromEntries(
    CAMPOS_ART_CATALOGO.filter(campo => item[campo] !== undefined).map(campo => [campo, item[campo]]),
  );
  if (item.acao !== undefined) {
    campos.tipoAcao = item.acao;
  }
  if (item.classificacao !== undefined) {
    campos.tipo = item.classificacao;
  }
  if (Array.isArray(item.condicoesAplicadas)) {
    campos.condicoesAplicadas = item.condicoesAplicadas.map(condicao => condicao.id).filter(Boolean);
  }
  if (!campos.imagem && item.linkImagem) {
    campos.imagem = item.linkImagem;
  }
  return campos;
};

const CriarArtDialog = ({ open, onClose, personagem, nucleos, condicoes, onCreate }) => {
  const [origem, setOrigem] = useState('autoral');
  const [nucleoId, setNucleoId] = useState('');
  const [classesDetalhes, setClassesDetalhes] = useState([]);
  const [catalogoArtes, setCatalogoArtes] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }
    setOrigem('autoral');
    setNucleoId('');
    setBusca('');
  }, [open]);

  useEffect(() => {
    if (!open || origem !== 'classe') {
      return;
    }
    Promise.all((personagem.classes ?? []).map(id => getFirestoreItem('classes', id)))
      .then(itens => setClassesDetalhes(itens.filter(Boolean)))
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar classes:', erro);
      });
  }, [open, origem, personagem.classes]);

  useEffect(() => {
    if (!open || origem !== 'catalogo' || !personagem.universo) {
      setCatalogoArtes([]);
      return;
    }
    getArtesPorUniverso(personagem.universo)
      .then(setCatalogoArtes)
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar catálogo de artes:', erro);
      });
  }, [open, origem, personagem.universo]);

  const handleAutoralSubmit = useCallback(
    (values, { setSubmitting }) => {
      onCreate({ origem: 'autoral', ...values, nucleoId, ativa: true });
      setSubmitting(false);
      onClose();
    },
    [onCreate, onClose, nucleoId],
  );

  const handleEscolherHabilidadeClasse = useCallback(
    (classe, tipoLista, index, habilidade) => {
      onCreate({
        origem: 'classe',
        classeId: classe.id,
        habilidadeId: `${tipoLista}-${index}`,
        nome: habilidade.nome,
        descricao: habilidade.descricao ?? '',
        // Campos da habilidade de classe têm nomes próprios (alvo/acao) —
        // remapeados pros nomes que o card/formulário de Art usam (alvos/tipoAcao).
        // `dados` já usa o mesmo nome nos dois lados.
        alcance: habilidade.alcance ?? '',
        alvos: habilidade.alvo ?? '',
        custo: habilidade.custo ?? '',
        recarga: habilidade.recarga ?? '',
        dados: habilidade.dados ?? '',
        duracao: habilidade.duracao ?? '',
        tipoAcao: habilidade.acao ?? '',
        nucleoId,
        ativa: true,
      });
      onClose();
    },
    [onCreate, onClose, nucleoId],
  );

  const handeEscolherDoCatalogo = useCallback(
    item => {
      onCreate({
        origem: 'catalogo',
        arteId: item.id,
        nome: getNome(item),
        nucleoId,
        ativa: true,
        ...extrairCamposArt(item),
      });
      onClose();
    },
    [onCreate, onClose, nucleoId],
  );

  const artesFiltradas = catalogoArtes.filter(item =>
    getNome(item).toLowerCase().includes(busca.toLowerCase()),
  );

  const semNucleos = nucleos.length === 0;

  const renderHabilidadeClasseCard = (classe, tipoLista, index, habilidade) => (
    <HabilidadeCard key={`${classe.id}-${tipoLista}-${index}`}>
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
      <Button
        size="small"
        variant="contained"
        disabled={!nucleoId}
        onClick={() => handleEscolherHabilidadeClasse(classe, tipoLista, index, habilidade)}
      >
        Escolher
      </Button>
    </HabilidadeCard>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={origem === 'autoral' ? 'sm' : 'lg'}>
      <DialogHeader>
        <HeaderLeft>
          <HeaderIcon>
            <AutoAwesomeIcon fontSize="inherit" />
          </HeaderIcon>
          <HeaderTitle>
            <TitleMain>Criar Arte</TitleMain>
            <TitleSub>Desenvolva uma nova técnica personalizada.</TitleSub>
          </HeaderTitle>
        </HeaderLeft>
        <div style={{ minWidth: 260 }}>
          <StyledTextField
            name="nucleoId"
            label="Núcleo *"
            select
            value={nucleoId}
            onChange={event => setNucleoId(event.target.value)}
            size="small"
            fullWidth
            disabled={semNucleos}
          >
            {nucleos.map(nucleo => (
              <MenuItem key={nucleo.id} value={nucleo.id}>
                {nucleo.nome}
              </MenuItem>
            ))}
          </StyledTextField>
        </div>
      </DialogHeader>

      <Tabs
        value={origem}
        onChange={(_event, novaOrigem) => setOrigem(novaOrigem)}
        variant="fullWidth"
        textColor="inherit"
        sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 700 }, '& .MuiTabs-indicator': { height: 4, borderRadius: 6, background: 'linear-gradient(90deg, rgba(108,99,255,0.9), rgba(232,195,106,0.9))' } }}
      >
        <Tab value="autoral" label="Autoral" disabled={semNucleos} />
        <Tab value="classe" label="Habilidade de Classe" disabled={semNucleos} />
        <Tab value="catalogo" label="Catálogo" disabled={semNucleos} />
      </Tabs>

      {origem === 'autoral' && (
        <Formik
          initialValues={ART_AUTORAL_INICIAL}
          validationSchema={artAutoralSchema}
          onSubmit={handleAutoralSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit: submit,
            isSubmitting,
            setFieldValue,
          }) => (
            <form onSubmit={submit} noValidate>
              <DialogContent style={{ paddingBottom: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SectionCard>
                    <SectionHeader>📜 Informações Básicas</SectionHeader>
                    <TwoColGrid>
                      <StyledTextField
                        name="nome"
                        label="Nome"
                        value={values.nome}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.nome && Boolean(errors.nome)}
                        helperText={touched.nome && errors.nome}
                        size="small"
                      />
                      <StyledTextField
                        name="imagem"
                        label="URL da imagem (opcional)"
                        value={values.imagem}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.imagem && Boolean(errors.imagem)}
                        helperText={touched.imagem && errors.imagem}
                        size="small"
                      />
                      <StyledTextField
                        name="tipo"
                        label="Tipo"
                        select
                        value={values.tipo}
                        onChange={handleChange}
                        size="small"
                      >
                        {TIPO_ART_OPTIONS.map(opcao => (
                          <MenuItem key={opcao} value={opcao}>
                            {opcao}
                          </MenuItem>
                        ))}
                      </StyledTextField>
                      <StyledTextField
                        name="dominio"
                        label="Domínio"
                        select
                        value={values.dominio}
                        onChange={handleChange}
                        size="small"
                      >
                        {[1, 2, 3, 4, 5].map(nivel => (
                          <MenuItem key={nivel} value={nivel}>
                            {nivel} — {DOMINIO_LABELS[nivel]}
                          </MenuItem>
                        ))}
                      </StyledTextField>
                    </TwoColGrid>
                    <div style={{ marginTop: 10 }}>
                      <StyledTextField
                        name="tipoAcao"
                        label="Tipo de Ação"
                        select
                        value={values.tipoAcao}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                      >
                        {TIPO_ACAO_OPTIONS.map(opcao => (
                          <MenuItem key={opcao} value={opcao}>
                            {opcao}
                          </MenuItem>
                        ))}
                      </StyledTextField>
                    </div>
                  </SectionCard>

                  <SectionCard>
                    <SectionHeader>⚔ Configurações da Arte</SectionHeader>
                    <UniformGrid>
                      <StyledTextField name="recarga" label="Recarga" value={values.recarga} onChange={handleChange} size="small" />
                      <StyledTextField name="duracao" label="Duração" value={values.duracao} onChange={handleChange} size="small" />
                      <StyledTextField name="alcance" label="Alcance" value={values.alcance} onChange={handleChange} size="small" />
                      <StyledTextField name="alvos" label="Alvos" value={values.alvos} onChange={handleChange} size="small" />
                      <StyledTextField name="custo" label="Custo" value={values.custo} onChange={handleChange} size="small" />
                      <StyledTextField name="dados" label="Dados" value={values.dados} onChange={handleChange} size="small" />
                    </UniformGrid>
                  </SectionCard>

                  <SectionCard>
                    <SectionHeader>✨ Componentes Mágicos</SectionHeader>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Elementos opcionais que enriquecem a habilidade.</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                      <StyledTextField
                        name="circuloMagico"
                        label="Círculo Mágico (opcional)"
                        value={values.circuloMagico}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.circuloMagico && Boolean(errors.circuloMagico)}
                        helperText={touched.circuloMagico && errors.circuloMagico}
                        size="small"
                        fullWidth
                      />
                      <Autocomplete
                        multiple
                        size="small"
                        options={condicoes}
                        value={condicoes.filter(condicao => (values.condicoesAplicadas ?? []).includes(condicao.id))}
                        getOptionLabel={getNome}
                        isOptionEqualToValue={(opcao, valor) => opcao.id === valor.id}
                        onChange={(_event, novoValor) =>
                          setFieldValue('condicoesAplicadas', novoValor.map(condicao => condicao.id))
                        }
                        renderInput={params => <StyledTextField {...params} label="Condições Aplicadas (opcional)" fullWidth />}
                      />
                    </div>
                    <StyledTextField
                      name="cantico"
                      label="Cântico (opcional)"
                      value={values.cantico}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.cantico && Boolean(errors.cantico)}
                      helperText={touched.cantico && errors.cantico}
                      size="small"
                      multiline
                      minRows={2}
                      fullWidth
                    />
                  </SectionCard>

                  <SectionCard>
                    <SectionHeader>📝 Descrição</SectionHeader>
                    <LargeTextarea
                      name="descricao"
                      label="Descrição"
                      placeholder="Descreva detalhadamente como funciona esta Arte..."
                      value={values.descricao}
                      onChange={handleChange}
                      size="small"
                      multiline
                      minRows={6}
                      fullWidth
                    />
                  </SectionCard>
                </div>
              </DialogContent>
              <ActionsRight>
                <OutlineButton onClick={onClose}>Cancelar</OutlineButton>
                <PrimaryButton type="submit" variant="contained" disabled={isSubmitting || !nucleoId}>
                  Criar
                </PrimaryButton>
              </ActionsRight>
            </form>
          )}
        </Formik>
      )}

      {origem === 'classe' && (
        <>
          <DialogContent style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            {(personagem.classes ?? []).length === 0 && (
              <StatusValueRow>
                Este personagem ainda não tem classes escolhidas (menu lateral Classe).
              </StatusValueRow>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {classesDetalhes.map(classe => (
                <div key={classe.id}>
                  <StatusValueRow style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
                    {getNome(classe)}
                  </StatusValueRow>
                  {[...(classe.habilidadesBasicas ?? []), ...(classe.habilidadesAvancadas ?? [])].length === 0 && (
                    <StatusValueRow>Nenhuma habilidade cadastrada para esta classe.</StatusValueRow>
                  )}
                  <HabilidadesGrid>
                    {(classe.habilidadesBasicas ?? []).map((habilidade, index) =>
                      renderHabilidadeClasseCard(classe, 'basica', index, habilidade),
                    )}
                    {(classe.habilidadesAvancadas ?? []).map((habilidade, index) =>
                      renderHabilidadeClasseCard(classe, 'avancada', index, habilidade),
                    )}
                  </HabilidadesGrid>
                </div>
              ))}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Fechar</Button>
          </DialogActions>
        </>
      )}

      {origem === 'catalogo' && (
        <>
          <DialogContent style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar Art..."
              value={busca}
              onChange={event => setBusca(event.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <CatalogArtsGrid>
              {artesFiltradas.map(item => (
                <ArtCatalogoCard
                  key={item.id}
                  art={{ nome: getNome(item), ...extrairCamposArt(item) }}
                  condicoes={condicoes}
                  disabled={!nucleoId}
                  onEscolher={() => handeEscolherDoCatalogo(item)}
                />
              ))}
            </CatalogArtsGrid>
            {artesFiltradas.length === 0 && (
              <StatusValueRow>
                {personagem.universo ? 'Nenhuma Art encontrada.' : 'Selecione um Universo no menu lateral Info primeiro.'}
              </StatusValueRow>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Fechar</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

CriarArtDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  nucleos: PropTypes.array.isRequired,
  condicoes: PropTypes.array.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default CriarArtDialog;
