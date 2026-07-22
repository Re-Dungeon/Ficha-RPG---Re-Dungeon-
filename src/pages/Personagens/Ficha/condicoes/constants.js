// Converte a data ISO (YYYY-MM-DD, formato salvo por `hoje()` em CondicoesTab)
// para o padrão brasileiro exibido no rodapé do diálogo de detalhe.
export const formatarDataAplicacao = dataIso => {
  if (!dataIso) {
    return '';
  }
  const [ano, mes, dia] = dataIso.split('-');
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : dataIso;
};
