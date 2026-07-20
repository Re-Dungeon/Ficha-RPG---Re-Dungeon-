import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';

import { getFirestoreItem, getOrigens } from 'service/storage';
import { campoCurtoSchema, descricaoSchema, nomeSchema, urlImagemSchema } from 'common/utils/yupSchemas';
import { getNome } from 'common/utils/resolveNome';
import { useDraftLocalStorage } from 'hooks/useDraftLocalStorage';
import DraftBanner from 'components/DraftBanner/DraftBanner';

import { SectionTitle, StatusValueRow } from '../styles';

const perfilSchema = yup.object({
  nome: nomeSchema,
  titulo: campoCurtoSchema,
  origem: yup.string(),
  afiliacao: campoCurtoSchema,
  statusNarrativo: campoCurtoSchema,
  notasAdicionais: descricaoSchema,
  background: descricaoSchema,
  linkImagem: urlImagemSchema,
  descricao: descricaoSchema,
});

// Componente próprio (não uma função inline dentro do children do Formik) só
// para poder chamar useEffect com segurança — hooks dentro do render-prop do
// Formik não são um componente reconhecido pelo React/eslint-plugin-react-hooks.
const PerfilFormBody = ({
  formik,
  personagemNome,
  racaNome,
  classesNomes,
  origens,
  salvarRascunho,
  rascunho,
  onRestaurar,
  onDescartar,
}) => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit: submit, dirty } = formik;

  useEffect(() => {
    if (dirty) {
      salvarRascunho(values);
    }
  }, [values, dirty, salvarRascunho]);

  return (
    <form id="perfil-form" onSubmit={submit} noValidate>
      {rascunho && <DraftBanner onRestaurar={onRestaurar} onDescartar={onDescartar} />}

      <SectionTitle>Perfil</SectionTitle>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 16 }}>
        <Avatar
          src={values.linkImagem || undefined}
          alt={personagemNome}
          sx={{ width: 120, height: 120, border: '1px solid var(--border-primary)' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <TextField
              name="nome"
              label="Nome do Personagem"
              value={values.nome}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.nome && Boolean(errors.nome)}
              helperText={touched.nome && errors.nome}
              size="small"
              sx={{ flex: 1, minWidth: 180 }}
            />
            <TextField
              name="titulo"
              label="Título"
              value={values.titulo}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.titulo && Boolean(errors.titulo)}
              helperText={touched.titulo && errors.titulo}
              size="small"
              sx={{ flex: 1, minWidth: 180 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <TextField label="Raça" value={racaNome || '—'} size="small" disabled sx={{ flex: 1, minWidth: 160 }} />
            <TextField
              label="Classe"
              value={classesNomes.length > 0 ? classesNomes.join(' ➠ ') : '—'}
              size="small"
              disabled
              sx={{ flex: 1, minWidth: 160 }}
            />
          </div>

          <TextField
            name="linkImagem"
            label="URL da imagem"
            placeholder="https://..."
            value={values.linkImagem}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.linkImagem && Boolean(errors.linkImagem)}
            helperText={touched.linkImagem && errors.linkImagem}
            fullWidth
            size="small"
          />
        </div>
      </div>

      <SectionTitle style={{ marginTop: 32 }}>Informações Gerais</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16, maxWidth: 600 }}>
        <TextField
          name="origem"
          label="Origem"
          select
          value={values.origem}
          onChange={handleChange}
          size="small"
          fullWidth
        >
          <MenuItem value="">
            <em>Nenhuma</em>
          </MenuItem>
          {origens.map(item => (
            <MenuItem key={item.id} value={item.id}>
              {getNome(item)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          name="afiliacao"
          label="Afiliação"
          value={values.afiliacao}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.afiliacao && Boolean(errors.afiliacao)}
          helperText={touched.afiliacao && errors.afiliacao}
          size="small"
          fullWidth
        />
        <TextField
          name="statusNarrativo"
          label="Status Narrativo"
          value={values.statusNarrativo}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.statusNarrativo && Boolean(errors.statusNarrativo)}
          helperText={touched.statusNarrativo && errors.statusNarrativo}
          size="small"
          fullWidth
        />
        <TextField
          name="notasAdicionais"
          label="Notas Adicionais"
          value={values.notasAdicionais}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.notasAdicionais && Boolean(errors.notasAdicionais)}
          helperText={touched.notasAdicionais && errors.notasAdicionais}
          size="small"
          fullWidth
          multiline
          minRows={3}
        />
      </div>

      <SectionTitle style={{ marginTop: 32 }}>Background</SectionTitle>
      <StatusValueRow style={{ display: 'block', marginTop: 4 }}>
        Até 5000 caracteres. ({(values.background ?? '').length}/5000)
      </StatusValueRow>
      <TextField
        name="background"
        value={values.background}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.background && Boolean(errors.background)}
        helperText={touched.background && errors.background}
        fullWidth
        multiline
        minRows={8}
        size="small"
        sx={{ marginTop: 8, maxWidth: 600 }}
      />

      <SectionTitle style={{ marginTop: 32 }}>Descrição (história / aparência curta)</SectionTitle>
      <TextField
        name="descricao"
        value={values.descricao}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.descricao && Boolean(errors.descricao)}
        helperText={touched.descricao && errors.descricao}
        fullWidth
        multiline
        minRows={4}
        size="small"
        sx={{ marginTop: 8, maxWidth: 600 }}
      />
    </form>
  );
};

