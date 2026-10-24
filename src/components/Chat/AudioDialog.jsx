import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

import { audioPropType } from './audioPropType';

// Música da mesa: todos veem o que está tocando e ajustam o próprio volume
// (vale só para quem ajustou); o mestre também toca um link do YouTube,
// pausa/retoma, para e liga/desliga o "repetir".
const AudioDialog = ({ open, onClose, audio }) => {
  const [link, setLink] = useState('');
  const [repetirNovo, setRepetirNovo] = useState(true);
  const [erroLink, setErroLink] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const repetir = audio.tocando ? audio.repetir : repetirNovo;

  const handleTocar = async event => {
    event.preventDefault();
    setEnviando(true);
    try {
      const erro = await audio.tocar(link, repetir);
      setErroLink(erro);
      if (!erro) setLink('');
    } finally {
      setEnviando(false);
    }
  };

  const handleRepetir = event => {
    const valor = event.target.checked;
    setRepetirNovo(valor);
    if (audio.tocando) audio.setRepetir(valor);
  };

  let situacao = 'Nenhuma música tocando.';
  if (audio.tocando) {
    situacao = `${audio.titulo ?? 'Carregando o título…'}${audio.pausado ? ' (pausada)' : ''}`;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            border: '1px solid rgba(132, 116, 255, 0.2)',
            boxShadow: '0 18px 45px rgba(9, 7, 20, 0.72)',
            background: 'linear-gradient(180deg, rgba(14, 12, 24, 0.98), rgba(17, 15, 30, 0.96))',
            overflow: 'hidden',
            color: 'var(--text-primary)',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 2.5,
          py: 1.75,
          borderBottom: '1px solid rgba(132, 116, 255, 0.12)',
          background: 'linear-gradient(180deg, rgba(24, 18, 38, 0.9), rgba(16, 14, 26, 0.86))',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#f3ebc9',
          fontSize: '0.76rem',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(234, 204, 123, 0.12)',
            border: '1px solid rgba(234, 204, 123, 0.32)',
            color: '#f4d98d',
            boxShadow: 'inset 0 0 16px rgba(234, 204, 123, 0.08)',
          }}
        >
          🎵
        </Box>
        Música da mesa
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 2.5, py: 2.25, background: 'rgba(14, 12, 24, 0.9)' }}>
        <Box
          role="status"
          aria-label="Música tocando"
          sx={{
            px: 1.5,
            py: 1.25,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(132, 116, 255, 0.12)',
          }}
        >
          <Typography sx={{ color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5, fontSize: '0.96rem' }}>
            {situacao}
          </Typography>
          {audio.erroPlayer && (
            <Typography variant="body2" sx={{ color: 'error.main', mt: 0.5 }}>
              {audio.erroPlayer}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
          <IconButton
            aria-label={audio.mudo ? 'Ativar som' : 'Silenciar'}
            onClick={() => audio.setMudo(!audio.mudo)}
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              color: '#f4d98d',
              background: 'rgba(244, 217, 141, 0.09)',
              border: '1px solid rgba(244, 217, 141, 0.18)',
              '&:hover': { background: 'rgba(244, 217, 141, 0.16)', borderColor: 'rgba(244, 217, 141, 0.28)' },
            }}
          >
            {audio.mudo ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
          <Slider
            aria-label="Volume da música"
            min={0}
            max={100}
            value={audio.volume}
            onChange={(_event, valor) => audio.setVolume(valor)}
            disabled={audio.mudo}
            sx={{
              color: '#e8cb85',
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
                background: '#f3e5b3',
                border: '2px solid rgba(26, 23, 39, 1)',
                boxShadow: '0 0 0 4px rgba(232, 203, 133, 0.12)',
              },
              '& .MuiSlider-track': { height: 4, borderRadius: 999 },
              '& .MuiSlider-rail': { height: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)' },
              '& .MuiSlider-valueLabel': { background: 'rgba(255,255,255,0.08)' },
            }}
          />
          <Typography
            variant="body2"
            sx={{ color: '#f3ebc9', minWidth: 38, fontWeight: 700, textAlign: 'right' }}
          >
            {audio.volume}%
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'var(--text-muted)', mt: -1.5, letterSpacing: '0.02em' }}>
          O volume vale só para você, neste aparelho.
        </Typography>

        {audio.podeControlar && (
          <>
            <Divider />
            <Box
              component="form"
              onSubmit={handleTocar}
              noValidate
              sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
            >
              <TextField
                size="small"
                label="Link do YouTube"
                placeholder="https://www.youtube.com/watch?v=…"
                value={link}
                onChange={event => {
                  setLink(event.target.value);
                  setErroLink(null);
                }}
                error={Boolean(erroLink)}
                helperText={erroLink ?? 'Toca para todos com o chat da campanha aberto.'}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <FormControlLabel
                  control={<Switch checked={repetir} onChange={handleRepetir} />}
                  label="Repetir"
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!link.trim() || enviando}
                >
                  Tocar
                </Button>
              </Box>
            </Box>
            {audio.tocando && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {audio.pausado ? (
                  <Button variant="outlined" onClick={audio.retomar}>
                    Retomar
                  </Button>
                ) : (
                  <Button variant="outlined" onClick={audio.pausar}>
                    Pausar
                  </Button>
                )}
                <Button color="error" onClick={audio.parar}>
                  Parar
                </Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2.25, pt: 0.75, background: 'rgba(17, 15, 29, 0.9)', borderTop: '1px solid rgba(132, 116, 255, 0.08)' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            minWidth: 108,
            borderRadius: 2,
            borderColor: 'rgba(180, 178, 255, 0.26)',
            color: '#eef1ff',
            background: 'rgba(255,255,255,0.02)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            '&:hover': {
              borderColor: 'rgba(234, 204, 123, 0.38)',
              background: 'rgba(234, 204, 123, 0.08)',
              color: '#f7f0d3',
            },
          }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AudioDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  audio: audioPropType.isRequired,
};

export default AudioDialog;
