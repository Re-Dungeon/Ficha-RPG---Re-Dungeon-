import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import Button from '@mui/material/Button';
import ShieldIcon from '@mui/icons-material/Shield';
import PropTypes from 'prop-types';

import {
  calcularPowerCombat,
  calcularPrimariosTotais,
  calcularSecundarios,
  calcularStatusMaximos,
} from 'common/utils/formulas';
import { useDraftLocalStorage } from 'hooks/useDraftLocalStorage';
import DraftBanner from 'components/DraftBanner/DraftBanner';

import AtributoCard from '../AtributoCard';
import StatusCard from '../StatusCard';
import { PRIMARIOS_LABELS, SECUNDARIOS_LABELS, STATUS_LABELS, buildInitialValues } from '../constants';
import {
  AttributesGrid,
  PowerCombatBadge,
  SectionTitle,
  StatusPainelEmblema,
  StatusPainelWrapper,
  StatusParRow,
} from '../styles';

const [[STATUS_PRINCIPAL_CHAVE, STATUS_PRINCIPAL_LABEL], ...STATUS_SECUNDARIOS] =
  Object.entries(STATUS_LABELS);

// Componente próprio (não uma função inline dentro do children do Formik) só
// para poder chamar useEffect com segurança — hooks dentro do render-prop do
// Formik não são um componente reconhecido pelo React/eslint-plugin-react-hooks.
const AtributosFormBody = ({ formik, salvarRascunho, rascunho, onRestaurar, onDescartar }) => {
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

  return (
    <form onSubmit={submit}>
      {rascunho && <DraftBanner onRestaurar={onRestaurar} onDescartar={onDescartar} />}

      <SectionTitle>
        Atributos
        <PowerCombatBadge>Power Combat: {powerCombat}</PowerCombatBadge>
      </SectionTitle>
      <AttributesGrid>
        {Object.entries(PRIMARIOS_LABELS).map(([chave, label]) => (
          <AtributoCard
            key={chave}
            label={label}
            total={primariosTotais[chave]}
            baseName={`atributosBase.${chave}`}
            extraName={`atributosExtra.${chave}`}
            bonusName={`atributosBonus.${chave}`}
          />
        ))}
      </AttributesGrid>

      <SectionTitle style={{ marginTop: '24px' }}>Secundários</SectionTitle>
      <AttributesGrid>
        {Object.entries(SECUNDARIOS_LABELS).map(([chave, label]) => (
          <AtributoCard
            key={chave}
            label={label}
            total={secundariosTotais[chave]}
            baseName={`secundariosBase.${chave}`}
            extraName={`secundariosExtra.${chave}`}
            bonusName={`secundariosBonus.${chave}`}
          />
        ))}
      </AttributesGrid>

      <SectionTitle style={{ marginTop: '24px' }}>Status</SectionTitle>
      <StatusPainelWrapper>
        <StatusPainelEmblema>
          <ShieldIcon />
        </StatusPainelEmblema>

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

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        sx={{ marginTop: '24px' }}
      >
        Salvar
      </Button>
    </form>
  );
};

AtributosFormBody.propTypes = {
  formik: PropTypes.object.isRequired,
  salvarRascunho: PropTypes.func.isRequired,
  rascunho: PropTypes.object,
  onRestaurar: PropTypes.func.isRequired,
  onDescartar: PropTypes.func.isRequired,
};

AtributosFormBody.defaultProps = {
  rascunho: null,
};

const AtributosTab = ({ personagem, onSave }) => {
  const chaveRascunho = `rascunho_personagem_${personagem.id}_atributos`;
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

  const handleSubmit = useCallback(
    async (values, { setSubmitting }) => {
      await onSave(values);
      limparRascunho();
      setRascunhoDisponivel(null);
      setSubmitting(false);
    },
    [onSave, limparRascunho],
  );

  return (
    <Formik initialValues={buildInitialValues(personagem)} onSubmit={handleSubmit}>
      {formik => (
        <AtributosFormBody
          formik={formik}
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

AtributosTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AtributosTab;
