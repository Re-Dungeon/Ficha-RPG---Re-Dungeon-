import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

import { getRacasPorUniverso } from 'service/storage';
import { calcularLimiteHabilidadesBasicas } from 'common/utils/formulas';

import { AtributoCardWrapper, CardTitle, SectionTitle, StatusValueRow } from '../styles';

const RacaSection = ({ personagem, onSave }) => {
  const [racas, setRacas] = useState([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (!personagem.universo) {
      setRacas([]);
      return undefined;
    }
    let isMounted = true;
    getRacasPorUniverso(personagem.universo).then(itens => {
      if (isMounted) {
        setRacas(itens);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [personagem.universo]);

  const racaSelecionada = racas.find(item => item.id === personagem.raca);
  const habilidadesAtivas = useMemo(
    () => personagem.racaHabilidadesAtivas ?? [],
    [personagem.racaHabilidadesAtivas],
  );
  const limite = racaSelecionada ? calcularLimiteHabilidadesBasicas(racaSelecionada.raridade) : 0;

  const handleEscolher = useCallback(
    async racaId => {
      await onSave({ raca: racaId, racaHabilidadesAtivas: [] });
      setDialogAberto(false);
    },
    [onSave],
  );

  const handleToggleHabilidade = useCallback(
    async index => {
      const ativo = habilidadesAtivas.includes(index);
      if (!ativo && habilidadesAtivas.length >= limite) {
        return;
      }
      const nova = ativo
        ? habilidadesAtivas.filter(item => item !== index)
        : [...habilidadesAtivas, index];
      await onSave({ racaHabilidadesAtivas: nova });
    },
    [habilidadesAtivas, limite, onSave],
  );

  const racasFiltradas = racas.filter(item =>
    (item.Nome ?? '').toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div>
      <SectionTitle>
        Raça
        <Button
          size="small"
          variant="outlined"
          disabled={!personagem.universo}
          onClick={() => setDialogAberto(true)}
        >
          {racaSelecionada ? 'Trocar Raça' : 'Escolher Raça'}
        </Button>
      </SectionTitle>

      {!personagem.universo && (
        <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
          Selecione um Universo primeiro.
        </StatusValueRow>
      )}

      {racaSelecionada && (
        <AtributoCardWrapper style={{ marginTop: 12, alignItems: 'flex-start' }}>
          <CardTitle>{racaSelecionada.Nome}</CardTitle>
          {racaSelecionada.raridade && (
            <StatusValueRow>Raridade: {racaSelecionada.raridade}</StatusValueRow>
          )}
          {racaSelecionada.descricao && <StatusValueRow>{racaSelecionada.descricao}</StatusValueRow>}

          {Array.isArray(racaSelecionada.habilidadesBasicas) &&
            racaSelecionada.habilidadesBasicas.length > 0 && (
              <>
                <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
                  Habilidades básicas ativas: {habilidadesAtivas.length} /{' '}
                  {limite === Infinity ? '∞' : limite}
                </StatusValueRow>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, width: '100%' }}>
                  {racaSelecionada.habilidadesBasicas.map((habilidade, index) => {
                    const ativo = habilidadesAtivas.includes(index);
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 12,
                          padding: '8px 12px',
                          border: `1px solid ${ativo ? 'var(--color-accent)' : 'var(--border-primary)'}`,
                          borderRadius: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{habilidade.nome}</div>
                          {habilidade.descricao && (
                            <StatusValueRow>{habilidade.descricao}</StatusValueRow>
                          )}
                        </div>
                        <Button
                          size="small"
                          variant={ativo ? 'contained' : 'outlined'}
                          onClick={() => handleToggleHabilidade(index)}
                          disabled={!ativo && habilidadesAtivas.length >= limite}
                        >
                          {ativo ? 'Ativa' : 'Ativar'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
        </AtributoCardWrapper>
      )}

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Escolher Raça</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar raça..."
            value={busca}
            onChange={event => setBusca(event.target.value)}
            sx={{ marginBottom: 2, marginTop: 1 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {racasFiltradas.map(item => (
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
                <span>
                  {item.Nome} {item.raridade ? `· ${item.raridade}` : ''}
                </span>
                <Button size="small" onClick={() => handleEscolher(item.id)}>
                  Escolher
                </Button>
              </div>
            ))}
            {racasFiltradas.length === 0 && <StatusValueRow>Nenhuma raça encontrada.</StatusValueRow>}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

RacaSection.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default RacaSection;
