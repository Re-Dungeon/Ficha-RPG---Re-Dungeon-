import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Formik } from 'formik';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
// Avatar img will be a plain img inside the card to allow full-height portrait layout

import { getOrigens } from 'service/storage';
import { campoCurtoSchema, descricaoSchema, nomeSchema, urlImagemSchema } from 'common/utils/yupSchemas';
import { getNome } from 'common/utils/resolveNome';
import { useDraftLocalStorage } from 'hooks/useDraftLocalStorage';
import { useRacaClasseNomes } from 'hooks/useRacaClasseNomes';
import DraftBanner from 'components/DraftBanner/DraftBanner';

import { SectionTitle, StatusValueRow } from '../styles';
import UniversoSelect from '../progressao/UniversoSelect';

const PerfilSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(110, 90, 168, 0.2);
  border-radius: 20px;
  padding: 18px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.18);
  display: block;
`;

const PerfilRow = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 320px 1fr;
  align-items: stretch;
  width: 100%;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const AvatarCard = styled.div`
  width: 300px;
  height: 370px;
  max-width: 100%;
  border-radius: 20px;
  padding: 12px;
  background: linear-gradient(180deg, rgba(84, 125, 255, 0.04), rgba(216, 180, 106, 0.04));
  border: 1px solid rgba(216, 180, 106, 0.12);
  box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
`;

const StyledAvatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 18px rgba(0,0,0,0.45) inset;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.16);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.95rem;
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
`;

const AvatarPlaceholderEmoji = styled.span`
  font-size: 2rem;
  line-height: 1;
`;

const AvatarPlaceholderText = styled.span`
  max-width: 85%;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.88rem;
  line-height: 1.4;
`;

const PerfilFields = styled.div`
  display: grid;
  gap: 12px;
  align-content: start;
`;

const FieldGroup = styled.div`
  display: grid;
  gap: 12px;
`;

const RowFields = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
`;

const InputWrapper = styled.div`
  display: grid;
  gap: 10px;
`;

const fieldSx = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  borderRadius: '12px',
  '& .MuiOutlinedInput-root': {
    minHeight: '38px',
    transition: 'all 200ms ease',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(84, 125, 255, 0.18)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#547DFF',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#547DFF',
    boxShadow: '0 0 0 4px rgba(84, 125, 255, 0.12)',
  },
  '& .MuiInputLabel-root': {
    color: '#AAA7C5',
    fontSize: '0.68rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  '& .MuiInputBase-input': {
    padding: '8px 10px',
    fontSize: '0.88rem',
    lineHeight: 1.25,
  },
  '& .MuiOutlinedInput-inputMultiline': {
    padding: '8px 10px',
    fontSize: '0.88rem',
    lineHeight: 1.25,
  },
};

const BackgroundHeader = styled.div`
  display: grid;
  gap: 8px;
  margin: 20px 0 28px;
`;

const BackgroundSubtitle = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  line-height: 1.5;
  opacity: 0.92;
`;

const BackgroundEditorCard = styled.div`
  position: relative;
  background: rgba(31, 15, 51, 0.9);
  border: 1px solid rgba(84, 125, 255, 0.16);
  border-radius: 24px;
  padding: 24px;
  min-height: 220px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.18), 0 2px 12px rgba(0, 0, 0, 0.2);
`;

const BackgroundEditor = styled.div`
  position: relative;
`;

const BackgroundCounter = styled(StatusValueRow)`
  position: absolute;
  bottom: 24px;
  right: 24px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.88rem;
  text-align: right;
  white-space: nowrap;
`;

const GuideSection = styled.div`
  display: grid;
  gap: 20px;
  margin-top: 16px;
`;

const GuideCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

const GuideCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(84, 125, 255, 0.14);
  border-radius: 16px;
  padding: 12px;
  box-shadow: inset 0 0 14px rgba(0, 0, 0, 0.12);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(84, 125, 255, 0.32);
    box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.14);
  }
`;

const GuideCardIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 12px;
  background: rgba(84, 125, 255, 0.18);
  color: #fff;
  font-size: 0.88rem;
  margin-bottom: 8px;
`;

const GuideCardTitle = styled.h3`
  margin: 0 0 4px;
  color: var(--text-primary);
  font-size: 0.9rem;
`;

const GuideCardText = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.84rem;
  line-height: 1.4;
`;

const ShortDescriptionCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(84, 125, 255, 0.14);
  border-radius: 20px;
  padding: 16px;
  box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.12);
  margin-top: 28px;
  display: grid;
  gap: 12px;
`;

const ShortDescriptionTitle = styled.h3`
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
`;

