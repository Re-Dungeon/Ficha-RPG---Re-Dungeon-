import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

import { getClassesPorUniverso } from 'service/storage';
import { resolveNome } from 'common/utils/resolveNome';

import { SectionTitle, StatusValueRow } from '../styles';

const MARCOS_PC = [100, 200, 300];
const MAX_CLASSES = 3;

const ClassesSection = ({ personagem, onSave, powerCombat }) => {
  const [classes, setClasses] = useState([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (!personagem.universo) {
      setClasses([]);
      return undefined;
    }
    let isMounted = true;
    getClassesPorUniverso(personagem.universo).then(itens => {
      if (isMounted) {
        setClasses(itens);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [personagem.universo]);

  const classesSelecionadas = useMemo(() => personagem.classes ?? [], [personagem.classes]);

  const handleToggle = useCallback(
    async classeId => {
      const jaSelecionada = classesSelecionadas.includes(classeId);
      if (!jaSelecionada && classesSelecionadas.length >= MAX_CLASSES) {
        return;
      }
      const nova = jaSelecionada
        ? classesSelecionadas.filter(id => id !== classeId)
        : [...classesSelecionadas, classeId];
      await onSave({ classes: nova });
    },
    [classesSelecionadas, onSave],
  );

  const nomesSelecionados = classesSelecionadas
    .map(id => resolveNome(classes, id))
    .filter(Boolean);

  const classesFiltradas = classes.filter(item =>
    (item.Nome ?? '').toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div>
      <SectionTitle>
        Classes (multiclasse até {MAX_CLASSES})
        <Button
          size="small"
          variant="outlined"
          disabled={!personagem.universo}
          onClick={() => setDialogAberto(true)}
        >
          Gerenciar Classes
        </Button>
      </SectionTitle>

      {!personagem.universo && (
        <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
          Selecione um Universo primeiro.
        </StatusValueRow>
      )}

      <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
        {nomesSelecionados.length > 0 ? nomesSelecionados.join(' ➠ ') : 'Nenhuma classe escolhida.'}
      </StatusValueRow>

      <div style={{ marginTop: 24 }}>
        <StatusValueRow>
          Progressão por Power Combat ({powerCombat}) — apenas informativa, não trava a escolha
        </StatusValueRow>
        <div
          style={{
            position: 'relative',
            height: 10,
            background: 'var(--border-primary)',
            borderRadius: 6,
            marginTop: 20,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: `${Math.min(100, (powerCombat / 300) * 100)}%`,
              background: 'var(--color-primary)',
              borderRadius: 6,
            }}
          />
          {MARCOS_PC.map(marco => (
            <div
              key={marco}
              style={{
                position: 'absolute',
                left: `${(marco / 300) * 100}%`,
                top: -18,
                transform: 'translateX(-50%)',
                fontSize: 11,
                color: powerCombat >= marco ? 'var(--color-accent)' : 'var(--text-muted)',
              }}
            >
              {marco}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Gerenciar Classes</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar classe..."
            value={busca}
            onChange={event => setBusca(event.target.value)}
            sx={{ marginBottom: 2, marginTop: 1 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {classesFiltradas.map(item => {
              const selecionada = classesSelecionadas.includes(item.id);
              const bloqueada = !selecionada && classesSelecionadas.length >= MAX_CLASSES;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    border: `1px solid ${selecionada ? 'var(--color-accent)' : 'var(--border-primary)'}`,
                    borderRadius: 8,
                  }}
                >
                  <span>{item.Nome}</span>
                  <Button
                    size="small"
                    variant={selecionada ? 'contained' : 'outlined'}
                    disabled={bloqueada}
                    onClick={() => handleToggle(item.id)}
                  >
                    {selecionada ? 'Escolhida' : bloqueada ? '🔒 Limite atingido' : 'Escolher'}
                  </Button>
                </div>
              );
            })}
            {classesFiltradas.length === 0 && <StatusValueRow>Nenhuma classe encontrada.</StatusValueRow>}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

ClassesSection.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  powerCombat: PropTypes.number.isRequired,
};

export default ClassesSection;
