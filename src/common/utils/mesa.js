// Id da última mensagem da lista (null se vazia) — marca até onde já se viu.
export const idDaUltimaMensagem = mensagens => mensagens.at(-1)?.id ?? null;

// Mensagens que chegaram depois da última vista (`ultimaVistaId`), para o
// badge do "Chat" na mesa do celular. `undefined` = ainda sem marcador (0);
// `null` = não havia nenhuma mensagem. Se a última vista saiu da janela das
// últimas mensagens carregadas, conta todas.
export const contarNaoLidas = (mensagens, ultimaVistaId) => {
  if (ultimaVistaId === undefined) return 0;
  if (ultimaVistaId === null) return mensagens.length;
  const indice = mensagens.findIndex(mensagem => mensagem.id === ultimaVistaId);
  return indice === -1 ? mensagens.length : mensagens.length - 1 - indice;
};
