import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';

import useRolarDaFicha from 'hooks/useRolarDaFicha';
import { extrairExpressaoDeDados, preparar, rotuloDeRolagem } from 'common/utils/gridRolagem';

import PostarEmSelect from '../PostarEmSelect';

// "🎲 Rolar" das Artes e Variantes que têm dados (campo `dados`, ex. "2d6+3 de
// fogo"): posta a rolagem pública no chat da campanha, falando como o
// personagem. Sem dados válidos no texto não renderiza nada; sem campanha fica
// desabilitado com a dica; com 2+ campanhas e nenhuma aberta no chat da ficha
// pergunta "Postar em:" antes de rolar.
const BotaoRolar = ({ dados, nome }) => {
  const [aviso, setAviso] = useState(null);
  const [ancora, setAncora] = useState(null);
  const [rolando, setRolando] = useState(false);
  const { campanhaIds, precisaEscolher, semCampanha, rolar } = useRolarDaFicha({
    onErro: mensagem => setAviso({ tipo: 'error', mensagem }),
  });

  const expressao = extrairExpressaoDeDados(dados);
  if (!expressao || preparar(expressao).erro) return null;

  const executar = async escolhida => {
    setRolando(true);
    const resultado = await rolar({
      expressao,
      rotulo: rotuloDeRolagem('arte', nome),
      campanhaId: escolhida,
    });
    setRolando(false);
    if (resultado === true) {
      setAviso({ tipo: 'success', mensagem: 'Rolagem publicada no chat da campanha.' });
    } else if (resultado?.erro) {
      setAviso({ tipo: 'error', mensagem: resultado.erro });
    }
  };

  const handleClick = event => {
    if (precisaEscolher) {
      setAncora(event.currentTarget);
      return;
    }
    executar(null);
  };

  const handleEscolher = escolhida => {
    setAncora(null);
    if (escolhida) executar(escolhida);
  };

  const desabilitado = semCampanha || rolando;

  return (
    <>
      <Tooltip title={semCampanha ? 'Vincule uma campanha ao personagem para rolar no chat.' : ''}>
        <span>
          <Button
            size="small"
            variant="outlined"
            onClick={handleClick}
            disabled={desabilitado}
            aria-label={`Rolar ${expressao}`}
            sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700, px: 1.2, py: 0.5 }}
          >
            🎲 Rolar {expressao}
          </Button>
        </span>
      </Tooltip>
      <Popover
        open={Boolean(ancora)}
        anchorEl={ancora}
        onClose={() => setAncora(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <div style={{ padding: 12 }}>
          <PostarEmSelect
            campanhaIds={campanhaIds}
            value=""
            onChange={handleEscolher}
            helperText="Escolha a campanha para publicar a rolagem."
          />
        </div>
      </Popover>
      <Snackbar
        open={Boolean(aviso)}
        autoHideDuration={3500}
        onClose={() => setAviso(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {aviso ? (
          <Alert severity={aviso.tipo} onClose={() => setAviso(null)} variant="filled">
            {aviso.mensagem}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};

BotaoRolar.propTypes = {
  dados: PropTypes.string,
  nome: PropTypes.string,
};

export default BotaoRolar;
