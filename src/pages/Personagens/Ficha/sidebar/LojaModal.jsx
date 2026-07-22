import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PaidIcon from '@mui/icons-material/Paid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';

import {
  addItemInventario,
  getItensInventario,
  getItensPorUniverso,
  getReceitasInventario,
  getReceitasPorUniverso,
  removeItemInventario,
  removeReceitaInventario,
  updateItemInventario,
  updateReceitaInventario,
} from 'service/storage';
import { calcularEspacoInventario, calcularPrimariosTotais } from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';
import { useSaving } from 'context/SavingContext';

import { extrairCamposItem } from '../inventario/constants';
import LojaRokmasMenu from '../lojas/LojaRokmasMenu';
import LojaComprarView from '../lojas/LojaComprarView';
import LojaVenderView from '../lojas/LojaVenderView';
import DefinirRokmasDialog from '../lojas/DefinirRokmasDialog';
import { SaldoBadge } from '../lojas/styles';
import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle } from '../styles';

const SALDO_INICIAL_PADRAO = 150;

const TITULOS = { menu: 'Sistema de Itens', comprar: 'Loja do Comerciante', vender: 'Vender Itens' };

const LojaModal = ({ open, onClose, personagem, onSave }) => {
  const [view, setView] = useState('menu');
  const [itensInventario, setItensInventario] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [receitasInventario, setReceitasInventario] = useState([]);
  const [catalogoReceitas, setCatalogoReceitas] = useState([]);
  const [definirRokmasAberto, setDefinirRokmasAberto] = useState(false);
  const { executar } = useSaving();

  const saldoRokmas = personagem.lojaRokmas?.saldoRokmas ?? SALDO_INICIAL_PADRAO;
  const historicoCompras = useMemo(
    () => personagem.lojaRokmas?.historicoCompras ?? [],
    [personagem.lojaRokmas?.historicoCompras],
  );

  const carregarItensInventario = useCallback(async () => {
    const itens = await getItensInventario(personagem.id);
    setItensInventario(itens);
  }, [personagem.id]);

  const carregarReceitasInventario = useCallback(async () => {
    setReceitasInventario(await getReceitasInventario(personagem.id));
  }, [personagem.id]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setView('menu');
    carregarItensInventario();
    carregarReceitasInventario();
  }, [open, carregarItensInventario, carregarReceitasInventario]);

  useEffect(() => {
    if (!open || !personagem.universo) {
      setCatalogo([]);
      return undefined;
    }
    let isMounted = true;
    getItensPorUniverso(personagem.universo)
      .then(itens => {
        if (isMounted) {
          setCatalogo(itens);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar itens da loja:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [open, personagem.universo]);

  useEffect(() => {
    if (!open || !personagem.universo) {
      setCatalogoReceitas([]);
      return undefined;
    }
    let isMounted = true;
    getReceitasPorUniverso(personagem.universo)
      .then(receitas => {
        if (isMounted) {
          setCatalogoReceitas(receitas);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar receitas da loja:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [open, personagem.universo]);

  const primariosTotais = calcularPrimariosTotais(
    personagem.atributosBase,
    personagem.atributosExtra,
    personagem.atributosBonus,
  );
  const itensParaEspaco = itensInventario.map(item => ({
    espaco: item.pesoUnitario ?? 0,
    bonusEspaco: item.bonusEspaco ?? 0,
    quantidade: item.quantidade,
    equipado: item.equipado,
  }));
  const espaco = calcularEspacoInventario(primariosTotais, itensParaEspaco);

  const catalogoPorId = useMemo(() => new Map(catalogo.map(item => [item.id, item])), [catalogo]);
  const catalogoReceitasPorId = useMemo(
    () => new Map(catalogoReceitas.map(receita => [receita.id, receita])),
    [catalogoReceitas],
  );

  const posseComPorItemId = useMemo(() => {
    const mapa = {};
    itensInventario.forEach(item => {
      if (item.itemId) {
        mapa[item.itemId] = (mapa[item.itemId] ?? 0) + (item.quantidade ?? 0);
      }
    });
    return mapa;
  }, [itensInventario]);

  const registrarHistorico = useCallback(
    (tipo, itemNome, valor) =>
      [{ tipo, itemNome, valor, data: new Date().toISOString() }, ...historicoCompras].slice(0, 20),
    [historicoCompras],
  );

  const handleComprar = useCallback(
    (item, quantidade) => {
      const total = (item.precoCompra ?? 0) * quantidade;
      return executar(async () => {
        await addItemInventario(personagem.id, {
          origem: 'catalogo',
          itemId: item.id,
          nome: getNome(item),
          quantidade,
          equipado: false,
          ...extrairCamposItem(item),
        });
        await onSave({
          lojaRokmas: { saldoRokmas: saldoRokmas - total, historicoCompras: registrarHistorico('compra', getNome(item), -total) },
        });
        await carregarItensInventario();
      });
    },
    [personagem.id, saldoRokmas, onSave, executar, carregarItensInventario, registrarHistorico],
  );

  const handleVender = useCallback(
    (itemInventario, quantidade) => {
      const itemCatalogo = itemInventario.itemId ? catalogoPorId.get(itemInventario.itemId) : null;
      const total = (itemCatalogo?.precoVenda ?? 0) * quantidade;
      const restante = itemInventario.quantidade - quantidade;
      return executar(async () => {
        if (restante > 0) {
          await updateItemInventario(personagem.id, itemInventario.id, { quantidade: restante });
        } else {
          await removeItemInventario(personagem.id, itemInventario.id);
        }
        await onSave({
          lojaRokmas: {
            saldoRokmas: saldoRokmas + total,
            historicoCompras: registrarHistorico('venda', getNome(itemInventario) || 'Item', total),
          },
        });
        await carregarItensInventario();
      });
    },
    [personagem.id, saldoRokmas, catalogoPorId, onSave, executar, carregarItensInventario, registrarHistorico],
  );

  const handleVenderReceita = useCallback(
    (receitaInventario, quantidade) => {
      const receitaCatalogo = receitaInventario.receitaId ? catalogoReceitasPorId.get(receitaInventario.receitaId) : null;
      const total = (Number(receitaCatalogo?.valorVenda) || 0) * quantidade;
      const restante = receitaInventario.quantidade - quantidade;
      return executar(async () => {
        if (restante > 0) {
          await updateReceitaInventario(personagem.id, receitaInventario.id, { quantidade: restante });
        } else {
          await removeReceitaInventario(personagem.id, receitaInventario.id);
        }
        await onSave({
          lojaRokmas: {
            saldoRokmas: saldoRokmas + total,
            historicoCompras: registrarHistorico('venda', getNome(receitaInventario) || 'Receita', total),
          },
        });
        await carregarReceitasInventario();
      });
    },
    [personagem.id, saldoRokmas, catalogoReceitasPorId, onSave, executar, carregarReceitasInventario, registrarHistorico],
  );

  const handleDefinirRokmas = useCallback(
    novoSaldo =>
      executar(async () => {
        await onSave({ lojaRokmas: { saldoRokmas: novoSaldo, historicoCompras } });
        setDefinirRokmasAberto(false);
      }),
    [onSave, historicoCompras, executar],
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={view === 'menu' ? 'xs' : 'lg'}>
      <DialogHeaderRow>
        <DialogHeaderTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StorefrontIcon fontSize="small" /> {TITULOS[view]}
        </DialogHeaderTitle>
        <SaldoBadge>
          <PaidIcon fontSize="inherit" />
          Rokmas: {saldoRokmas}
        </SaldoBadge>
        <div style={{ display: 'flex', gap: 8 }}>
          {view !== 'menu' && (
            <DialogFecharButton type="button" aria-label="Voltar" onClick={() => setView('menu')}>
              <ArrowBackIcon fontSize="small" />
            </DialogFecharButton>
          )}
          <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </DialogFecharButton>
        </div>
      </DialogHeaderRow>

      <DialogContent>
        {view === 'menu' && (
          <LojaRokmasMenu
            saldoRokmas={saldoRokmas}
            onDefinirRokmas={() => setDefinirRokmasAberto(true)}
            onAbrirLoja={() => setView('comprar')}
            onVenderItens={() => setView('vender')}
          />
        )}
        {view === 'comprar' && (
          <LojaComprarView
            personagem={personagem}
            catalogo={catalogo}
            saldoRokmas={saldoRokmas}
            espacoLivre={espaco.espacoLivre}
            posseComPorItemId={posseComPorItemId}
            onComprar={handleComprar}
          />
        )}
        {view === 'vender' && (
          <LojaVenderView
            itensInventario={itensInventario}
            catalogoPorId={catalogoPorId}
            onVender={handleVender}
            receitasInventario={receitasInventario}
            catalogoReceitasPorId={catalogoReceitasPorId}
            onVenderReceita={handleVenderReceita}
          />
        )}
      </DialogContent>

      <DefinirRokmasDialog
        open={definirRokmasAberto}
        saldoAtual={saldoRokmas}
        onConfirmar={handleDefinirRokmas}
        onClose={() => setDefinirRokmasAberto(false)}
      />
    </Dialog>
  );
};

LojaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default LojaModal;
