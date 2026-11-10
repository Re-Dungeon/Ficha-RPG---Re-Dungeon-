import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

import { useAuth } from 'context/AuthContext';
import {
  addSupportTicket,
  getSupportAppContext,
  getSupportTicketsByUser,
} from 'service/storage';

const CATEGORIAS = ['Bug', 'Sugestão', 'Dúvida', 'Problema', 'Outro'];
const DEFAULT_FORM = { category: 'Bug', title: '', description: '', attachments: [''] };

const CATEGORY_META = {
  Bug: { icon: BugReportOutlinedIcon, color: '#00D9FF' },
  Sugestão: { icon: LightbulbOutlinedIcon, color: '#A78BFA' },
  Dúvida: { icon: HelpOutlineOutlinedIcon, color: '#7DD3FC' },
  Problema: { icon: ReportProblemOutlinedIcon, color: '#F59E0B' },
  Outro: { icon: MoreHorizOutlinedIcon, color: '#C4B5FD' },
};

const STATUS_META = {
  open: { label: 'Aberto', color: '#00D9FF', background: 'rgba(0, 217, 255, 0.12)', border: 'rgba(0, 217, 255, 0.32)' },
  'in_progress': { label: 'Em andamento', color: '#FBBF24', background: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.32)' },
  'in-progress': { label: 'Em andamento', color: '#FBBF24', background: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.32)' },
  answered: { label: 'Respondido', color: '#A78BFA', background: 'rgba(167, 139, 250, 0.12)', border: 'rgba(167, 139, 250, 0.32)' },
  resolved: { label: 'Resolvido', color: '#34D399', background: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.32)' },
};

const formatarStatus = status => {
  const mapa = {
    open: 'Aberto',
    'in_progress': 'Em andamento',
    'in-progress': 'Em andamento',
    answered: 'Respondido',
    resolved: 'Resolvido',
  };

  return mapa[status] ?? 'Aberto';
};

const formatarData = valor => {
  if (!valor) {
    return '—';
  }

  if (typeof valor?.toDate === 'function') {
    return new Date(valor.toDate()).toLocaleString('pt-BR');
  }

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    return '—';
  }

  return data.toLocaleString('pt-BR');
};

