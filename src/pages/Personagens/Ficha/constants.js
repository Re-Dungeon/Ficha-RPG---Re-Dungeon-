export const PRIMARIOS_LABELS = {
  forca: 'Força',
  vitalidade: 'Vitalidade',
  agilidade: 'Agilidade',
  inteligencia: 'Inteligência',
  percepcao: 'Percepção',
  sorte: 'Sorte',
};

// Ícone por atributo primário — usado nos cards da aba Treinamento.
export const PRIMARIOS_ICONES = {
  forca: '💪',
  vitalidade: '❤️',
  agilidade: '⚡',
  inteligencia: '🧠',
  percepcao: '👁️',
  sorte: '🍀',
};

export const SECUNDARIOS_LABELS = {
  prontidao: 'Prontidão',
  ataque: 'Ataque',
  defesa: 'Defesa',
  reacao: 'Reação',
  precisao: 'Precisão',
  evasao: 'Evasão',
};

export const STATUS_LABELS = {
  hp: 'Saúde',
  energia: 'Energia',
  fadiga: 'Fadiga',
};

const zerarChaves = chaves => Object.fromEntries(chaves.map(chave => [chave, 0]));

export const valoresPadraoAtributos = () => zerarChaves(Object.keys(PRIMARIOS_LABELS));

export const valoresPadraoSecundarios = () => zerarChaves(Object.keys(SECUNDARIOS_LABELS));

export const valoresPadraoStatus = () =>
  Object.fromEntries(
    Object.keys(STATUS_LABELS).map(chave => [chave, { base: 0, extra: 0, bonus: 0, atual: 0 }]),
  );

export const buildInitialValues = personagem => ({
  atributosBase: { ...valoresPadraoAtributos(), ...personagem.atributosBase },
  atributosExtra: { ...valoresPadraoAtributos(), ...personagem.atributosExtra },
  atributosBonus: { ...valoresPadraoAtributos(), ...personagem.atributosBonus },
  secundariosBase: { ...valoresPadraoSecundarios(), ...personagem.secundariosBase },
  secundariosExtra: { ...valoresPadraoSecundarios(), ...personagem.secundariosExtra },
  secundariosBonus: { ...valoresPadraoSecundarios(), ...personagem.secundariosBonus },
  status: {
    ...valoresPadraoStatus(),
    ...Object.fromEntries(
      Object.entries(personagem.status ?? {}).map(([chave, valor]) => [
        chave,
        { base: 0, extra: 0, bonus: 0, atual: 0, ...valor },
      ]),
    ),
  },
});
