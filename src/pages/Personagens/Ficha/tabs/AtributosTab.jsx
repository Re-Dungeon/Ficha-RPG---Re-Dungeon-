import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';

import {
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
import { HeroRow, SectionTitle, StatusPainelWrapper, StatusParRow } from '../styles';

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
  classesNomes,
}) => {
  const { values, handleSubmit: submit, isSubmitting, dirty } = formik;

  useEffect(() => {
    if (dirty) {
      salvarRascunho(values);
    }
  }, [values, dirty, salvarRascunho]);

  const primariosTotais = calcularPrimariosTotais(
    values.atributosBase,
    values.atributosExtra,
    values.atributosBonus,
  );
  const secundariosTotais = calcularSecundarios(
    primariosTotais,
    values.secundariosBase,
    values.secundariosExtra,
    values.secundariosBonus,
  );
  const statusMaximos = calcularStatusMaximos(primariosTotais, values.status);
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
        />

        <PersonagemHeroCard
          personagem={personagem}
          racaNome={racaNome}
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
  racaNome: PropTypes.string.isRequired,
  classesNomes: PropTypes.array.isRequired,
};

AtributosFormBody.defaultProps = {
  rascunho: null,
};

const AtributosTab = ({ personagem, onSave, onExcluir }) => {
  const chaveRascunho = `rascunho_personagem_${personagem.id}_atributos`;
  const { lerRascunho, salvarRascunho, limparRascunho } =
    useDraftLocalStorage(chaveRascunho);
  const { racaNome, classesNomes } = useRacaClasseNomes(personagem);
  const { executar } = useSaving();
  const [rascunhoDisponivel, setRascunhoDisponivel] = useState(null);
  const atualizadoEmRef = useRef(personagem.updatedAt);

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
    async (values, { setSubmitting }) => {
      try {
        await executar(() => onSave(values));
        limparRascunho();
        setRascunhoDisponivel(null);
      } catch {
        // Erro já registrado e exibido pelo SnackBar de SavingContext.executar.
      } finally {
        setSubmitting(false);
      }
    },
    [onSave, limparRascunho, executar],
  );

  return (
    <Formik initialValues={buildInitialValues(personagem)} onSubmit={handleSubmit}>
      {formik => (
        <AtributosFormBody
          personagem={personagem}
          formik={formik}
          salvarRascunho={salvarRascunho}
          rascunho={rascunhoDisponivel}
          onExcluir={onExcluir}
          racaNome={racaNome}
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