PerfilFormBody.propTypes = {
  formik: PropTypes.object.isRequired,
  personagemNome: PropTypes.string,
  racaNome: PropTypes.string.isRequired,
  classesNomes: PropTypes.array.isRequired,
  origens: PropTypes.array.isRequired,
  salvarRascunho: PropTypes.func.isRequired,
  rascunho: PropTypes.object,
  onRestaurar: PropTypes.func.isRequired,
  onDescartar: PropTypes.func.isRequired,
};

PerfilFormBody.defaultProps = {
  personagemNome: '',
  rascunho: null,
};

const PerfilTab = ({ personagem, onSave }) => {
  const [origens, setOrigens] = useState([]);
  const [racaNome, setRacaNome] = useState('');
  const [classesNomes, setClassesNomes] = useState([]);

  const chaveRascunho = `rascunho_personagem_${personagem.id}_perfil`;
  const { lerRascunho, salvarRascunho, limparRascunho } = useDraftLocalStorage(chaveRascunho);
  const [rascunhoDisponivel, setRascunhoDisponivel] = useState(null);
  const atualizadoEmRef = useRef(personagem.updatedAt);

  useEffect(() => {
    const draft = lerRascunho();
    const atualizadoEm = atualizadoEmRef.current?.toMillis ? atualizadoEmRef.current.toMillis() : 0;
    if (draft && draft.salvoEm > atualizadoEm) {
      setRascunhoDisponivel(draft);
    }
  }, [lerRascunho]);

  useEffect(() => {
    getOrigens().then(setOrigens);
  }, []);

  useEffect(() => {
    if (personagem.raca) {
      getFirestoreItem('racas', personagem.raca).then(item => setRacaNome(getNome(item)));
    } else {
      setRacaNome('');
    }
  }, [personagem.raca]);

  useEffect(() => {
    Promise.all((personagem.classes ?? []).map(id => getFirestoreItem('classes', id))).then(itens =>
      setClassesNomes(itens.filter(Boolean).map(getNome)),
    );
  }, [personagem.classes]);

  const handleSubmit = useCallback(
    async (values, { setSubmitting }) => {
      const { nome, titulo, origem, afiliacao, statusNarrativo, notasAdicionais, background, ...resto } = values;
      await onSave({
        ...resto,
        nome,
        origem,
        jogadorInfo: { titulo, afiliacao, statusNarrativo, notasAdicionais, background },
      });
      limparRascunho();
      setRascunhoDisponivel(null);
      setSubmitting(false);
    },
    [onSave, limparRascunho],
  );

  return (
    <Formik
      initialValues={{
        nome: personagem.nome ?? '',
        titulo: personagem.jogadorInfo?.titulo ?? '',
        origem: personagem.origem ?? '',
        afiliacao: personagem.jogadorInfo?.afiliacao ?? '',
        statusNarrativo: personagem.jogadorInfo?.statusNarrativo ?? '',
        notasAdicionais: personagem.jogadorInfo?.notasAdicionais ?? '',
        background: personagem.jogadorInfo?.background ?? '',
        linkImagem: personagem.linkImagem ?? '',
        descricao: personagem.descricao ?? '',
      }}
      validationSchema={perfilSchema}
      onSubmit={handleSubmit}
    >
      {formik => (
        <PerfilFormBody
          formik={formik}
          personagemNome={personagem.nome}
          racaNome={racaNome}
          classesNomes={classesNomes}
          origens={origens}
          salvarRascunho={salvarRascunho}
          rascunho={rascunhoDisponivel}
          onRestaurar={() => {
            formik.setValues(rascunhoDisponivel.valores);
            setRascunhoDisponivel(null);
          }}
          onDescartar={() => {
            limparRascunho();
            setRascunhoDisponivel(null);
          }}
        />
      )}
    </Formik>
  );
};

PerfilTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default PerfilTab;
