import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as yup from 'yup';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { useAuth } from 'context/AuthContext';
import { addPersonagem, getUniverso } from 'service/storage';
import { nomeSchema } from 'common/utils/yupSchemas';
import { getNome } from 'common/utils/resolveNome';
import ErrorSnackbar from 'components/ErrorSnackbar/ErrorSnackbar';

const novoPersonagemSchema = yup.object({
  nome: nomeSchema,
  universo: yup.string().required('Universo é obrigatório'),
});

const CriarPersonagemModal = ({ open, onClose, onCreated }) => {
  const { currentUser } = useAuth();
  const [universos, setUniversos] = useState([]);
  const [erro, setErro] = useState(null);
  const nomeRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    let isMounted = true;
    getUniverso()
      .then(items => {
        if (isMounted) {
          setUniversos(items);
        }
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar universos:', error);
        if (isMounted) {
          setErro('Não foi possível carregar a lista de universos. Tente novamente.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setErro(null);
      setTimeout(() => {
        nomeRef.current?.focus();
      }, 50);
    }
  }, [open]);

  const handleSubmit = useCallback(
    async ({ nome, universo }, { setSubmitting }) => {
      try {
        await addPersonagem({ uid: currentUser.uid, nome, universo });
        onCreated();
        onClose();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Falha ao criar personagem:', error);
        setErro('Não foi possível criar o personagem. Verifique sua conexão e tente novamente.');
        setSubmitting(false);
      }
    },
    [currentUser.uid, onClose, onCreated],
  );

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          onClose();
        }
      }}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            width: 'min(100%, 520px)',
            bgcolor: '#141425',
            border: '1px solid rgba(91, 124, 250, 0.16)',
            borderRadius: '22px',
            boxShadow: '0 30px 80px rgba(91, 124, 250, 0.16)',
            overflow: 'hidden',
          },
        },
        backdrop: {
          sx: {
            bgcolor: 'rgba(3, 6, 18, 0.72)',
            backdropFilter: 'blur(10px)',
          },
        },
      }}
    >
      <DialogContent sx={{ px: { xs: 3, sm: 4 }, pt: { xs: 3, sm: 4 }, pb: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <h2
            style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '1.55rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textShadow: '0 0 12px rgba(91, 124, 250, 0.2)',
            }}
          >
            Novo Personagem
          </h2>
          <IconButton
            aria-label="Fechar"
            onClick={onClose}
            sx={{
              width: 36,
              height: 36,
              color: 'var(--text-muted)',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'var(--text-primary)',
                borderColor: 'rgba(91, 124, 250, 0.4)',
                background: 'rgba(91, 124, 250, 0.08)',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        <Formik
          initialValues={{ nome: '', universo: '' }}
          validationSchema={novoPersonagemSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit: submit, isSubmitting }) => (
            <form onSubmit={submit} noValidate>
              <TextField
                name="nome"
                label="Nome do personagem"
                placeholder="Nome do personagem"
                value={values.nome}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.nome && Boolean(errors.nome)}
                helperText={touched.nome && errors.nome}
                fullWidth
                size="small"
                inputRef={nomeRef}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--text-primary)',
                  },
                }}
              />

              <FormControl
                size="small"
                fullWidth
                error={touched.universo && Boolean(errors.universo)}
                sx={{ mb: 1.5 }}
              >
                <InputLabel id="novo-personagem-universo-label">Universo</InputLabel>
                <Select
                  labelId="novo-personagem-universo-label"
                  name="universo"
                  label="Universo"
                  value={values.universo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  MenuProps={{
                    slotProps: {
                      paper: {
                        sx: {
                          bgcolor: 'rgba(10, 9, 19, 0.96)',
                          border: '1px solid rgba(91, 124, 250, 0.18)',
                          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
                        },
                      },
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(91, 124, 250, 0.65)',
                    },
                  }}
                >
                  {universos.map(item => (
                    <MenuItem
                      key={item.id}
                      value={item.id}
                      sx={{
                        py: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(91, 124, 250, 0.16)',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(91, 124, 250, 0.08)',
                        },
                      }}
                    >
                      {getNome(item)}
                    </MenuItem>
                  ))}
                </Select>
                {touched.universo && errors.universo && (
                  <FormHelperText>{errors.universo}</FormHelperText>
                )}
              </FormControl>

              <DialogActions sx={{ px: 0, pt: 4, pb: 0, justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={onClose}
                  sx={{
                    color: 'var(--text-primary)',
                    borderColor: 'rgba(91, 124, 250, 0.28)',
                    borderRadius: '16px',
                    minWidth: 120,
                    '&:hover': {
                      borderColor: 'rgba(91, 124, 250, 0.45)',
                      background: 'rgba(91, 124, 250, 0.08)',
                    },
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    minWidth: 140,
                    borderRadius: '16px',
                    textTransform: 'none',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 16px 32px rgba(91, 124, 250, 0.28)',
                    },
                  }}
                >
                  {isSubmitting ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <CircularProgress size={18} sx={{ color: 'inherit' }} />
                      Criando...
                    </span>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </DialogActions>
            </form>
          )}
        </Formik>
      </DialogContent>

      <ErrorSnackbar open={!!erro} mensagem={erro} onClose={() => setErro(null)} />
    </Dialog>
  );
};

CriarPersonagemModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
};

export default CriarPersonagemModal;
