import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import TitleIcon from '@mui/icons-material/Title';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import styled from 'styled-components';
import { useSaving } from 'context/SavingContext';

const CoverPreview = styled.div`
  height:160px;
  background:rgba(0,0,0,0.25);
  border-radius:8px;
  margin-bottom:10px;
  background-size:cover;
  background-position:center;
`;

const EditorArea = styled.div`
  min-height:220px;
  border:1px solid rgba(255,255,255,0.04);
  padding:12px;
  border-radius:8px;
  background: rgba(0,0,0,0.18);
  color:var(--text-primary);
  overflow:auto;
  line-height: 1.45;
  /* Limita a aproximadamente 10 linhas de texto antes de mostrar scrollbar */
  max-height: calc(1.45rem * 10 + 24px);

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(200,160,80,0.14), rgba(200,160,80,0.24));
    border-radius: 10px;
  }
`;

const Toolbar = styled.div`
  display:flex;
  gap:8px;
  margin-bottom:8px;
`;

const NoteEditor = ({ open, onClose, onSave, initial }) => {
  const { executar } = useSaving();
  const [title, setTitle] = useState(initial.title ?? 'Nova Nota');
  const [coverImage, setCoverImage] = useState(initial.coverImage ?? '');
  const [isFavorite, setIsFavorite] = useState(initial.isFavorite ?? false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTitle(initial.title ?? 'Nova Nota');
      setCoverImage(initial.coverImage ?? '');
      setIsFavorite(initial.isFavorite ?? false);
      // Garantir que o contentEditable esteja montado antes de setar o innerHTML
      requestAnimationFrame(() => {
        if (editorRef.current) editorRef.current.innerHTML = initial.content ?? '';
      });
    }
  }, [open, initial]);

  const exec = (command, value = null) => {
    try {
      // some commands accept a value (formatBlock)
      document.execCommand(command, false, value);
    } catch {
      // noop
    }
    if (editorRef.current) editorRef.current.focus();
  };

  const handleSave = async () => {
    const content = editorRef.current ? editorRef.current.innerHTML : '';
    const plainText = editorRef.current ? editorRef.current.innerText : '';
    await executar(() => onSave({ title, content, plainText, coverImage, isFavorite }));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent sx={{ padding: 3 }}>
        <CoverPreview style={{ backgroundImage: coverImage ? `url(${coverImage})` : undefined }} />
        <TextField fullWidth label="Capa (URL)" value={coverImage} onChange={e => setCoverImage(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth label="Título" value={title} onChange={e => setTitle(e.target.value)} sx={{ mb: 1 }} />

        <Toolbar>
          <Tooltip title="Negrito"><IconButton size="small" onClick={() => exec('bold')}><FormatBoldIcon /></IconButton></Tooltip>
          <Tooltip title="Itálico"><IconButton size="small" onClick={() => exec('italic')}><FormatItalicIcon /></IconButton></Tooltip>
          <Tooltip title="Sublinhado"><IconButton size="small" onClick={() => exec('underline')}><FormatUnderlinedIcon /></IconButton></Tooltip>
          <Tooltip title="Título (H1)"><IconButton size="small" onClick={() => exec('formatBlock', 'H1')}><TitleIcon /></IconButton></Tooltip>
          <Tooltip title="Lista"><IconButton size="small" onClick={() => exec('insertUnorderedList')}><FormatListBulletedIcon /></IconButton></Tooltip>
          <Tooltip title="Lista numerada"><IconButton size="small" onClick={() => exec('insertOrderedList')}><FormatListNumberedIcon /></IconButton></Tooltip>
          <Tooltip title="Limpar formatação"><IconButton size="small" onClick={() => exec('removeFormat')}>✖</IconButton></Tooltip>
        </Toolbar>

        <EditorArea>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            style={{ minHeight: 180, outline: 'none' }}
          />
        </EditorArea>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

NoteEditor.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initial: PropTypes.object,
};

NoteEditor.defaultProps = { initial: {} };

export default NoteEditor;
