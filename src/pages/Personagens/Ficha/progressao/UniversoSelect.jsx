import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { getUniverso } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';
import { useSaving } from 'context/SavingContext';

const UniversoSelect = ({ personagem, onSave }) => {
  const [opcoes, setOpcoes] = useState([]);
  const { executar } = useSaving();

  useEffect(() => {
    getUniverso()
      .then(setOpcoes)
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar universos:', erro);
      });
  }, []);

  const handleChange = useCallback(
    event => {
      const universo = event.target.value;
      // Trocar de universo invalida raça/classes escolhidas (escopadas ao universo anterior).
      return executar(() => onSave({ universo, raca: '', racaHabilidadesAtivas: [], classes: [] }));
    },
    [onSave, executar],
  );

  return (
    <FormControl size="small" sx={{ minWidth: 260 }}>
      <InputLabel id="universo-label">Universo</InputLabel>
      <Select
        labelId="universo-label"
        label="Universo"
        value={personagem.universo ?? ''}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>Nenhum</em>
        </MenuItem>
        {opcoes.map(item => (
          <MenuItem key={item.id} value={item.id}>
            {getNome(item)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

UniversoSelect.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default UniversoSelect;