const SupportTicketsDialog = ({ open, onClose }) => {
  const { currentUser } = useAuth();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedTicket = useMemo(
    () => tickets.find(ticket => ticket.id === selectedTicketId) ?? null,
    [selectedTicketId, tickets],
  );

  const carregarTickets = useCallback(async () => {
    if (!currentUser?.uid) {
      setTickets([]);
      setSelectedTicketId('');
      return;
    }

    setLoadingTickets(true);
    setError('');

    try {
      const dados = await getSupportTicketsByUser(currentUser.uid);
      setTickets(dados);
      if (dados.length > 0) {
        setSelectedTicketId(prev => prev || dados[0].id);
      } else {
        setSelectedTicketId('');
      }
    } catch {
      setError('Não foi possível carregar seus tickets no momento.');
    } finally {
      setLoadingTickets(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSuccess('');
    setError('');
    setForm(DEFAULT_FORM);
    carregarTickets();
  }, [open, carregarTickets]);

  const atualizarCampo = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setError('');
    setSuccess('');
  };

  const atualizarAnexo = (index, valor) => {
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.map((item, itemIndex) => (itemIndex === index ? valor : item)),
    }));
    setError('');
    setSuccess('');
  };

  const adicionarAnexo = () => {
    setForm(prev => ({ ...prev, attachments: [...prev.attachments, ''] }));
  };

  const removerAnexo = index => {
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.length === 1
        ? ['']
        : prev.attachments.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const limparFormulario = () => {
    setForm(DEFAULT_FORM);
    setError('');
    setSuccess('');
  };

  const validarFormulario = () => {
    const titulo = form.title.trim();
    const descricao = form.description.trim();
    const anexos = form.attachments.map(item => item.trim()).filter(Boolean);

    if (!titulo) {
      throw new Error('O título do ticket é obrigatório.');
    }

    if (titulo.length > 120) {
      throw new Error('O título deve ter até 120 caracteres.');
    }

    if (!descricao) {
      throw new Error('A descrição do ticket é obrigatória.');
    }

    const linksInvalidos = anexos.filter(link => !/^https?:\/\//i.test(link));
    if (linksInvalidos.length > 0) {
      throw new Error('Os anexos devem ser links válidos com http:// ou https://.');
    }

    return {
      title: titulo,
      description: descricao,
      attachments: anexos,
    };
  };

  const handleEnviar = async () => {
    if (!currentUser?.uid) {
      setError('É necessário estar autenticado para enviar um ticket.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const dadosValidados = validarFormulario();
      const appContext = getSupportAppContext();
      const payload = {
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        userDisplayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Jogador',
        sourceApp: appContext.sourceApp,
        sourceAppName: appContext.sourceAppName,
        sourceUrl: appContext.sourceUrl,
        category: form.category,
        title: dadosValidados.title,
        description: dadosValidados.description,
        attachments: dadosValidados.attachments,
        status: 'open',
        adminResponse: '',
        respondedAt: null,
      };

      await addSupportTicket(payload);
      setForm(DEFAULT_FORM);
      setSuccess('Ticket enviado com sucesso!');
      await carregarTickets();
    } catch (erro) {
      setError(erro.message || 'Não foi possível enviar o ticket.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="support-dialog-title"
      slotProps={{
        paper: {
          sx: {
            background: 'linear-gradient(180deg, rgba(5, 8, 22, 0.98), rgba(16, 24, 43, 0.98))',
            border: '1px solid rgba(111, 45, 168, 0.5)',
            borderRadius: '24px',
            boxShadow: '0 18px 40px rgba(2, 6, 18, 0.7)',
            overflow: 'hidden',
            maxHeight: '92vh',
          },
        },
      }}
    >
      <DialogTitle
        id="support-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          px: 2.5,
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(180deg, rgba(111, 45, 168, 0.2), rgba(11, 16, 27, 0.16))',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(111, 45, 168, 0.38), rgba(0, 217, 255, 0.12))',
              border: '1px solid rgba(0, 217, 255, 0.25)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <HeadsetMicOutlinedIcon sx={{ color: '#e9d9ff', fontSize: 25 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: '#8AEAFF', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
              Suporte e Ajuda
            </Typography>
            <Typography variant="h5" sx={{ color: '#f4f7ff', fontWeight: 700, lineHeight: 1.2, mt: 0.25 }}>
              Abrir Ticket de Suporte
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(214, 222, 245, 0.78)', mt: 0.25 }}>
              Estamos aqui para ajudar com sua experiência no Re.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            border: '1px solid rgba(0, 217, 255, 0.25)',
            background: 'rgba(0, 217, 255, 0.06)',
            color: '#9AEAFB',
            borderRadius: '999px',
            px: 1.25,
            py: 0.5,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          <SupportAgentOutlinedIcon sx={{ fontSize: 16 }} />
          Equipe online
        </Box>

        <IconButton
          onClick={onClose}
          aria-label="Fechar suporte"
          sx={{
            color: '#e8ecff',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
            '&:hover': { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(111,45,168,0.5)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, background: 'linear-gradient(180deg, rgba(10,12,22,0.3), rgba(8,11,18,0.2))' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.12fr) minmax(0, 0.88fr)' },
            gap: 2.5,
            minHeight: 520,
            alignItems: 'stretch',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
            <Box
              sx={{
                background: 'rgba(16, 24, 43, 0.96)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                p: 2.25,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="overline" sx={{ color: '#8aeaff', letterSpacing: '0.16em', fontWeight: 700 }}>
                  Abertura de ticket
                </Typography>
                <Chip
                  label="Atendimento"
                  size="small"
                  sx={{
                    background: 'rgba(111, 45, 168, 0.14)',
                    color: '#D8B4FE',
                    border: '1px solid rgba(111, 45, 168, 0.4)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(2, minmax(0, 1fr))' },
                  gap: 1,
                }}
              >
                {CATEGORIAS.map(categoria => {
                  const selecionada = form.category === categoria;
                  const Icon = CATEGORY_META[categoria].icon;

                  return (
                    <Button
                      key={categoria}
                      variant={selecionada ? 'contained' : 'outlined'}
                      onClick={() => atualizarCampo('category', categoria)}
                      sx={{
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 1,
                        borderRadius: '14px',
                        borderColor: selecionada ? 'rgba(0, 217, 255, 0.35)' : 'rgba(255,255,255,0.08)',
                        background: selecionada
                          ? 'linear-gradient(135deg, rgba(111, 45, 168, 0.92), rgba(0, 217, 255, 0.12))'
                          : 'rgba(255,255,255,0.01)',
                        color: '#F4F7FF',
                        py: 1.2,
                        px: 1,
                        textTransform: 'none',
                        boxShadow: selecionada ? '0 12px 22px rgba(111, 45, 168, 0.28)' : 'none',
                        '&:hover': {
                          background: selecionada
                            ? 'linear-gradient(135deg, rgba(111, 45, 168, 0.96), rgba(0, 217, 255, 0.14))'
                            : 'rgba(255,255,255,0.03)',
                          borderColor: 'rgba(0, 217, 255, 0.25)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: selecionada ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <Icon sx={{ color: CATEGORY_META[categoria].color, fontSize: 16 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{categoria}</Typography>
                    </Button>
                  );
                })}
              </Box>

              <Stack spacing={1.75} sx={{ mt: 2.25 }}>
                <TextField
                  label="Título"
                  value={form.title}
                  onChange={event => atualizarCampo('title', event.target.value)}
                  slotProps={{ htmlInput: { maxLength: 120 } }}
                  fullWidth
                  helperText={`${form.title.length}/120`}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '14px',
                    },
                  }}
                />

                <TextField
                  label="Descrição"
                  value={form.description}
                  onChange={event => atualizarCampo('description', event.target.value)}
                  minRows={8}
                  maxRows={12}
                  multiline
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '16px',
                    },
                  }}
                />
              </Stack>
            </Box>

            <Box
              sx={{
                background: 'rgba(16, 24, 43, 0.96)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                p: 2.25,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, mb: 1.25 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#F4F7FF', fontWeight: 700 }}>
                    Anexos por URL
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(214, 222, 245, 0.72)' }}>
                    Inclua links de referência, prints ou materiais úteis.
                  </Typography>
                </Box>
                <Button
                  variant="text"
                  onClick={adicionarAnexo}
                  sx={{ color: '#8AEAFF', fontWeight: 700, textTransform: 'none', p: 0.5 }}
                >
                  + Adicionar link
                </Button>
              </Box>

              <Stack spacing={1.25}>
                {form.attachments.map((link, index) => (
                  <Box key={`anexo-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      value={link}
                      onChange={event => atualizarAnexo(index, event.target.value)}
                      placeholder="https://exemplo.com/anexo"
                      fullWidth
                      size="small"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkOutlinedIcon sx={{ color: 'rgba(255,255,255,0.52)' }} fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(255,255,255,0.02)',
                          borderRadius: '12px',
                        },
                      }}
                    />
                    <IconButton
                      aria-label={`Remover link ${index + 1}`}
                      onClick={() => removerAnexo(index)}
                      sx={{
                        color: '#F8D6D6',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.25, mt: 2, flexWrap: 'wrap' }}>
                <Button
                  onClick={limparFormulario}
                  sx={{
                    color: '#EEF2FF',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    px: 1.75,
                    py: 0.9,
                  }}
                >
                  Limpar
                </Button>

                <Button
                  variant="contained"
                  onClick={handleEnviar}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SendOutlinedIcon />}
                  sx={{
                    borderRadius: '12px',
                    px: 2,
                    py: 0.9,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, rgba(111, 45, 168, 0.95), rgba(0, 217, 255, 0.26))',
                    boxShadow: '0 12px 20px rgba(111, 45, 168, 0.28)',
                    '&:hover': { background: 'linear-gradient(135deg, rgba(111, 45, 168, 1), rgba(0, 217, 255, 0.32))' },
                  }}
                >
                  {saving ? 'Enviando…' : 'Enviar Ticket'}
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mt: 2, borderRadius: '12px' }}>
                  {success}
                </Alert>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
            <Box
              sx={{
                background: 'rgba(16, 24, 43, 0.96)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                overflow: 'hidden',
                minHeight: 0,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  px: 2.25,
                  py: 1.5,
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(111, 45, 168, 0.08)',
                }}
              >
                <Typography variant="h6" sx={{ color: '#f6f8ff', fontWeight: 700 }}>
                  Meus Tickets
                </Typography>
                <Chip
                  label={`${tickets.length} ${tickets.length === 1 ? 'ticket' : 'tickets'}`}
                  size="small"
                  sx={{
                    background: 'rgba(0, 217, 255, 0.12)',
                    color: '#9AEAFB',
                    border: '1px solid rgba(0, 217, 255, 0.26)',
                    fontWeight: 700,
                  }}
                />
              </Box>

              <Box sx={{ p: 2.25, maxHeight: 375, overflowY: 'auto' }}>
                {loadingTickets ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 5 }}>
                    <CircularProgress size={28} sx={{ color: '#8AEAFF' }} />
                  </Box>
                ) : tickets.length === 0 ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      py: 4,
                      textAlign: 'center',
                      border: '1px dashed rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      color: 'rgba(214, 222, 245, 0.8)',
                    }}
                  >
                    <DraftsOutlinedIcon sx={{ color: '#8AEAFF', fontSize: 28 }} />
                    <Typography sx={{ fontWeight: 600 }}>Nenhum ticket enviado ainda.</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(214, 222, 245, 0.7)' }}>
                      Sua conversa com a equipe aparecerá aqui.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.25}>
                    {tickets.map(ticket => {
                      const ativo = selectedTicketId === ticket.id;
                      const status = STATUS_META[ticket.status] ?? STATUS_META.open;

                      return (
                        <Box
                          key={ticket.id}
                          onClick={() => setSelectedTicketId(ticket.id)}
                          sx={{
                            cursor: 'pointer',
                            border: `1px solid ${ativo ? 'rgba(0, 217, 255, 0.7)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: '16px',
                            background: ativo ? 'rgba(0, 217, 255, 0.05)' : 'rgba(255,255,255,0.02)',
                            p: 1.5,
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: 'rgba(111, 45, 168, 0.7)', transform: 'translateY(-1px)' },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                              <Box
                                sx={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'rgba(255,255,255,0.04)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  flexShrink: 0,
                                }}
                              >
                                {React.createElement(CATEGORY_META[ticket.category]?.icon ?? MoreHorizOutlinedIcon, {
                                  sx: { fontSize: 18, color: CATEGORY_META[ticket.category]?.color ?? '#C4B5FD' },
                                })}
                              </Box>

                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ color: '#F4F7FF', fontWeight: 700, lineHeight: 1.35 }}>
                                  {ticket.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(214, 222, 245, 0.7)', display: 'block', mt: 0.25 }}>
                                  {ticket.category} · {formatarData(ticket.createdAt)}
                                </Typography>
                              </Box>
                            </Box>

                            <Chip
                              label={status.label}
                              size="small"
                              sx={{
                                background: status.background,
                                border: `1px solid ${status.border}`,
                                color: status.color,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Box>

            <Box
              sx={{
                background: 'rgba(16, 24, 43, 0.96)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                p: 2.25,
              }}
            >
              {!selectedTicket ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(214, 222, 245, 0.8)' }}>
                  <InfoOutlinedIcon sx={{ color: '#8AEAFF' }} />
                  <Typography sx={{ fontWeight: 600 }}>Selecione um ticket para ver os detalhes.</Typography>
                </Box>
              ) : (
                <Stack spacing={1.75}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box>
                      <Typography variant="overline" sx={{ color: '#8AEAFF', letterSpacing: '0.12em', fontWeight: 700 }}>
                        Detalhes do ticket
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#F4F7FF', fontWeight: 700, mt: 0.5 }}>
                        {selectedTicket.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={formatarStatus(selectedTicket.status)}
                      size="small"
                      sx={{
                        background: (STATUS_META[selectedTicket.status] ?? STATUS_META.open).background,
                        border: `1px solid ${(STATUS_META[selectedTicket.status] ?? STATUS_META.open).border}`,
                        color: (STATUS_META[selectedTicket.status] ?? STATUS_META.open).color,
                        fontWeight: 700,
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, color: 'rgba(214, 222, 245, 0.76)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: '#8AEAFF' }} />
                      <Typography variant="caption">{selectedTicket.category}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleOutlinedIcon sx={{ fontSize: 16, color: '#8AEAFF' }} />
                      <Typography variant="caption">{formatarData(selectedTicket.createdAt)}</Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '14px',
                      p: 1.5,
                    }}
                  >
                    <Typography sx={{ color: '#F4F7FF', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                      {selectedTicket.description}
                    </Typography>
                  </Box>

                  {selectedTicket.attachments?.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#8AEAFF', mb: 1, fontWeight: 700 }}>
                        Anexos
                      </Typography>
                      <Stack spacing={0.75}>
                        {selectedTicket.attachments.map((link, index) => (
                          <a
                            key={`${selectedTicket.id}-anexo-${index}`}
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#A5F3FC', textDecoration: 'underline', wordBreak: 'break-word' }}
                          >
                            {link}
                          </a>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {selectedTicket.adminResponse ? (
                    <Box
                      sx={{
                        background: 'rgba(111, 45, 168, 0.12)',
                        border: '1px solid rgba(111, 45, 168, 0.38)',
                        borderRadius: '14px',
                        p: 1.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                        <CheckCircleOutlineOutlinedIcon sx={{ color: '#D8B4FE', fontSize: 18 }} />
                        <Typography variant="subtitle2" sx={{ color: '#E9D5FF', fontWeight: 700 }}>
                          Resposta da equipe
                        </Typography>
                      </Box>
                      <Typography sx={{ color: 'rgba(224,228,245,0.85)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                        {selectedTicket.adminResponse}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.25,
                        py: 1,
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px dashed rgba(255,255,255,0.08)',
                        color: 'rgba(214, 222, 245, 0.8)',
                      }}
                    >
                      <InfoOutlinedIcon sx={{ fontSize: 18, color: '#8AEAFF' }} />
                      <Typography variant="body2">Ainda não há resposta da equipe para este ticket.</Typography>
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

SupportTicketsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SupportTicketsDialog;
