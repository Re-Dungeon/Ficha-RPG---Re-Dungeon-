import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { getUniverso } from 'service/storage';

const UniversoSelect = ({ personagem, onSave }) => {
  const [opcoes, setOpcoes] = useState([]);

  useEffect(() => {
    getUniverso().then(setOpcoes);
  }, []);

  const handleChange = useCallback(
    async event => {
      const universo = event.target.value;
      // Trocar de universo invalida raça/classes escolhidas (escopadas ao universo anterior).
      await onSave({ universo, raca: '', racaHabilidadesAtivas: [], classes: [] });
    },
    [onSave],
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
            {item.Nome}
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
