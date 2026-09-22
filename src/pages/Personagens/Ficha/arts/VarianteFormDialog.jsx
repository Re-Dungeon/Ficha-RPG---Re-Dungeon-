import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as yup from 'yup';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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
import styled, { keyframes } from 'styled-components';

import { campoCurtoSchema, descricaoSchema, nomeSchema, urlImagemSchema } from 'common/utils/yupSchemas';
import { dominioVarianteValido } from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';
import { getArtesPorUniverso, getFirestoreItem } from 'service/storage';

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
import { DOMINIO_LABELS, TIPO_ACAO_OPTIONS, TIPO_ART_OPTIONS, VARIANTE_INICIAL } from './constants';
import { CatalogArtsGrid } from './styles';
import { StatusValueRow } from '../styles';

const varianteSchema = yup.object({
  nome: nomeSchema,
  artId: yup.string().required('Selecione a Art base'),
  tipo: yup.string().required(),
  tipoAcao: yup.string().required(),
  dominio: yup.number().min(1).max(5).required(),
  recarga: campoCurtoSchema,
  duracao: campoCurtoSchema,
  alcance: campoCurtoSchema,
  alvos: campoCurtoSchema,
  custo: campoCurtoSchema,
  dados: campoCurtoSchema,
  imagem: urlImagemSchema,
  circuloMagico: campoCurtoSchema,
  cantico: descricaoSchema,
  descricao: descricaoSchema,
});

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
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(108,99,255,0.12), rgba(232,195,106,0.06));
  color: var(--color-accent);
  box-shadow: 0 8px 20px rgba(16,14,28,0.4);
`;

const HeaderTitle = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleMain = styled.div`
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text-primary);
`;

const TitleSub = styled.div`
  font-size: 0.82rem;
  color: var(--text-secondary);
