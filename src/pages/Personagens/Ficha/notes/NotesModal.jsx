import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { getNotas, addNota, updateNota, removeNota, duplicateNota } from 'service/storage';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import { ModalHeader, ModalTitle, Grid, ControlsRow, SearchInput, EmptyState, ScrollArea } from './styles';

const NotesModal = ({ open, onClose, personagem }) => {
  const [notas, setNotas] = useState([]);
  const [filter, setFilter] = useState('todas');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorInitial, setEditorInitial] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    let mounted = true;
    getNotas(personagem.id).then(items => { if (mounted) setNotas(items.reverse()); });
    return () => { mounted = false; };
  }, [open, personagem.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notas.filter(n => {
      if (filter === 'favoritas' && !n.isFavorite) return false;
      if (!q) return true;
      return (n.title || '').toLowerCase().includes(q) || (n.plainText || '').toLowerCase().includes(q);
    });
  }, [notas, query, filter]);

  // pagination
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  useEffect(() => {
    // reset to first page when filter/query/notas change
    setCurrentPage(1);
  }, [filtered.length, query, filter]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const openEditorForNew = () => {
    setEditorInitial({ title: 'Nova Nota', content: '', plainText: '' });
    setEditorOpen(true);
  };

  const handleSave = async data => {
    if (selected && selected.id) {
      await updateNota(personagem.id, selected.id, data);
      setNotas(current => current.map(n => (n.id === selected.id ? { ...n, ...data, ...{ updatedAt: { seconds: Date.now()/1000 } } } : n)));
    } else if (selected && selected === 'editing-existing') {
      // should not happen
    } else if (editorInitial && editorInitial.id) {
      // editing existing via editorInitial
      await updateNota(personagem.id, editorInitial.id, data);
    } else {
      await addNota(personagem.id, data);
    }
    // reload
    const items = await getNotas(personagem.id);
    setNotas(items.reverse());
  };

  const handleOpenNote = note => {
    setEditorInitial(note);
    setEditorOpen(true);
  };

  const handleToggleFavorite = async note => {
    await updateNota(personagem.id, note.id, { isFavorite: !note.isFavorite });
    setNotas(current => current.map(n => (n.id === note.id ? { ...n, isFavorite: !n.isFavorite } : n)));
  };

  const handleDuplicate = async note => {
    await duplicateNota(personagem.id, note.id);
    const items = await getNotas(personagem.id);
    setNotas(items.reverse());
  };

  const handleDelete = async note => {
    setConfirmDelete(note);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <ModalHeader>
        <ModalTitle>GERENCIADOR DE NOTAS</ModalTitle>
        <div style={{ flex: 1 }} />
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </ModalHeader>

      <ControlsRow>
        <SearchInput placeholder="🔍 Pesquisar notas..." value={query} onChange={e => setQuery(e.target.value)} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openEditorForNew}>+ NOVA NOTA</Button>
      </ControlsRow>

      <DialogContent>
        <ScrollArea>
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <Button variant={filter === 'todas' ? 'contained' : 'text'} onClick={() => setFilter('todas')}>Todas</Button>
            <Button variant={filter === 'recentes' ? 'contained' : 'text'} onClick={() => setFilter('recentes')}>Recentes</Button>
            <Button variant={filter === 'favoritas' ? 'contained' : 'text'} onClick={() => setFilter('favoritas')}>Favoritas</Button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState>
              <div style={{ fontSize: 48 }}>🗒</div>
              <h3>NENHUMA NOTA ENCONTRADA</h3>
              <p>Organize informações importantes, missões, personagens e descobertas.</p>
              <Button variant="contained" onClick={openEditorForNew}>CRIAR PRIMEIRA NOTA</Button>
            </EmptyState>
          ) : (
            <>
              <Grid>
                {pageItems.map(n => (
                  <NoteCard
                    key={n.id}
                    note={n}
                    onSelect={id => setSelected(id)}
                    onOpen={note => handleOpenNote(note)}
                    onToggleFavorite={handleToggleFavorite}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                ))}
              </Grid>

              {/* Pagination controls */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>&lt;</Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <Button
                      key={p}
                      variant={p === currentPage ? 'contained' : 'text'}
                      onClick={() => setCurrentPage(p)}
                      sx={{ minWidth: 36, px: 1 }}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>&gt;</Button>
                </div>
              </div>
            </>
          )}
        </div>
        </ScrollArea>
      </DialogContent>

      <NoteEditor
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditorInitial({}); }}
        onSave={handleSave}
        initial={editorInitial}
      />

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Excluir esta nota?</DialogTitle>
        <DialogContentText sx={{ p: 2 }}>Essa ação removerá a nota permanentemente.</DialogContentText>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={async () => {
            if (!confirmDelete) return;
            await removeNota(personagem.id, confirmDelete.id);
            setNotas(current => current.filter(n => n.id !== confirmDelete.id));
            setConfirmDelete(null);
          }}>Excluir Nota</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

NotesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
};

export default NotesModal;
