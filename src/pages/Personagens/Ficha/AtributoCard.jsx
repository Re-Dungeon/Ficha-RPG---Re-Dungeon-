import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useField } from 'formik';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';

import NumberField from 'components/NumberField/NumberField';
import useIsMobile from 'hooks/useIsMobile';
import {
  NumberFieldBox,
  NumberFieldLabel,
  NumberFieldWrapper,
} from 'components/NumberField/styles';

import CalculadoraAtaqueModal from './ataque/CalculadoraAtaqueModal';
import ProntidaoModal from './prontidao/ProntidaoModal';
import {
  AtributoGemaButton,
  AtributoGemaLabel,
  AtributoGemaValor,
  DialogFecharButton,
  DialogHeaderRow,
  DialogHeaderTitle,
  FieldsRow,
} from './styles';

const AtributoCard = ({ label, total, baseName, extraName, bonusName, personagem, onSave }) => {
  const tituloId = `dialog-titulo-${baseName}`;
  const [aberto, setAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuPosicao, setMenuPosicao] = useState({ x: 0, y: 0 });
  const [calculadoraAberta, setCalculadoraAberta] = useState(false);
  const [baseField, , baseHelpers] = useField(baseName);
  const [extraField, , extraHelpers] = useField(extraName);
  const [bonusField, , bonusHelpers] = useField(bonusName);
  const snapshotRef = useRef(null);

  const tipoAtributo = label.toLowerCase();
  const isAtaque = tipoAtributo === 'ataque';
  const isDefesa = tipoAtributo === 'defesa';
  const isProntidao = tipoAtributo === 'prontidão' || tipoAtributo === 'prontidao';
  const isCalculadoraDisponivel = isAtaque || isDefesa;
  const nomeCalculadora = isDefesa ? 'Calculadora de Defesa' : 'Calculadora de Ataque';
  const [prontidaoAberta, setProntidaoAberta] = useState(false);
  const [prontidaoInfoAberta, setProntidaoInfoAberta] = useState(false);
  // Celular: sem botão direito (e o toque longo não dispara `contextmenu` no
  // iPhone) — as opções do menu de contexto viram botões no diálogo da gema.
  const isMobile = useIsMobile();

  const abrir = () => {
    snapshotRef.current = {
      base: baseField.value,
      extra: extraField.value,
      bonus: bonusField.value,
    };
    setAberto(true);
  };

  const cancelar = () => {
    const snapshot = snapshotRef.current;
    if (snapshot) {
      baseHelpers.setValue(snapshot.base);
      extraHelpers.setValue(snapshot.extra);
      bonusHelpers.setValue(snapshot.bonus);
    }
    setAberto(false);
  };

  const salvar = event => {
    event.preventDefault();
    setAberto(false);
  };

  const abrirMenuContexto = event => {
    if (!isCalculadoraDisponivel && !isProntidao) return;
    event.preventDefault();
    event.stopPropagation();
    setMenuPosicao({ x: event.clientX, y: event.clientY });
    setMenuAberto(true);
  };

  const fecharMenu = () => setMenuAberto(false);

  const opcoesMenu = [];

  if (isProntidao) {
    opcoesMenu.push({
      label: 'Central de Ações',
      onClick: () => {
        fecharMenu();
        setProntidaoAberta(true);
      },
    });
    opcoesMenu.push({
      label: 'Mecânicas de Prontidão',
      onClick: () => {
        fecharMenu();
        setProntidaoInfoAberta(true);
      },
    });
  }

  if (isCalculadoraDisponivel) {
    opcoesMenu.push({
      label: nomeCalculadora,
      onClick: () => {
        fecharMenu();
        setCalculadoraAberta(true);
      },
    });
  }

  return (
    <>
      <AtributoGemaButton
        type="button"
        aria-label={label}
        onClick={abrir}
        onContextMenu={abrirMenuContexto}
      >
        <AtributoGemaValor>{total}</AtributoGemaValor>
        <AtributoGemaLabel>{label.slice(0, 3)}</AtributoGemaLabel>
      </AtributoGemaButton>

      {opcoesMenu.length > 0 && (
        <Menu
          open={menuAberto}
          onClose={fecharMenu}
          anchorReference="anchorPosition"
          anchorPosition={{ top: menuPosicao.y, left: menuPosicao.x }}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                background: 'linear-gradient(180deg, rgba(19, 17, 27, 0.96), rgba(12, 13, 20, 0.98))',
                border: '1px solid rgba(232, 203, 133, 0.3)',
                borderRadius: 2,
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
                overflow: 'hidden',
                minWidth: 220,
              },
            },
            list: {
              'aria-labelledby': `${baseName}-context-menu`,
              sx: {
                p: 0.75,
                background: 'transparent',
                color: '#f1f1f4',
              },
            },
          }}
        >
          {opcoesMenu.map(opcao => (
            <MenuItem
              key={opcao.label}
              onClick={opcao.onClick}
              sx={{
                borderRadius: 1.5,
                px: 1.5,
                py: 1,
                color: '#f4dda2',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontSize: '0.72rem',
                '&:hover': {
                  background: 'rgba(232, 203, 133, 0.08)',
                },
              }}
            >
              {opcao.label}
            </MenuItem>
          ))}
        </Menu>
      )}

      {isCalculadoraDisponivel && (
        <CalculadoraAtaqueModal
          open={calculadoraAberta}
          onClose={() => setCalculadoraAberta(false)}
          personagem={personagem}
          onSave={onSave}
          contexto={isDefesa ? 'defesa' : 'ataque'}
        />
      )}

      {isProntidao && (
        <>
          <ProntidaoModal
            open={prontidaoAberta}
            onClose={() => setProntidaoAberta(false)}
            personagem={personagem}
            onSave={onSave}
            prontidaoValor={total}
            tipo="central"
          />
          <ProntidaoModal
            open={prontidaoInfoAberta}
            onClose={() => setProntidaoInfoAberta(false)}
            personagem={personagem}
            onSave={onSave}
            prontidaoValor={total}
            tipo="info"
          />
        </>
      )}

      <Dialog
        open={aberto}
        onClose={cancelar}
        fullWidth
        maxWidth="xs"
        aria-labelledby={tituloId}
      >
        <DialogHeaderRow>
          <DialogHeaderTitle id={tituloId}>Configurar {label}</DialogHeaderTitle>
          <DialogFecharButton type="button" aria-label="Fechar" onClick={cancelar}>
            <CloseIcon fontSize="small" />
          </DialogFecharButton>
        </DialogHeaderRow>
        <form onSubmit={salvar}>
          <DialogContent style={{ paddingTop: 8 }}>
            <FieldsRow>
              <NumberField name={baseName} label="Base" />
              <NumberField name={extraName} label="Extra" />
            </FieldsRow>
            <FieldsRow style={{ marginTop: 16 }}>
              <NumberFieldWrapper>
                <NumberFieldLabel as="span">
                  Total
                  <LockIcon fontSize="inherit" />
                </NumberFieldLabel>
                <NumberFieldBox value={total} disabled />
              </NumberFieldWrapper>
              <NumberField name={bonusName} label="Bônus" />
            </FieldsRow>
            {isMobile && opcoesMenu.length > 0 && (
              <div style={{ display: 'grid', gap: 8, marginTop: 20 }}>
                {opcoesMenu.map(opcao => (
                  <Button
                    key={opcao.label}
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setAberto(false);
                      opcao.onClick();
                    }}
                  >
                    {opcao.label}
                  </Button>
                ))}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelar}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

AtributoCard.propTypes = {
  label: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  baseName: PropTypes.string.isRequired,
  extraName: PropTypes.string.isRequired,
  bonusName: PropTypes.string.isRequired,
  bonusCultivo: PropTypes.number,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func,
};

AtributoCard.defaultProps = {
  bonusCultivo: 0,
  onSave: null,
};

export default AtributoCard;
