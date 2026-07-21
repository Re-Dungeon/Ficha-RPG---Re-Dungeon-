import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import CloseIcon from '@mui/icons-material/Close';

import { getAptidoesPorUniverso } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';

import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle, StatusValueRow } from '../styles';
import {
  DetalheDescricao,
  DetalheDivisor,
  DetalheHeader,
  DetalheIcone,
  DetalheNome,
  EnciclopediaCard,
  EnciclopediaGrid,
  EnciclopediaIcone,
  EnciclopediaNome,
  NiveisLista,
  NivelCard,
  NivelCurta,
  NivelHeader,
  NivelTexto,
  ProgressaoTitulo,
} from '../aptidoes/styles';

const AptidaoConsultaModal = ({ open, onClose, personagem }) => {
  const [catalogo, setCatalogo] = useState([]);
  const [busca, setBusca] = useState('');
  const [aptidaoSelecionada, setAptidaoSelecionada] = useState(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    if (!personagem.universo) {
      setCatalogo([]);
      return undefined;
    }
    let isMounted = true;
    getAptidoesPorUniverso(personagem.universo).then(itens => {
      if (isMounted) {
        setCatalogo(itens);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [open, personagem.universo]);

  useEffect(() => {
    if (open) {
      setBusca('');
      setAptidaoSelecionada(null);
    }
  }, [open]);

  const catalogoFiltrado = catalogo.filter(
    item =>
      getNome(item).toLowerCase().includes(busca.toLowerCase()) ||
      (item.descricao ?? '').toLowerCase().includes(busca.toLowerCase()),
  );

  const voltar = () => {
    if (aptidaoSelecionada) {
      setAptidaoSelecionada(null);
    } else {
      onClose();
    }
  };

  const niveis = [...(aptidaoSelecionada?.progressaoNiveis ?? [])].sort((a, b) => a.nivel - b.nivel);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogHeaderRow>
        <DialogHeaderTitle>{aptidaoSelecionada ? 'Detalhes da Aptidão' : 'Enciclopédia de Aptidões'}</DialogHeaderTitle>
        <div style={{ display: 'flex', gap: 8 }}>
          <DialogFecharButton type="button" aria-label="Voltar" onClick={voltar}>
            <KeyboardReturnIcon fontSize="small" />
          </DialogFecharButton>
          <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </DialogFecharButton>
        </div>
      </DialogHeaderRow>

      <DialogContent>
        {!aptidaoSelecionada && (
          <>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar aptidão por nome ou descrição..."
              value={busca}
              onChange={event => setBusca(event.target.value)}
              sx={{ marginBottom: 2, marginTop: 1 }}
            />

            {!personagem.universo && (
              <StatusValueRow style={{ display: 'block' }}>
                Selecione um Universo no menu lateral Info primeiro.
              </StatusValueRow>
            )}

            {personagem.universo && catalogoFiltrado.length === 0 && (
              <StatusValueRow style={{ display: 'block' }}>Nenhuma aptidão encontrada.</StatusValueRow>
            )}

            <EnciclopediaGrid>
              {catalogoFiltrado.map(item => (
                <EnciclopediaCard key={item.id}>
                  <EnciclopediaIcone src={item.linkImagem} alt="" />
                  <EnciclopediaNome>{getNome(item)}</EnciclopediaNome>
                  <Button
                    size="small"
                    fullWidth
                    onClick={() => setAptidaoSelecionada(item)}
                    sx={{
                      border: '1px solid var(--color-accent)',
                      color: 'var(--color-accent)',
                      background: 'rgba(91, 124, 250, 0.1)',
                    }}
                  >
                    Visualizar
                  </Button>
                </EnciclopediaCard>
              ))}
            </EnciclopediaGrid>
          </>
        )}

        {aptidaoSelecionada && (
          <div style={{ marginTop: 8 }}>
            <DetalheHeader>
              <DetalheIcone src={aptidaoSelecionada.linkImagem} alt="" />
              <div>
                <DetalheNome>{getNome(aptidaoSelecionada)}</DetalheNome>
                {aptidaoSelecionada.descricao && <DetalheDescricao>{aptidaoSelecionada.descricao}</DetalheDescricao>}
              </div>
            </DetalheHeader>

            <DetalheDivisor />

            <ProgressaoTitulo>Progressão de Níveis</ProgressaoTitulo>
            {niveis.length === 0 && <StatusValueRow>Sem níveis cadastrados.</StatusValueRow>}
            <NiveisLista>
              {niveis.map(nivelInfo => (
                <NivelCard key={nivelInfo.nivel}>
                  <NivelHeader>Nível {nivelInfo.nivel}</NivelHeader>
                  {nivelInfo.possuiBonus ? (
                    <>
                      <NivelTexto>{nivelInfo.bonus?.descricaoCompleta}</NivelTexto>
                      {nivelInfo.bonus?.descricaoCurta && <NivelCurta>{nivelInfo.bonus.descricaoCurta}</NivelCurta>}
                    </>
                  ) : (
                    <NivelTexto>+1 Bônus nos testes desta aptidão.</NivelTexto>
                  )}
                </NivelCard>
              ))}
            </NiveisLista>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

AptidaoConsultaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personagem: PropTypes.object.isRequired,
};

export default AptidaoConsultaModal;