const ShortDescriptionSubtitle = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  line-height: 1.4;
`;

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
  aba,
  personagemNome,
  personagem,
  racaNome,
  classesNomes,
  origens,
  salvarRascunho,
  rascunho,
  onRestaurar,
  onDescartar,
  onSave,
}) => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit: submit, dirty } = formik;

  const [typing, setTyping] = useState(false);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    if (dirty) {
      salvarRascunho(values);
    }
  }, [values, dirty, salvarRascunho]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  return (
    <form id="perfil-form" onSubmit={submit} noValidate>
      {rascunho && <DraftBanner onRestaurar={onRestaurar} onDescartar={onDescartar} />}

      {aba === 'perfil' && (
        <PerfilSection>
          <PerfilRow>
            <LeftColumn>
              <AvatarCard>
                {values.linkImagem ? (
                  <StyledAvatar src={values.linkImagem} alt={personagemNome} />
                ) : (
                  <AvatarPlaceholder>
                    <AvatarPlaceholderEmoji>🖼️</AvatarPlaceholderEmoji>
                    <AvatarPlaceholderText>
                      Nenhuma imagem definida ainda.
                      Insira uma URL para ver o retrato aqui.
                    </AvatarPlaceholderText>
                  </AvatarPlaceholder>
                )}
              </AvatarCard>
            </LeftColumn>

            <PerfilFields>
              <FieldGroup>
                <SectionTitle>Dados de Identidade</SectionTitle>
                <div style={{ width: '100%', marginBottom: 8 }}>
                  <UniversoSelect personagem={personagem} onSave={onSave} />
                </div>
                <RowFields>
                  <TextField
                    name="nome"
                    label="Nome do Personagem"
                    value={values.nome}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.nome && Boolean(errors.nome)}
                    helperText={touched.nome && errors.nome}
                    size="small"
                    fullWidth
                    sx={fieldSx}
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
                    fullWidth
                    sx={fieldSx}
                  />
                </RowFields>
              </FieldGroup>

              <FieldGroup>
                <SectionTitle>Classe e Raça</SectionTitle>
                <RowFields>
                  <TextField
                    label="Raça"
                    value={racaNome || '—'}
                    size="small"
                    disabled
                    fullWidth
                    sx={{
                      ...fieldSx,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.08)',
                      },
                      '& .MuiInputBase-input': {
                        padding: '14px 14px',
                      },
                    }}
                  />
                  <TextField
                    label="Classe"
                    value={classesNomes.length > 0 ? classesNomes.join(' ➠ ') : '—'}
                    size="small"
                    disabled
                    fullWidth
                    sx={{
                      ...fieldSx,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.08)',
                      },
                      '& .MuiInputBase-input': {
                        padding: '14px 14px',
                      },
                    }}
                  />
                </RowFields>
              </FieldGroup>

              <FieldGroup>
                <SectionTitle>Imagem de Exibição</SectionTitle>
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
                  sx={fieldSx}
                />
              </FieldGroup>
            </PerfilFields>
          </PerfilRow>
        </PerfilSection>
      )}

      {aba === 'geral' && (
        <PerfilSection>
          <SectionTitle style={{ marginBottom: 18 }}>Informações Gerais</SectionTitle>
          <FieldGroup>
            <InputWrapper style={{ marginTop: 6 }}>
              <TextField
                name="origem"
                label="Origem"
                select
                value={values.origem}
                onChange={handleChange}
                size="small"
                fullWidth
                sx={fieldSx}
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
            </InputWrapper>
            <InputWrapper>
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
                sx={fieldSx}
              />
            </InputWrapper>
            <InputWrapper>
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
                sx={fieldSx}
              />
            </InputWrapper>
            <InputWrapper>
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
                minRows={2}
                sx={{
                  ...fieldSx,
                  minHeight: 72,
                  '& .MuiOutlinedInput-root': {
                    minHeight: 0,
                  },
                  '& .MuiOutlinedInput-inputMultiline': {
                    padding: '6px 10px',
                    fontSize: '0.9rem',
                  },
                }}
              />
            </InputWrapper>
          </FieldGroup>
        </PerfilSection>
      )}

      {aba === 'background' && (
        <PerfilSection>
          <GuideSection>
            <SectionTitle>Guia de Background</SectionTitle>
            <GuideCardsGrid>
              <GuideCard>
                <GuideCardIcon>📖</GuideCardIcon>
                <GuideCardTitle>Origem</GuideCardTitle>
                <GuideCardText>Quem é esse personagem?</GuideCardText>
              </GuideCard>
              <GuideCard>
                <GuideCardIcon>⚔</GuideCardIcon>
                <GuideCardTitle>Eventos</GuideCardTitle>
                <GuideCardText>Quais acontecimentos marcaram sua vida?</GuideCardText>
              </GuideCard>
              <GuideCard>
                <GuideCardIcon>🧠</GuideCardIcon>
                <GuideCardTitle>Personalidade</GuideCardTitle>
                <GuideCardText>Como ele age?</GuideCardText>
              </GuideCard>
              <GuideCard>
                <GuideCardIcon>🎯</GuideCardIcon>
                <GuideCardTitle>Objetivos</GuideCardTitle>
                <GuideCardText>O que ele busca?</GuideCardText>
              </GuideCard>
            </GuideCardsGrid>
          </GuideSection>

          <ShortDescriptionCard>
            <ShortDescriptionTitle>Descrição curta</ShortDescriptionTitle>
            <ShortDescriptionSubtitle>
              Esse resumo poderá ser utilizado em listas e visualizações rápidas.
            </ShortDescriptionSubtitle>
            <TextField
              name="descricao"
              value={values.descricao}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.descricao && Boolean(errors.descricao)}
              helperText={touched.descricao && errors.descricao}
              fullWidth
              multiline
              minRows={2}
              size="small"
              placeholder="Ex:\nUm cavaleiro exilado que busca recuperar sua honra."
              sx={{
                ...fieldSx,
                minHeight: 72,
                '& .MuiOutlinedInput-root': {
                  minHeight: 0,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: '18px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(84, 125, 255, 0.18)',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  boxShadow: '0 0 0 8px rgba(84, 125, 255, 0.12)',
                },
                '& .MuiOutlinedInput-inputMultiline': {
                  padding: '6px 10px',
                },
              }}
            />
          </ShortDescriptionCard>

          <BackgroundHeader>
            <SectionTitle>Background</SectionTitle>
            <BackgroundSubtitle>
              Conte a origem, história, personalidade e acontecimentos importantes do personagem.
            </BackgroundSubtitle>
          </BackgroundHeader>

          <BackgroundEditorCard>
            <BackgroundEditor>
              {!typing && (
                <BackgroundCounter>
                  {((values.background ?? '').length || 0).toLocaleString('pt-BR')} / 5.000 caracteres
                </BackgroundCounter>
              )}
              <TextField
                name="background"
                value={values.background}
                onChange={e => {
                  handleChange(e);
                  setTyping(true);
                  if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
                  typingTimerRef.current = setTimeout(() => setTyping(false), 800);
                }}
                onBlur={e => {
                  handleBlur(e);
                  setTyping(false);
                  if (typingTimerRef.current) {
                    clearTimeout(typingTimerRef.current);
                    typingTimerRef.current = null;
                  }
                }}
                error={touched.background && Boolean(errors.background)}
                helperText={touched.background && errors.background}
                fullWidth
                multiline
                minRows={4}
                size="small"
                placeholder={`Escreva aqui toda a história do personagem...

