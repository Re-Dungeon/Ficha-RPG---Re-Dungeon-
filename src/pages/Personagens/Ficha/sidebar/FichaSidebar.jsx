import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import SchoolIcon from '@mui/icons-material/School';
import CasinoIcon from '@mui/icons-material/Casino';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import { SidebarItemButton, SidebarItemLabel, SidebarToggleRow, SidebarWrapper } from './styles';

const ITENS = [
  { chave: 'info', label: 'Info', Icon: InfoOutlinedIcon },
  { chave: 'aptidao', label: 'Aptidão', Icon: AutoAwesomeIcon },
  { chave: 'raca', label: 'Raça', Icon: Diversity3Icon },
  { chave: 'classe', label: 'Classe', Icon: SchoolIcon },
  { chave: 'sorte', label: 'Sorte', Icon: CasinoIcon },
  { chave: 'loja', label: 'Loja', Icon: StorefrontIcon },
  { chave: 'condicoes', label: 'Condições', Icon: HealthAndSafetyIcon },
  { chave: 'codex', label: 'Códex', Icon: MenuBookIcon },
];

const FichaSidebar = ({ expandida, onAlternar, onAbrirModal }) => (
  <SidebarWrapper $expandida={expandida}>
    <SidebarToggleRow>
      <IconButton
        aria-label={expandida ? 'Recolher menu' : 'Expandir menu'}
        onClick={onAlternar}
        size="small"
        sx={{ color: 'var(--text-primary)' }}
      >
        {expandida ? <ChevronLeftIcon /> : <MenuIcon />}
      </IconButton>
    </SidebarToggleRow>

    {ITENS.map(({ chave, label, Icon }) => {
      const botao = (
        <SidebarItemButton type="button" onClick={() => onAbrirModal(chave)} aria-label={label}>
          <Icon fontSize="small" />
          {expandida && <SidebarItemLabel>{label}</SidebarItemLabel>}
        </SidebarItemButton>
      );

      if (expandida) {
        return <React.Fragment key={chave}>{botao}</React.Fragment>;
      }

      return (
        <Tooltip key={chave} title={label} placement="right">
          {botao}
        </Tooltip>
      );
    })}
  </SidebarWrapper>
);

FichaSidebar.propTypes = {
  expandida: PropTypes.bool.isRequired,
  onAlternar: PropTypes.func.isRequired,
  onAbrirModal: PropTypes.func.isRequired,
};

export default FichaSidebar;
