import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const Card = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  display:flex;
  flex-direction:column;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  &:hover { transform: translateY(-6px); box-shadow: var(--shadow-md); }
`;

const Cover = styled.div`
  height:120px;
  display:flex;
  align-items:flex-end;
  padding:8px;
  background-size:cover;
  background-position:center;
`;

const Body = styled.div`
  padding:12px;
  color:var(--text-primary);
  display:flex;
  flex-direction:column;
  gap:8px;
`;

const Title = styled.h3`
  margin:0;
  font-size:0.95rem;
  color:var(--text-primary);
`;

// preview removed: cards will show title, cover, date and actions only

const Footer = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
`;

const Actions = styled.div`
  display:flex;
  gap:6px;
`;

const NoteCard = ({ note, onSelect, onOpen, onToggleFavorite, onDuplicate, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = e => { e.stopPropagation(); setAnchorEl(e.currentTarget); };
  const closeMenu = () => setAnchorEl(null);

  return (
    <Card onClick={() => onSelect(note.id)} onDoubleClick={() => onOpen(note)} role="button" tabIndex={0}>
      <Cover style={ note.coverImage ? { backgroundImage: `url(${note.coverImage})` } : { background: 'linear-gradient(135deg, rgba(20,20,30,1), rgba(40,30,50,1))' }}>
        {!note.coverImage && (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 28 }} aria-hidden>
            🗒
          </div>
        )}
      </Cover>
      <Body>
        <Title>{note.title}</Title>
        <Footer>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {note.updatedAt ? new Date(note.updatedAt.seconds * 1000).toLocaleDateString() : ''}
          </div>
          <Actions>
            <Tooltip title={note.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
              <IconButton size="small" onClick={e => { e.stopPropagation(); onToggleFavorite(note); }} aria-label="Favoritar">
                {note.isFavorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Mais ações">
              <IconButton size="small" onClick={handleMenu} aria-label="Mais">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu} onClick={e => e.stopPropagation()}>
              <MenuItem onClick={() => { closeMenu(); onOpen(note); }}>Abrir</MenuItem>
              <MenuItem onClick={() => { closeMenu(); onDuplicate(note); }}>Duplicar</MenuItem>
              <MenuItem onClick={() => { closeMenu(); onDelete(note); }}>Excluir</MenuItem>
            </Menu>
          </Actions>
        </Footer>
      </Body>
    </Card>
  );
};

NoteCard.propTypes = {
  note: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default NoteCard;