• Origem
• Família
• Eventos importantes
• Personalidade
• Objetivos
• Traumas
• Relações`}
                sx={{
                  ...fieldSx,
                  minHeight: 200,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: '18px',
                    minHeight: 200,
                    alignItems: 'flex-start',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(84, 125, 255, 0.22)',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    boxShadow: '0 0 0 10px rgba(84, 125, 255, 0.14)',
                  },
                  '& .MuiOutlinedInput-inputMultiline': {
                    padding: '12px 14px',
                    paddingBottom: '44px',
                    paddingRight: '14px',
                    minHeight: 140,
                    lineHeight: '1.4',
                    boxSizing: 'border-box',
                  },
                }}
              />
            </BackgroundEditor>
          </BackgroundEditorCard>
        </PerfilSection>
      )}
    </form>
  );
};

PerfilFormBody.propTypes = {
  formik: PropTypes.object.isRequired,
  aba: PropTypes.oneOf(['perfil', 'geral', 'background']).isRequired,
  personagemNome: PropTypes.string,
  personagem: PropTypes.object.isRequired,
  racaNome: PropTypes.string.isRequired,
  classesNomes: PropTypes.array.isRequired,
  origens: PropTypes.array.isRequired,
  salvarRascunho: PropTypes.func.isRequired,
  rascunho: PropTypes.object,
  onRestaurar: PropTypes.func.isRequired,
  onDescartar: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

PerfilFormBody.defaultProps = {
  personagemNome: '',
  rascunho: null,
};

const PerfilTab = ({ personagem, onSave, aba }) => {
  const [origens, setOrigens] = useState([]);
  const { racaNome, classesNomes } = useRacaClasseNomes(personagem);

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
    getOrigens()
      .then(setOrigens)
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar origens:', erro);
      });
  }, []);

  const handleSubmit = useCallback(
    async (values, { setSubmitting }) => {
      const { nome, titulo, origem, afiliacao, statusNarrativo, notasAdicionais, background, ...resto } = values;
      try {
        await onSave({
          ...resto,
          nome,
          origem,
          jogadorInfo: { titulo, afiliacao, statusNarrativo, notasAdicionais, background },
        });
        limparRascunho();
        setRascunhoDisponivel(null);
      } catch {
        // Erro já registrado e exibido pelo SnackBar de SavingContext.executar
        // (onSave aqui é o handleSalvarPerfil de InfoModal, que já passa por executar).
      } finally {
        setSubmitting(false);
      }
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
          aba={aba}
          personagem={personagem}
          personagemNome={personagem.nome}
          racaNome={racaNome}
          classesNomes={classesNomes}
          origens={origens}
          salvarRascunho={salvarRascunho}
          rascunho={rascunhoDisponivel}
          onSave={onSave}
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
  aba: PropTypes.oneOf(['perfil', 'geral', 'background']).isRequired,
};

export default PerfilTab;
