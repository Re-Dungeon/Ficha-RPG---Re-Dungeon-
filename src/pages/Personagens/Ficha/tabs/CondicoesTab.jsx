import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';

import { getCondicoesPorUniverso } from 'service/storage';

import { AtributoCardWrapper, CardTitle, SectionTitle, StatusValueRow } from '../styles';

const hoje = () => new Date().toISOString().slice(0, 10);

const CondicoesTab = ({ personagem, onSave }) => {
  const [catalogo, setCatalogo] = useState([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (!personagem.universo) {
      setCatalogo([]);
      return undefined;
    }
    let isMounted = true;
    getCondicoesPorUniverso(personagem.universo).then(itens => {
      if (isMounted) {
        setCatalogo(itens);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [personagem.universo]);

  const condicoesAtivas = useMemo(
    () => personagem.condicoesAtivas ?? [],
    [personagem.condicoesAtivas],
  );

  const handleAdicionar = useCallback(
    async condicaoId => {
      const existente = condicoesAtivas.find(item => item.condicaoId === condicaoId);
      const novaLista = existente
        ? condicoesAtivas.map(item =>
            item.condicaoId === condicaoId
              ? { ...item, stack: (item.stack ?? 1) + 1 }
              : item,
          )
        : [
            ...condicoesAtivas,
            { condicaoId, stack: 1, duracaoRestante: null, aplicadoEm: hoje() },
          ];

      await onSave({ condicoesAtivas: novaLista });
    },
    [condicoesAtivas, onSave],
  );

  const handleRemover = useCallback(
    async condicaoId => {
      await onSave({
        condicoesAtivas: condicoesAtivas.filter(item => item.condicaoId !== condicaoId),
      });
    },
    [condicoesAtivas, onSave],
  );

  const handleAlterarDuracao = useCallback(
    async (condicaoId, duracaoRestante) => {
      await onSave({
        condicoesAtivas: condicoesAtivas.map(item =>
          item.condicaoId === condicaoId ? { ...item, duracaoRestante } : item,
        ),
      });
    },
    [condicoesAtivas, onSave],
  );

  const catalogoFiltrado = catalogo.filter(item =>
    (item.Nome ?? '').toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div>
      <SectionTitle>
        Condições
        <Button variant="contained" size="small" onClick={() => setDialogAberto(true)}>
          + Adicionar Condição
        </Button>
      </SectionTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {condicoesAtivas.length === 0 && (
          <StatusValueRow>Nenhuma condição ativa no momento.</StatusValueRow>
        )}
        {condicoesAtivas.map(ativo => {
          const nomeCondicao = catalogo.find(item => item.id === ativo.condicaoId)?.Nome
            ?? 'Condição';

          return (
            <AtributoCardWrapper
              key={ativo.condicaoId}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: '12px 16px' }}
            >
              <CardTitle style={{ flex: 1 }}>
                {nomeCondicao} {ativo.stack > 1 ? `(x${ativo.stack})` : ''}
              </CardTitle>
              <TextField
                type="number"
                label="Duração (turnos)"
                size="small"
                value={ativo.duracaoRestante ?? ''}
                onChange={event =>
                  handleAlterarDuracao(
                    ativo.condicaoId,
                    event.target.value === '' ? null : Number(event.target.value),
                  )
                }
                sx={{ width: 140 }}
              />
              <IconButton
                aria-label={`Remover ${nomeCondicao}`}
                onClick={() => handleRemover(ativo.condicaoId)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </AtributoCardWrapper>
          );
        })}
      </div>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar Condição</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar condição..."
            value={busca}
            onChange={event => setBusca(event.target.value)}
            sx={{ marginBottom: 2, marginTop: 1 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {catalogoFiltrado.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 8,
                }}
              >
                <span>{item.Nome}</span>
                <Button size="small" onClick={() => handleAdicionar(item.id)}>
                  Adicionar
                </Button>
              </div>
            ))}
            {catalogoFiltrado.length === 0 && (
              <StatusValueRow>
                {personagem.universo
                  ? 'Nenhuma condição encontrada.'
                  : 'Defina o Universo do personagem na aba Progressão primeiro.'}
              </StatusValueRow>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

CondicoesTab.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default CondicoesTab;
