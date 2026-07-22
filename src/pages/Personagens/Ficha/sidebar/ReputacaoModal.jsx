import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

import { getOrigensPorUniverso } from 'service/storage';
import { calcularEfeitosReputacao } from 'common/utils/formulas';
import { getNome } from 'common/utils/resolveNome';
import { useSaving } from 'context/SavingContext';

import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle, StatusValueRow } from '../styles';
import OrigemReputacaoCard from '../reputacao/OrigemReputacaoCard';
import {
  OrigemGrid,
  ReputacaoDescricaoBox,
  ReputacaoDetalheImagem,
  ReputacaoDetalheTopo,
  ReputacaoEfeitoItem,
  ReputacaoEfeitoQuantidade,
  ReputacaoEfeitosLista,
  ReputacaoEfeitosVazio,
  ReputacaoEixoCard,
  ReputacaoEixoHeader,
  ReputacaoEixosGrid,
} from '../reputacao/styles';

const EIXOS = [
  { chave: 'fama', titulo: 'Fama', Icon: MilitaryTechIcon },
  { chave: 'terror', titulo: 'Terror', Icon: SentimentVeryDissatisfiedIcon },
];

const ReputacaoModal = ({ open, onClose, personagem, onSave }) => {
  const [origens, setOrigens] = useState([]);
  const [view, setView] = useState('grid');
  const [origemSelecionadaId, setOrigemSelecionadaId] = useState(null);
  const [valores, setValores] = useState({ fama: 0, terror: 0 });
  const { executar } = useSaving();

  const reputacoes = useMemo(() => personagem.reputacoes ?? {}, [personagem.reputacoes]);

  useEffect(() => {
    if (!open || !personagem.universo) {
      setOrigens([]);
      return undefined;
    }
    let isMounted = true;
    getOrigensPorUniverso(personagem.universo)
      .then(itens => {
        if (isMounted) {
          setOrigens(itens);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar origens:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [open, personagem.universo]);

  useEffect(() => {
    if (open) {
      setView('grid');
      setOrigemSelecionadaId(null);
    }
  }, [open]);

  const origemSelecionada = origens.find(item => item.id === origemSelecionadaId) ?? null;

  useEffect(() => {
    if (!origemSelecionada) {
      return;
    }
    const atual = reputacoes[origemSelecionada.id] ?? {};
    setValores({ fama: atual.fama ?? 0, terror: atual.terror ?? 0 });
  }, [origemSelecionada, reputacoes]);

  const handleAbrirOrigem = useCallback(id => {
    setOrigemSelecionadaId(id);
    setView('detalhe');
  }, []);

  const handleSalvar = useCallback(
    () =>
      executar(() =>
        onSave({
          reputacoes: { ...reputacoes, [origemSelecionada.id]: { ...valores } },
        }),
      ),
    [origemSelecionada, reputacoes, valores, onSave, executar],
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={view === 'grid' ? 'lg' : 'md'}>
      <DialogHeaderRow>
        <DialogHeaderTitle>{view === 'grid' ? 'Reputação' : getNome(origemSelecionada) || 'Reputação'}</DialogHeaderTitle>
        <div style={{ display: 'flex', gap: 8 }}>
          {view === 'detalhe' && (
            <DialogFecharButton type="button" aria-label="Voltar" onClick={() => setView('grid')}>
              <ArrowBackIcon fontSize="small" />
            </DialogFecharButton>
          )}
          <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </DialogFecharButton>
        </div>
      </DialogHeaderRow>

      <DialogContent>
        {!personagem.universo && (
          <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
            Selecione um Universo no menu lateral Info primeiro.
          </StatusValueRow>
        )}

        {personagem.universo && view === 'grid' && (
          <OrigemGrid>
            {origens.map(origem => (
              <OrigemReputacaoCard
                key={origem.id}
                origem={origem}
                fama={reputacoes[origem.id]?.fama ?? 0}
                terror={reputacoes[origem.id]?.terror ?? 0}
                onClick={() => handleAbrirOrigem(origem.id)}
              />
            ))}
            {origens.length === 0 && (
              <StatusValueRow style={{ display: 'block' }}>Nenhuma origem cadastrada para este universo.</StatusValueRow>
            )}
          </OrigemGrid>
        )}

        {view === 'detalhe' && origemSelecionada && (
          <>
            <ReputacaoDetalheTopo>
              {origemSelecionada.linkImagem && <ReputacaoDetalheImagem src={origemSelecionada.linkImagem} alt="" />}
              <ReputacaoDescricaoBox>{origemSelecionada.descricao || 'Sem descrição cadastrada.'}</ReputacaoDescricaoBox>
            </ReputacaoDetalheTopo>

            <ReputacaoEixosGrid>
              {EIXOS.map(({ chave, titulo, Icon }) => {
                const efeitos = calcularEfeitosReputacao(origemSelecionada.reputacao?.[chave], valores[chave]);
                return (
                  <ReputacaoEixoCard key={chave} $variante={chave}>
                    <ReputacaoEixoHeader $variante={chave}>
                      <Icon fontSize="inherit" /> {titulo}
                    </ReputacaoEixoHeader>
                    <TextField
                      type="number"
                      label={`${titulo} atual`}
                      size="small"
                      value={valores[chave]}
                      onChange={event =>
                        setValores(current => ({
                          ...current,
                          [chave]: Math.max(0, Number(event.target.value) || 0),
                        }))
                      }
                      slotProps={{ htmlInput: { min: 0 } }}
                      sx={{ maxWidth: 160 }}
                    />
                    <ReputacaoEfeitosLista>
                      {efeitos.desbloqueados.map(efeito => (
                        <ReputacaoEfeitoItem key={efeito.quantidade} $desbloqueado>
                          <CheckCircleIcon fontSize="inherit" />
                          <span>
                            <ReputacaoEfeitoQuantidade>{efeito.quantidade}: </ReputacaoEfeitoQuantidade>
                            {efeito.efeito}
                          </span>
                        </ReputacaoEfeitoItem>
                      ))}
                      {efeitos.proximo && (
                        <ReputacaoEfeitoItem $desbloqueado={false}>
                          <LockIcon fontSize="inherit" />
                          <span>
                            <ReputacaoEfeitoQuantidade>{efeitos.proximo.quantidade}: </ReputacaoEfeitoQuantidade>
                            {efeitos.proximo.efeito}
                          </span>
                        </ReputacaoEfeitoItem>
                      )}
                    </ReputacaoEfeitosLista>
                    {efeitos.desbloqueados.length === 0 && !efeitos.proximo && (
                      <ReputacaoEfeitosVazio>Nenhum efeito de {titulo.toLowerCase()} cadastrado para esta origem.</ReputacaoEfeitosVazio>
                    )}
                  </ReputacaoEixoCard>
                );
              })}
            </ReputacaoEixosGrid>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <Button variant="contained" onClick={handleSalvar}>
                Salvar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

ReputacaoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ReputacaoModal;
