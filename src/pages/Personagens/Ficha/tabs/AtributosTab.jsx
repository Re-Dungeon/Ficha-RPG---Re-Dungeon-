import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';

import {
  calcularBonusCultivoTotal,
  calcularPowerCombat,
  calcularPrimariosTotais,
  calcularSecundarios,
  calcularStatusMaximos,
} from 'common/utils/formulas';
import { useDraftLocalStorage } from 'hooks/useDraftLocalStorage';
import { useRacaClasseNomes } from 'hooks/useRacaClasseNomes';
import { useSaving } from 'context/SavingContext';
import DraftBanner from 'components/DraftBanner/DraftBanner';

import AtributoEstrela from '../AtributoEstrela';
import PersonagemHeroCard from '../PersonagemHeroCard';
import StatusCard from '../StatusCard';
import {
  PRIMARIOS_LABELS,
  SECUNDARIOS_LABELS,
  STATUS_LABELS,
  buildInitialValues,
} from '../constants';
import { HeroRow, StatusPainelWrapper, StatusParRow } from '../styles';

const [[STATUS_PRINCIPAL_CHAVE, STATUS_PRINCIPAL_LABEL], ...STATUS_SECUNDARIOS] =
  Object.entries(STATUS_LABELS);

// Componente próprio (não uma função inline dentro do children do Formik) só
// para poder chamar useEffect com segurança — hooks dentro do render-prop do
// Formik não são um componente reconhecido pelo React/eslint-plugin-react-hooks.
const AtributosFormBody = ({
  personagem,
  formik,
  salvarRascunho,
  rascunho,
  onRestaurar,
  onDescartar,
  onExcluir,
  racaNome,
  racaLinkImagem,
  classesNomes,
  onSave,
  onPersonagemSincronizado,
}) => {
  const { values, handleSubmit: submit, isSubmitting, dirty, resetForm } = formik;

  useEffect(() => {
    if (dirty) {
      salvarRascunho(values);
    }
  }, [values, dirty, salvarRascunho]);

  // A ficha chega ao vivo (Ficha.jsx). Sem edição pendente, o formulário
  // acompanha o documento; com edição pendente, nada é apagado — ao salvar, o
  // que o jogador não mexeu mantém o valor mais novo (mescla em três vias).
  useEffect(() => {
    if (dirty || isSubmitting) return;
    if (onPersonagemSincronizado(personagem)) {
      resetForm({ values: buildInitialValues(personagem) });
    }
  }, [personagem, dirty, isSubmitting, resetForm, onPersonagemSincronizado]);

  const bonusCultivoTotal = calcularBonusCultivoTotal(personagem.cultivoBonus ?? {});
  const primariosTotais = calcularPrimariosTotais(
    values.atributosBase,
    values.atributosExtra,
    values.atributosBonus,
    bonusCultivoTotal.primarios,
  );
  const secundariosTotais = calcularSecundarios(
    primariosTotais,
    values.secundariosBase,
    values.secundariosExtra,
    values.secundariosBonus,
    bonusCultivoTotal.secundarios,
  );
  const statusMaximos = calcularStatusMaximos(primariosTotais, values.status, bonusCultivoTotal.status);
  const powerCombat = calcularPowerCombat(primariosTotais, secundariosTotais);
  const pontosPrimarios = Object.values(primariosTotais).reduce(
    (total, valor) => total + valor,
    0,
  );

  return (
    <form onSubmit={submit}>
      {rascunho && <DraftBanner onRestaurar={onRestaurar} onDescartar={onDescartar} />}

      <HeroRow>
        <AtributoEstrela
          labels={PRIMARIOS_LABELS}
          totais={primariosTotais}
          baseTipo="atributosBase"
          extraTipo="atributosExtra"
          bonusTipo="atributosBonus"
          centroLabel="Pontos"
          centroValor={pontosPrimarios}
          bonusCultivo={bonusCultivoTotal.primarios}
          personagem={personagem}
          onSave={onSave}
        />

        <PersonagemHeroCard
          personagem={personagem}
          racaNome={racaNome}
          racaLinkImagem={racaLinkImagem}
          classesNomes={classesNomes}
          onExcluir={onExcluir}
          salvando={isSubmitting}
        />

        <AtributoEstrela
          labels={SECUNDARIOS_LABELS}
          totais={secundariosTotais}
          baseTipo="secundariosBase"
          extraTipo="secundariosExtra"
          bonusTipo="secundariosBonus"
          centroLabel="Power Combat"
          centroValor={powerCombat}
          bonusCultivo={bonusCultivoTotal.secundarios}
          personagem={personagem}
          onSave={onSave}
        />
      </HeroRow>

      <StatusPainelWrapper style={{ marginTop: '24px' }}>
        <StatusCard
          grande
          label={STATUS_PRINCIPAL_LABEL}
          variante={STATUS_PRINCIPAL_CHAVE}
          maximo={statusMaximos[STATUS_PRINCIPAL_CHAVE]}
          atual={values.status[STATUS_PRINCIPAL_CHAVE]?.atual ?? 0}
          atualName={`status.${STATUS_PRINCIPAL_CHAVE}.atual`}
          baseName={`status.${STATUS_PRINCIPAL_CHAVE}.base`}
          extraName={`status.${STATUS_PRINCIPAL_CHAVE}.extra`}
          bonusName={`status.${STATUS_PRINCIPAL_CHAVE}.bonus`}
          bonusCultivo={bonusCultivoTotal.status[STATUS_PRINCIPAL_CHAVE] ?? 0}
        />

        <StatusParRow>
          {STATUS_SECUNDARIOS.map(([chave, label]) => (
            <StatusCard
              key={chave}
              label={label}
              variante={chave}
              maximo={statusMaximos[chave]}
              atual={values.status[chave]?.atual ?? 0}
              atualName={`status.${chave}.atual`}
              baseName={`status.${chave}.base`}
              extraName={`status.${chave}.extra`}
              bonusName={`status.${chave}.bonus`}
              bonusCultivo={bonusCultivoTotal.status[chave] ?? 0}
            />
          ))}
        </StatusParRow>
      </StatusPainelWrapper>
    </form>
  );
};

