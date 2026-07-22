import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

import { getNome } from 'common/utils/resolveNome';

import { corDivindade } from './constants';
import {
  NucleoDialogContagem,
  NucleoDialogRodape,
  NucleoDialogSubtitulo,
  NucleoDialogTitulo,
  NucleoGrupo,
  NucleoGrupoContagem,
  NucleoGrupoHeader,
  NucleoGrupoNome,
  NucleoVazio,
  NucleoVeiaCard,
  NucleoVeiaCheck,
  NucleoVeiaIcone,
  NucleoVeiaNivel,
  NucleoVeiaNome,
  NucleoVeiaTexto,
} from './styles';
import { DialogFecharButton, DialogHeaderRow, DialogHeaderTitle } from '../styles';

// Resumo somente-leitura de todos os aprimoramentos ativos, agrupados por
// divindade — versão web do "clicar no cristal central" descrito em
// FUNCIONALIDADES.md §20.
const NucleoCentralModal = ({ open, grupos, idsDesbloqueados, onClose }) => {
  const gruposComDesbloqueadas = useMemo(
    () =>
      grupos
        .map(grupo => ({
          ...grupo,
          veiasDesbloqueadas: grupo.veias.filter(no => idsDesbloqueados.includes(no.id)),
        }))
        .filter(grupo => grupo.veiasDesbloqueadas.length > 0),
    [grupos, idsDesbloqueados],
  );

  const total = gruposComDesbloqueadas.reduce((soma, grupo) => soma + grupo.veiasDesbloqueadas.length, 0);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogHeaderRow>
        <DialogHeaderTitle style={{ flex: 1 }}>✨ Núcleo Central</DialogHeaderTitle>
        <DialogFecharButton type="button" aria-label="Fechar" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </DialogFecharButton>
      </DialogHeaderRow>

      <DialogContent>
        <NucleoDialogSubtitulo>
          <NucleoDialogTitulo>Aprimoramentos Astrais</NucleoDialogTitulo>
          <NucleoDialogContagem>{total} aprimoramento(s) ativo(s)</NucleoDialogContagem>
        </NucleoDialogSubtitulo>

        {gruposComDesbloqueadas.length === 0 ? (
          <NucleoVazio>Nenhuma veia astral desbloqueada ainda.</NucleoVazio>
        ) : (
          gruposComDesbloqueadas.map(grupo => {
            const cor = corDivindade(grupo.divindade);
            return (
              <NucleoGrupo key={grupo.divindadeId} $cor={cor}>
                <NucleoGrupoHeader>
                  <NucleoGrupoNome $cor={cor}>{getNome(grupo.divindade) || 'Divindade'}</NucleoGrupoNome>
                  <NucleoGrupoContagem>{grupo.veiasDesbloqueadas.length}</NucleoGrupoContagem>
                </NucleoGrupoHeader>

                {grupo.veiasDesbloqueadas.map(no => (
                  <NucleoVeiaCard key={no.id}>
                    <NucleoVeiaCheck>
                      <CheckCircleIcon fontSize="inherit" />
                    </NucleoVeiaCheck>
                    <NucleoVeiaIcone $cor={cor}>
                      {no.linkImagem ? <img src={no.linkImagem} alt="" /> : <AutoAwesomeIcon fontSize="inherit" />}
                    </NucleoVeiaIcone>
                    <NucleoVeiaTexto>
                      <NucleoVeiaNome $cor={cor}>{no.nome}</NucleoVeiaNome>
                      <NucleoVeiaNivel>(Nível {no.nivel ?? '-'})</NucleoVeiaNivel>
                      {no.aprimoramento && <div>{no.aprimoramento}</div>}
                    </NucleoVeiaTexto>
                  </NucleoVeiaCard>
                ))}
              </NucleoGrupo>
            );
          })
        )}

        {gruposComDesbloqueadas.length > 0 && (
          <NucleoDialogRodape>
            Total: <strong>{total}</strong> aprimoramento(s) ativo(s)
          </NucleoDialogRodape>
        )}
      </DialogContent>
    </Dialog>
  );
};

NucleoCentralModal.propTypes = {
  open: PropTypes.bool.isRequired,
  grupos: PropTypes.array.isRequired,
  idsDesbloqueados: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NucleoCentralModal;
