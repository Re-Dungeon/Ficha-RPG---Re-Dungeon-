import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import PetsIcon from '@mui/icons-material/Pets';

import { useAuth } from 'context/AuthContext';
import { getCompanheiros, getPersonagem } from 'service/storage';

import CompanheiroCard from '../companheiro/CompanheiroCard';
import CriarCompanheiroModal from '../companheiro/CriarCompanheiroModal';
import { CompanheiroGrid } from '../companheiro/styles';
import { SectionTitle, StatusValueRow } from '../styles';

const CompanheiroTab = ({ personagem }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [companheiros, setCompanheiros] = useState([]);
  const [personagemBase, setPersonagemBase] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getCompanheiros(currentUser.uid, personagem.id)
      .then(itens => {
        if (isMounted) {
          setCompanheiros(itens);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar companheiros:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [currentUser.uid, personagem.id]);

  useEffect(() => {
    let isMounted = true;
    if (!personagem.companheiroDe) {
      setPersonagemBase(null);
      return undefined;
    }
    getPersonagem(personagem.companheiroDe)
      .then(item => {
        if (isMounted) {
          setPersonagemBase(item);
        }
      })
      .catch(erro => {
        // eslint-disable-next-line no-console
        console.error('Falha ao carregar personagem base do companheiro:', erro);
      });
    return () => {
      isMounted = false;
    };
  }, [personagem.companheiroDe]);

  const handleAbrirPersonagem = useCallback(
    personagemId => {
      navigate(`/personagens/${personagemId}`);
    },
    [navigate],
  );

  const semNenhum = companheiros.length === 0 && !personagemBase;

  return (
    <div>
      <SectionTitle>Companheiro</SectionTitle>

      <div style={{ marginTop: 16 }}>
        <Button variant="contained" startIcon={<PetsIcon />} onClick={() => setModalAberto(true)}>
          Criar Companheiro
        </Button>
      </div>

      {semNenhum && (
        <StatusValueRow style={{ display: 'block', marginTop: 16 }}>
          Nenhum companheiro cadastrado ainda.
        </StatusValueRow>
      )}

      <CompanheiroGrid>
        {personagemBase && (
          <CompanheiroCard
            personagem={personagemBase}
            badge="Ficha Principal"
            onClick={() => handleAbrirPersonagem(personagemBase.id)}
          />
        )}
        {companheiros.map(companheiro => (
          <CompanheiroCard
            key={companheiro.id}
            personagem={companheiro}
            badge="Companheiro"
            onClick={() => handleAbrirPersonagem(companheiro.id)}
          />
        ))}
      </CompanheiroGrid>

      <CriarCompanheiroModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        personagem={personagem}
      />
    </div>
  );
};

CompanheiroTab.propTypes = {
  personagem: PropTypes.object.isRequired,
};

export default CompanheiroTab;