AtributosFormBody.propTypes = {
  personagem: PropTypes.object.isRequired,
  formik: PropTypes.object.isRequired,
  salvarRascunho: PropTypes.func.isRequired,
  rascunho: PropTypes.object,
  onRestaurar: PropTypes.func.isRequired,
  onDescartar: PropTypes.func.isRequired,
  onExcluir: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onPersonagemSincronizado: PropTypes.func.isRequired,
  racaNome: PropTypes.string.isRequired,
  racaLinkImagem: PropTypes.string,
  classesNomes: PropTypes.array.isRequired,
};

AtributosFormBody.defaultProps = {
  rascunho: null,
};

const AtributosTab = ({ personagem, onSave, onExcluir }) => {
  const chaveRascunho = `rascunho_personagem_${personagem.id}_atributos`;
  const { lerRascunho, salvarRascunho, limparRascunho } =
    useDraftLocalStorage(chaveRascunho);
  const { racaNome, racaLinkImagem, classesNomes } = useRacaClasseNomes(personagem);
  const { executar } = useSaving();
  const [rascunhoDisponivel, setRascunhoDisponivel] = useState(null);
  const atualizadoEmRef = useRef(personagem.updatedAt);
  // Personagem de onde vieram os valores do formulário: é a `base` da mescla
  // em três vias ao salvar.
  const baseRef = useRef(personagem);
  const [valoresIniciais] = useState(() => buildInitialValues(personagem));

  // true = o formulário deve ser reiniciado com este personagem (mudou).
  const sincronizarBase = useCallback(proximo => {
    if (proximo === baseRef.current) return false;
    baseRef.current = proximo;
    return true;
  }, []);

  useEffect(() => {
    const draft = lerRascunho();
    const atualizadoEm = atualizadoEmRef.current?.toMillis
      ? atualizadoEmRef.current.toMillis()
      : 0;
    if (draft && draft.salvoEm > atualizadoEm) {
      setRascunhoDisponivel(draft);
    }
  }, [lerRascunho]);

  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      try {
        const bonusCultivoTotal = calcularBonusCultivoTotal(personagem.cultivoBonus ?? {});
        const primariosTotais = calcularPrimariosTotais(
          values.atributosBase,
          values.atributosExtra,
          values.atributosBonus,
          bonusCultivoTotal.primarios,
        );
        const secundariosTotais = calcularSecundarios(
          primariosTotais,
          values.secundariosBase,
          values.secundariosExtra,
          values.secundariosBonus,
          bonusCultivoTotal.secundarios,
        );
        const payload = {
          ...values,
          atributosTotais: primariosTotais,
          secundariosTotais,
          statusMaximos: calcularStatusMaximos(primariosTotais, values.status, bonusCultivoTotal.status),
          powerCombat: calcularPowerCombat(primariosTotais, secundariosTotais),
        };
        await executar(() => onSave(payload, { base: baseRef.current }));
        // Limpa o "sujo"; o próximo personagem que chegar (já com o que foi
        // gravado) reinicia o formulário pelo efeito do FormBody.
        resetForm({ values });
        limparRascunho();
        setRascunhoDisponivel(null);
      } catch {
        // Erro já registrado e exibido pelo SnackBar de SavingContext.executar.
      } finally {
        setSubmitting(false);
      }
    },
    [onSave, limparRascunho, executar, personagem.cultivoBonus],
  );

  return (
    <Formik initialValues={valoresIniciais} onSubmit={handleSubmit}>
      {formik => (
        <AtributosFormBody
          personagem={personagem}
          formik={formik}
          salvarRascunho={salvarRascunho}
          rascunho={rascunhoDisponivel}
          onExcluir={onExcluir}
          onSave={onSave}
          onPersonagemSincronizado={sincronizarBase}
          racaNome={racaNome}
          racaLinkImagem={racaLinkImagem}
          classesNomes={classesNomes}
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

AtributosTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onExcluir: PropTypes.func.isRequired,
};

export default AtributosTab;
