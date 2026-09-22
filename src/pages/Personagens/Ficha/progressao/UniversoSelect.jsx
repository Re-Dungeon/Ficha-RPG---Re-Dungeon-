import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { getUniverso } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';

const UniversoSelect = ({ personagem, onSave }) => {
  const [opcoes, setOpcoes] = useState([]);

  useEffect(() => {
    getUniverso()
      .then(setOpcoes)
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar universos:', erro);
      });
  }, []);

  const opcoesComNenhum = useMemo(
    () => [{ id: '', Nome: 'Nenhum' }, ...opcoes],
    [opcoes],
  );

  const valorSelecionado = useMemo(
    () => opcoesComNenhum.find(item => item.id === (personagem.universo ?? '')) ?? opcoesComNenhum[0],
    [opcoesComNenhum, personagem.universo],
  );

  const handleChange = useCallback(
    (_event, novoValor) => {
      const universo = novoValor?.id ?? '';
      // Trocar de universo invalida raça/classes escolhidas (escopadas ao universo anterior).
      return onSave({ universo, raca: '', racaHabilidadesAtivas: [], classes: [] });
    },
    [onSave],
  );

  const filtrarOpcoes = useCallback((opcoesFiltradas, estado) => {
    const termo = (estado.inputValue ?? '').trim().toLowerCase();
    if (!termo) {
      return opcoesFiltradas;
    }

    return opcoesFiltradas.filter(item => getNome(item).toLowerCase().includes(termo));
  }, []);

  return (
    <Autocomplete
      size="small"
      options={opcoesComNenhum}
      value={valorSelecionado}
      getOptionLabel={item => getNome(item) || 'Nenhum'}
      isOptionEqualToValue={(opcao, valor) => opcao.id === valor.id}
      onChange={handleChange}
      filterOptions={filtrarOpcoes}
      disableClearable
      openOnFocus
      noOptionsText="Nenhum universo encontrado"
      slotProps={{
        listbox: { style: { maxHeight: 220, overflow: 'auto' } },
        input: {
          sx: {
            borderRadius: 2,
            background: 'rgba(255,255,255,0.02)',
          },
        },
      }}
      sx={{ minWidth: 220, maxWidth: 320, width: '100%' }}
      renderInput={params => (
        <TextField
          {...params}
          label="Universo"
          placeholder="Buscar universo"
        />
      )}
    />
  );
};

UniversoSelect.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default UniversoSelect;
