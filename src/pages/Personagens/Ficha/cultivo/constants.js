// ID fixo do documento "Cultivo" na coleção de referência `Universo` (Firestore
// compartilhado). Confirmado por inspeção read-only em 2026-07-23: é o único doc
// de `Universo` com o campo `SubUniversos` (lista dos sistemas de cultivo, ex.:
// "Doupo Cangqiong"). Usado para decidir quando mostrar o item "Cultivo" no menu
// lateral da ficha — o botão só aparece quando `personagem.universo` bate com ele.
export const CULTIVO_UNIVERSO_ID = 'UtOOq82CdIb7WlMaygsn';
