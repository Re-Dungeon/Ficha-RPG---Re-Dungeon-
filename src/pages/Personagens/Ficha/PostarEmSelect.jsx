import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { getRmCampanha } from 'service/storage';

// "Postar em:" — escolhe a campanha que recebe a rolagem quando o personagem
// está em 2+ campanhas e nenhuma foi escolhida no chat da ficha. Os nomes vêm de
// getRmCampanha (cai para o id se a leitura falhar).
const PostarEmSelect = ({
  campanhaIds,
  value,
  onChange,
  vazioLabel = null,
  helperText = null,
  size = 'small',
  sx = null,
}) => {
  const [nomes, setNomes] = useState({});
  // Quem chama costuma passar um array novo a cada snapshot da ficha ao vivo;
  // a chave em texto evita reler as campanhas se os ids são os mesmos.
  const idsChave = campanhaIds.join('|');

  useEffect(() => {
    let ativo = true;
    const ids = idsChave ? idsChave.split('|') : [];
    Promise.all(
      ids.map(id =>
        getRmCampanha(id)
          .then(campanha => [id, campanha?.nome ?? id])
          .catch(() => [id, id]),
      ),
    ).then(pares => {
      if (ativo) setNomes(Object.fromEntries(pares));
    });
    return () => {
      ativo = false;
    };
  }, [idsChave]);

  return (
    <TextField
      select
      size={size}
      label="Postar em:"
      value={value}
      onChange={event => onChange(event.target.value)}
      helperText={helperText}
      sx={{ minWidth: 200, ...sx }}
    >
      {vazioLabel && <MenuItem value="">{vazioLabel}</MenuItem>}
      {campanhaIds.map(id => (
        <MenuItem key={id} value={id}>
          {nomes[id] ?? id}
        </MenuItem>
      ))}
    </TextField>
  );
};

PostarEmSelect.propTypes = {
  campanhaIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  vazioLabel: PropTypes.string,
  helperText: PropTypes.string,
  size: PropTypes.string,
  sx: PropTypes.object,
};

export default PostarEmSelect;