`;


const extrairCamposVariante = item => {
  const campos = {};
  ['dominio', 'custo', 'dados', 'recarga', 'duracao', 'alcance', 'alvos', 'descricao', 'imagem', 'cantico', 'circuloMagico']
    .forEach(campo => {
      if (item[campo] !== undefined) campos[campo] = item[campo];
    });
  if (item.acao !== undefined) campos.tipoAcao = item.acao;
  if (item.classificacao !== undefined) campos.tipo = item.classificacao;
  if (Array.isArray(item.condicoesAplicadas)) {
    campos.condicoesAplicadas = item.condicoesAplicadas.map(condicao => condicao.id ?? condicao).filter(Boolean);
  }
  if (!campos.imagem && item.linkImagem) campos.imagem = item.linkImagem;
  return campos;
};

const VarianteFormBody = ({ formik, arts, condicoes, onClose }) => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue } = formik;

  const artBase = arts.find(art => art.id === values.artId);
  const dominioBase = artBase?.dominio ?? 1;
  const dominioOptions = useMemo(
    () => [1, 2, 3, 4, 5].filter(nivel => dominioVarianteValido(nivel, dominioBase)),
    [dominioBase],
  );

  useEffect(() => {
    if (!artBase) {
      setFieldValue('dominio', '');
      return;
    }
    if (dominioOptions.length > 0 && !dominioOptions.includes(values.dominio)) {
      setFieldValue('dominio', dominioOptions[0]);
    }
  }, [artBase, dominioOptions, values.dominio, setFieldValue]);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextField
          name="artId"
          label="Art base"
          select
          value={values.artId}
          onChange={handleChange}
          error={touched.artId && Boolean(errors.artId)}
          helperText={touched.artId && errors.artId}
          size="small"
          fullWidth
        >
          {arts.map(art => (
            <MenuItem key={art.id} value={art.id}>
              {art.nome}
            </MenuItem>
          ))}
        </TextField>

        {values.artId && dominioOptions.length === 0 && (
          <StatusValueRow style={{ display: 'block', color: '#ef4444' }}>
            ⚠️ Essa Art tem domínio {dominioBase} — não há domínio menor disponível pra uma variante.
          </StatusValueRow>
        )}

        <TextField
          name="nome"
          label="Nome"
          value={values.nome}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.nome && Boolean(errors.nome)}
          helperText={touched.nome && errors.nome}
          size="small"
          fullWidth
        />
        <TextField
          name="imagem"
          label="URL da imagem (opcional)"
          value={values.imagem}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.imagem && Boolean(errors.imagem)}
          helperText={touched.imagem && errors.imagem}
          size="small"
          fullWidth
        />
        <div style={{ display: 'flex', gap: 16 }}>
          <TextField name="tipo" label="Tipo" select value={values.tipo} onChange={handleChange} size="small" fullWidth>
            {TIPO_ART_OPTIONS.map(opcao => (
              <MenuItem key={opcao} value={opcao}>
                {opcao}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            name="dominio"
            label="Domínio"
            select
            value={artBase ? values.dominio : ''}
            onChange={handleChange}
            size="small"
            fullWidth
            disabled={!artBase || dominioOptions.length === 0}
          >
            {dominioOptions.map(nivel => (
              <MenuItem key={nivel} value={nivel}>
                {nivel} — {DOMINIO_LABELS[nivel]}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <TextField
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
        </TextField>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <TextField name="recarga" label="Recarga" value={values.recarga} onChange={handleChange} size="small" sx={{ flex: 1, minWidth: 120 }} />
          <TextField name="duracao" label="Duração" value={values.duracao} onChange={handleChange} size="small" sx={{ flex: 1, minWidth: 120 }} />
          <TextField name="alcance" label="Alcance" value={values.alcance} onChange={handleChange} size="small" sx={{ flex: 1, minWidth: 120 }} />
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <TextField name="alvos" label="Alvos" value={values.alvos} onChange={handleChange} size="small" sx={{ flex: 1, minWidth: 120 }} />
          <TextField name="custo" label="Custo" value={values.custo} onChange={handleChange} size="small" sx={{ flex: 1, minWidth: 120 }} />
          <TextField name="dados" label="Dados" value={values.dados} onChange={handleChange} size="small" sx={{ flex: 1, minWidth: 120 }} />
        </div>
        <TextField
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
          renderInput={params => <TextField {...params} label="Condições Aplicadas (opcional)" />}
        />
        <TextField
          name="cantico"
          label="Cântico (opcional)"
          value={values.cantico}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.cantico && Boolean(errors.cantico)}
          helperText={touched.cantico && errors.cantico}
          size="small"
          fullWidth
          multiline
          minRows={2}
        />
        <TextField
          name="descricao"
          label="Descrição"
          value={values.descricao}
          onChange={handleChange}
          size="small"
          fullWidth
          multiline
          minRows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={isSubmitting || dominioOptions.length === 0}>
          Confirmar
        </Button>
      </DialogActions>
    </form>
  );
};

VarianteFormBody.propTypes = {
  formik: PropTypes.object.isRequired,
  arts: PropTypes.array.isRequired,
  condicoes: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};

const VarianteFormDialog = ({ open, onClose, variante, arts, condicoes, onSubmit, personagem }) => {
  const [initialValues, setInitialValues] = useState(VARIANTE_INICIAL);
  const [origem, setOrigem] = useState('autoral');
  const [classesDetalhes, setClassesDetalhes] = useState([]);
  const [catalogoArtes, setCatalogoArtes] = useState([]);
  const [busca, setBusca] = useState('');
  const [artIdSelecionado, setArtIdSelecionado] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }
    const proximoArtId = variante ? variante.artId : arts[0]?.id ?? '';
    const base = arts.find(art => art.id === proximoArtId);
    const dominioPadrao = base ? ([1, 2, 3, 4, 5].find(nivel => dominioVarianteValido(nivel, base.dominio ?? 1)) ?? '') : '';
    const inicial = variante
      ? { ...VARIANTE_INICIAL, ...variante }
      : { ...VARIANTE_INICIAL, artId: proximoArtId, dominio: dominioPadrao };
    setInitialValues(inicial);
    setArtIdSelecionado(proximoArtId);
    setOrigem('autoral');
    setBusca('');
  }, [open, variante, arts]);

  useEffect(() => {
    if (!open || origem !== 'classe') {
      return;
    }
    Promise.all((personagem.classes ?? []).map(id => getFirestoreItem('classes', id)))
      .then(itens => setClassesDetalhes(itens.filter(Boolean)))
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar classes para a variante:', erro);
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
        console.error('Falha ao carregar catálogo de variantes:', erro);
      });
  }, [open, origem, personagem.universo]);

  const handleSelecionarArtBase = useCallback(event => {
    setArtIdSelecionado(event.target.value);
  }, []);

  const handleEscolherHabilidadeClasse = useCallback(
    (_classe, _tipoLista, _index, habilidade) => {
      if (!artIdSelecionado) {
        return;
      }
      const base = arts.find(art => art.id === artIdSelecionado);
      const dominioBase = base?.dominio ?? 1;
      const dominioDisponivel = [1, 2, 3, 4, 5].find(nivel => dominioVarianteValido(nivel, dominioBase));
      const payload = {
        artId: artIdSelecionado,
        nome: habilidade.nome,
        tipo: habilidade.classificacao ?? base?.tipo ?? TIPO_ART_OPTIONS[0],
        tipoAcao: habilidade.acao ?? TIPO_ACAO_OPTIONS[0],
        dominio: dominioDisponivel ?? Math.max(1, dominioBase - 1),
        recarga: habilidade.recarga ?? '',
        duracao: habilidade.duracao ?? '',
        alcance: habilidade.alcance ?? '',
        alvos: habilidade.alvo ?? '',
        custo: habilidade.custo ?? '',
        dados: habilidade.dados ?? '',
        imagem: '',
        cantico: '',
        circuloMagico: '',
        condicoesAplicadas: [],
        descricao: habilidade.descricao ?? '',
      };
      onSubmit(payload);
      onClose();
    },
    [artIdSelecionado, arts, onClose, onSubmit],
  );

  const handleEscolherDoCatalogo = useCallback(
    item => {
      if (!artIdSelecionado) {
        return;
      }
      const base = arts.find(art => art.id === artIdSelecionado);
      const dominioBase = base?.dominio ?? 1;
      const dominioDisponivel = [1, 2, 3, 4, 5].find(nivel => dominioVarianteValido(nivel, dominioBase));
      const payload = {
        artId: artIdSelecionado,
        nome: getNome(item),
        tipo: item.classificacao ?? base?.tipo ?? TIPO_ART_OPTIONS[0],
        tipoAcao: item.acao ?? TIPO_ACAO_OPTIONS[0],
        dominio: dominioDisponivel ?? Math.max(1, dominioBase - 1),
        ...extrairCamposVariante(item),
      };
      onSubmit(payload);
      onClose();
    },
    [artIdSelecionado, arts, onClose, onSubmit],
  );

  const artesFiltradas = catalogoArtes.filter(item => getNome(item).toLowerCase().includes(busca.toLowerCase()));

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
      <Button size="small" variant="contained" disabled={!artIdSelecionado} onClick={() => handleEscolherHabilidadeClasse(classe, tipoLista, index, habilidade)}>
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
            <TitleMain>{variante ? 'Editar Variante' : 'Criar Nova Variante'}</TitleMain>
            <TitleSub>Escolha a origem da variação e personalize a técnica.</TitleSub>
          </HeaderTitle>
        </HeaderLeft>
        <div style={{ minWidth: 260 }}>
          <TextField
            label="Art base *"
            select
            value={artIdSelecionado}
            onChange={handleSelecionarArtBase}
            size="small"
            fullWidth
          >
            {arts.map(art => (
              <MenuItem key={art.id} value={art.id}>
                {art.nome}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </DialogHeader>

      <Tabs
        value={origem}
        onChange={(_event, novaOrigem) => setOrigem(novaOrigem)}
        variant="fullWidth"
        textColor="inherit"
        sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 700 }, '& .MuiTabs-indicator': { height: 4, borderRadius: 6, background: 'linear-gradient(90deg, rgba(108,99,255,0.9), rgba(232,195,106,0.9))' } }}
      >
        <Tab value="autoral" label="Variante Autoral" />
        <Tab value="classe" label="Habilidade de Classe" />
        <Tab value="catalogo" label="Catálogo" />
      </Tabs>

      {origem === 'autoral' && (
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={varianteSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await onSubmit(values);
            setSubmitting(false);
            onClose();
          }}
        >
          {formik => <VarianteFormBody formik={formik} arts={arts} condicoes={condicoes} onClose={onClose} />}
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
              placeholder="Buscar Variante/Arte..."
              value={busca}
              onChange={event => setBusca(event.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <CatalogArtsGrid>
              {artesFiltradas.map(item => (
                <HabilidadeCard key={item.id} $clicavel>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', fontSize: 24 }}>
                      {item.imagem || item.linkImagem ? <img src={item.imagem || item.linkImagem} alt={getNome(item)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} /> : '🎴'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <HabilidadeHeader style={{ alignItems: 'flex-start' }}>
                        <HabilidadeNome style={{ flex: 1, minWidth: 0 }}>
                          <AutoAwesomeIcon fontSize="inherit" />
                          <span>{getNome(item)}</span>
                        </HabilidadeNome>
                        {item.acao && <AcaoBadge>{item.acao}</AcaoBadge>}
                      </HabilidadeHeader>
                      {item.descricao && <HabilidadeDescricao>{item.descricao}</HabilidadeDescricao>}
                    </div>
                  </div>
                  <HabilidadeChipsGrid>
                    {item.alcance && <HabilidadeChip><PlaceIcon fontSize="inherit" /><span>{item.alcance}</span></HabilidadeChip>}
                    {item.alvos && <HabilidadeChip><GpsFixedIcon fontSize="inherit" /><span>{item.alvos}</span></HabilidadeChip>}
                    {item.custo && <HabilidadeChip><BoltIcon fontSize="inherit" /><span>{item.custo}</span></HabilidadeChip>}
                    {item.recarga && <HabilidadeChip><UpdateIcon fontSize="inherit" /><span>{item.recarga}</span></HabilidadeChip>}
                    {item.dados && <HabilidadeChip><CasinoIcon fontSize="inherit" /><span>{item.dados}</span></HabilidadeChip>}
                    {item.duracao && <HabilidadeChip><TimerIcon fontSize="inherit" /><span>{item.duracao}</span></HabilidadeChip>}
                  </HabilidadeChipsGrid>
                  <Button size="small" variant="contained" fullWidth disabled={!artIdSelecionado} onClick={() => handleEscolherDoCatalogo(item)}>
                    Escolher
                  </Button>
                </HabilidadeCard>
              ))}
            </CatalogArtsGrid>
            {artesFiltradas.length === 0 && (
              <StatusValueRow>
                {personagem.universo ? 'Nenhuma arte encontrada.' : 'Selecione um Universo no menu lateral Info primeiro.'}
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

VarianteFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  variante: PropTypes.object,
  arts: PropTypes.array.isRequired,
  condicoes: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
};

VarianteFormDialog.defaultProps = {
  variante: null,
};

export default VarianteFormDialog;
