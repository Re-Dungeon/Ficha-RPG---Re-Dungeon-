import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { getRegrasPorUniverso } from 'service/storage';
import { getNome } from 'common/utils/resolveNome';

import { PowerCombatBadge, SectionTitle, StatusValueRow } from '../styles';
import {
  BadgesRow,
  ExemploBox,
  MetaCard,
  MetaGrid,
  MetaLabel,
  MetaValor,
  RegraImagem,
  RegraResumo,
  RegraSecaoTitulo,
  RegraTexto,
  RegraTopo,
  ResultadoCard,
  ResultadoRow,
} from '../codex/styles';

const CAMPOS_META = [
  { chave: 'custo', rotulo: 'Custo' },
  { chave: 'limite', rotulo: 'Limite' },
  { chave: 'requisitos', rotulo: 'Requisitos' },
  { chave: 'dadosUtilizados', rotulo: 'Dados utilizados' },
];

const CodexTab = ({ personagem }) => {
  const [regras, setRegras] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!personagem.universo) {
      setRegras([]);
      setCarregando(false);
      return undefined;
    }
    let isMounted = true;
    setCarregando(true);
    getRegrasPorUniverso(personagem.universo)
      .then(itens => {
        if (isMounted) {
          setRegras(itens);
          setCarregando(false);
        }
      })
      .catch(erro => {
        if (isMounted) {
          // eslint-disable-next-line no-console
          console.error('Falha ao carregar regras:', erro);
          setCarregando(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [personagem.universo]);

  return (
    <div>
      {!personagem.universo && (
        <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
          Selecione um Universo no menu lateral Info para ver as regras deste universo.
        </StatusValueRow>
      )}

      {personagem.universo && !carregando && regras.length === 0 && (
        <StatusValueRow style={{ display: 'block', marginTop: 8 }}>
          Nenhuma regra cadastrada para este universo ainda.
        </StatusValueRow>
      )}

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {regras.map(regra => {
          const semConteudo =
            !regra.descricaoCurta &&
            !regra.comoFunciona &&
            !regra.exemplo &&
            !regra.sucesso &&
            !regra.falha &&
            CAMPOS_META.every(({ chave }) => !regra[chave]);

          return (
            <Accordion
              key={regra.id}
              sx={{
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                '&::before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'var(--text-secondary)' }} />}
              >
                {getNome(regra)}
              </AccordionSummary>
              <AccordionDetails
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <RegraTopo>
                  {regra.linkImagem && <RegraImagem src={regra.linkImagem} alt="" />}
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}
                  >
                    {regra.descricaoCurta && (
                      <RegraResumo>{regra.descricaoCurta}</RegraResumo>
                    )}
                    {(regra.categoria || regra.tipo || regra.complexidade) && (
                      <BadgesRow>
                        {regra.categoria && (
                          <PowerCombatBadge>{regra.categoria}</PowerCombatBadge>
                        )}
                        {regra.tipo && <PowerCombatBadge>{regra.tipo}</PowerCombatBadge>}
                        {regra.complexidade && (
                          <PowerCombatBadge>{regra.complexidade}</PowerCombatBadge>
                        )}
                      </BadgesRow>
                    )}
                  </div>
                </RegraTopo>

                {regra.comoFunciona && (
                  <div>
                    <RegraSecaoTitulo>Como funciona</RegraSecaoTitulo>
                    <RegraTexto>{regra.comoFunciona}</RegraTexto>
                  </div>
                )}

                {regra.exemplo && (
                  <div>
                    <RegraSecaoTitulo>Exemplo</RegraSecaoTitulo>
                    <ExemploBox>
                      <RegraTexto style={{ margin: 0 }}>{regra.exemplo}</RegraTexto>
                    </ExemploBox>
                  </div>
                )}

                {(regra.sucesso || regra.falha) && (
                  <ResultadoRow>
                    {regra.sucesso && (
                      <ResultadoCard $variante="sucesso">
                        <RegraSecaoTitulo>Sucesso</RegraSecaoTitulo>
                        <RegraTexto>{regra.sucesso}</RegraTexto>
                      </ResultadoCard>
                    )}
                    {regra.falha && (
                      <ResultadoCard $variante="falha">
                        <RegraSecaoTitulo>Falha</RegraSecaoTitulo>
                        <RegraTexto>{regra.falha}</RegraTexto>
                      </ResultadoCard>
                    )}
                  </ResultadoRow>
                )}

                {CAMPOS_META.some(({ chave }) => regra[chave]) && (
                  <MetaGrid>
                    {CAMPOS_META.filter(({ chave }) => regra[chave]).map(
                      ({ chave, rotulo }) => (
                        <MetaCard key={chave}>
                          <MetaLabel>{rotulo}</MetaLabel>
                          <MetaValor>{regra[chave]}</MetaValor>
                        </MetaCard>
                      ),
                    )}
                  </MetaGrid>
                )}

                {semConteudo && (
                  <StatusValueRow
                    style={{ display: 'block', color: 'var(--text-secondary)' }}
                  >
                    Sem conteúdo.
                  </StatusValueRow>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
};

CodexTab.propTypes = {
  personagem: PropTypes.object.isRequired,
};

export default CodexTab;
