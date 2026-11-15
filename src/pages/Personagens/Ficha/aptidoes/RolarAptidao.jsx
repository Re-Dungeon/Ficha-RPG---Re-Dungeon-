import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Snackbar from '@mui/material/Snackbar';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

import useRolarDaFicha from 'hooks/useRolarDaFicha';
import { montarRolagemAptidao, previaRolagemAptidao } from 'common/utils/rolagemAptidao';

import PostarEmSelect from '../PostarEmSelect';
import { AcaoIconButton } from './styles';

// 🎲 de uma aptidão adquirida: abre um diálogo pequeno com o bônus/obstáculo
// do mestre (opcional, ex. "1d4+5-7"), "Usar Sorte" (+1d6) e a prévia, e posta
// a rolagem pública no chat da campanha falando como o personagem
// (useRolarDaFicha). Tudo zera a cada abertura.
const RolarAptidao = ({ nome, bonus }) => {
  const [aberto, setAberto] = useState(false);
  const [modificador, setModificador] = useState('');
  const [sorte, setSorte] = useState(false);
  const [campanhaEscolhida, setCampanhaEscolhida] = useState('');
  const [rolando, setRolando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const { campanhaIds, precisaEscolher, semCampanha, rolar } = useRolarDaFicha({
    onErro: mensagem => setAviso({ tipo: 'error', mensagem }),
  });

  const previa = previaRolagemAptidao({ bonus, sorte, modificador });
  const faltaCampanha = precisaEscolher && !campanhaEscolhida;
  const podeRolar = !previa.erro && !faltaCampanha && !rolando;

  const abrir = () => {
    setModificador('');
    setSorte(false);
    setCampanhaEscolhida('');
    setAberto(true);
  };

  const handleRolar = async event => {
    event.preventDefault();
    if (!podeRolar) return;
    const rolagem = montarRolagemAptidao({ nome, bonus, sorte, modificador });
    if (rolagem.erro) return;
    setRolando(true);
    const resultado = await rolar({
      expressao: rolagem.expressao,
      rotulo: rolagem.rotulo,
      campanhaId: campanhaEscolhida || null,
    });
    setRolando(false);
    if (resultado === true) {
      setAberto(false);
      setAviso({ tipo: 'success', mensagem: 'Rolagem publicada no chat da campanha.' });
    } else if (resultado?.erro) {
      setAviso({ tipo: 'error', mensagem: resultado.erro });
    }
  };

  return (
    <>
      <Tooltip title={semCampanha ? 'Vincule uma campanha ao personagem para rolar no chat.' : `Rolar ${nome}`}>
        <span style={{ display: 'inline-flex' }}>
          <AcaoIconButton
            type="button"
            aria-label={`Rolar ${nome}`}
            disabled={semCampanha}
            onClick={abrir}
          >
            <span aria-hidden="true" style={{ fontSize: '0.85rem', lineHeight: 1 }}>
              🎲
            </span>
          </AcaoIconButton>
        </span>
      </Tooltip>

      <Dialog open={aberto} onClose={() => setAberto(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleRolar} noValidate>
          <DialogTitle>Rolar {nome}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              size="small"
              label="Bônus/obstáculo do mestre"
              placeholder="ex.: 1d4+5-7"
              value={modificador}
              onChange={event => setModificador(event.target.value)}
              error={Boolean(previa.erro)}
              helperText={previa.erro ?? 'Deixe vazio se o mestre não deu nenhum.'}
              slotProps={{ htmlInput: { maxLength: 60, autoComplete: 'off' } }}
              sx={{ mt: 1 }}
            />
            <FormControlLabel
              control={<Switch checked={sorte} onChange={event => setSorte(event.target.checked)} />}
              label="🍀 Usar Sorte (+1d6)"
            />
            {precisaEscolher && (
              <PostarEmSelect
                campanhaIds={campanhaIds}
                value={campanhaEscolhida}
                onChange={setCampanhaEscolhida}
                helperText="Escolha a campanha para publicar a rolagem."
              />
            )}
            <div role="status" aria-label="Prévia da rolagem" style={{ color: 'var(--text-secondary)' }}>
              Vai rolar:{' '}
              <strong style={{ color: 'var(--color-primary)' }}>{previa.expressao ?? '—'}</strong>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAberto(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={!podeRolar}>
              🎲 Rolar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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

RolarAptidao.propTypes = {
  nome: PropTypes.string.isRequired,
  bonus: PropTypes.number.isRequired,
};

export default RolarAptidao;
