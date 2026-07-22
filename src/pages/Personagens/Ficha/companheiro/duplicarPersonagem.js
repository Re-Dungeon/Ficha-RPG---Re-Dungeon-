import {
  addPersonagem,
  getAptidoesAdquiridas,
  setAptidaoAdquirida,
  getNucleos,
  addNucleo,
  getArts,
  addArt,
  getVariantes,
  addVariante,
  getItensInventario,
  addItemInventario,
  getMateriaisInventario,
  addMaterialInventario,
  getReceitasInventario,
  addReceitaInventario,
} from 'service/storage';

const CAMPOS_NAO_DUPLICADOS = ['id', 'createdAt', 'updatedAt', 'uid', 'companheiroDe'];

// Duplica um personagem inteiro (doc principal + subcoleções de aptidões,
// núcleos/arts/variantes e inventário) como base pra um novo Companheiro.
// `historicoSorte` não é copiado — é um log transiente, não faz sentido
// herdar rolagens antigas. Núcleos e Arts recebem ids novos ao serem
// duplicados, então `nucleoId`/`artId` das Arts/Variantes precisam ser
// remapeados pros novos ids em vez de manter os ids do personagem original.
export const duplicarPersonagem = async (personagemBase, { uid, nome, companheiroDe }) => {
  const dadosBase = Object.fromEntries(
    Object.entries(personagemBase).filter(([campo]) => !CAMPOS_NAO_DUPLICADOS.includes(campo)),
  );

  const novoId = await addPersonagem({ ...dadosBase, nome, uid, companheiroDe });

  const [aptidoes, nucleos, arts, variantes, itens, materiais, receitas] = await Promise.all([
    getAptidoesAdquiridas(personagemBase.id),
    getNucleos(personagemBase.id),
    getArts(personagemBase.id),
    getVariantes(personagemBase.id),
    getItensInventario(personagemBase.id),
    getMateriaisInventario(personagemBase.id),
    getReceitasInventario(personagemBase.id),
  ]);

  await Promise.all([
    ...aptidoes.map(({ id, nivel }) => setAptidaoAdquirida(novoId, id, nivel)),
    ...itens.map(({ id: _id, ...dados }) => addItemInventario(novoId, dados)),
    ...materiais.map(({ id: _id, ...dados }) => addMaterialInventario(novoId, dados)),
    ...receitas.map(({ id: _id, ...dados }) => addReceitaInventario(novoId, dados)),
  ]);

  const nucleoIdMap = new Map();
  await Promise.all(
    nucleos.map(async ({ id, ...dados }) => {
      const ref = await addNucleo(novoId, dados);
      nucleoIdMap.set(id, ref.id);
    }),
  );

  const artIdMap = new Map();
  await Promise.all(
    arts.map(async ({ id, nucleoId, ...dados }) => {
      const ref = await addArt(novoId, { ...dados, nucleoId: nucleoIdMap.get(nucleoId) ?? nucleoId });
      artIdMap.set(id, ref.id);
    }),
  );

  await Promise.all(
    variantes.map(({ id: _id, artId, ...dados }) =>
      addVariante(novoId, { ...dados, artId: artIdMap.get(artId) ?? artId }),
    ),
  );

  return novoId;
};
