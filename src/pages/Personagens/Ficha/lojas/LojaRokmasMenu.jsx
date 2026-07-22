import React from 'react';
import PropTypes from 'prop-types';
import PaidIcon from '@mui/icons-material/Paid';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SellIcon from '@mui/icons-material/Sell';

import {
  MenuActionButton,
  MenuActionLabel,
  MenuButtonsGrid,
  MenuSaldoDestaque,
  MenuSaldoLabel,
  MenuSaldoValor,
} from './styles';

const LojaRokmasMenu = ({ saldoRokmas, onDefinirRokmas, onAbrirLoja, onVenderItens }) => (
  <div>
    <MenuSaldoDestaque>
      <MenuSaldoLabel>
        <PaidIcon fontSize="small" /> Rokmas Atuais
      </MenuSaldoLabel>
      <MenuSaldoValor>{saldoRokmas}</MenuSaldoValor>
    </MenuSaldoDestaque>

    <MenuButtonsGrid>
      <MenuActionButton type="button" onClick={onDefinirRokmas}>
        <PriceChangeIcon />
        <MenuActionLabel>Definir Rokmas</MenuActionLabel>
      </MenuActionButton>
      <MenuActionButton type="button" onClick={onAbrirLoja}>
        <ShoppingCartIcon />
        <MenuActionLabel>Abrir Loja</MenuActionLabel>
      </MenuActionButton>
      <MenuActionButton type="button" onClick={onVenderItens}>
        <SellIcon />
        <MenuActionLabel>Vender Itens</MenuActionLabel>
      </MenuActionButton>
    </MenuButtonsGrid>
  </div>
);

LojaRokmasMenu.propTypes = {
  saldoRokmas: PropTypes.number.isRequired,
  onDefinirRokmas: PropTypes.func.isRequired,
  onAbrirLoja: PropTypes.func.isRequired,
  onVenderItens: PropTypes.func.isRequired,
};

export default LojaRokmasMenu;
