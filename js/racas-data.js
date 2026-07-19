/**
 * SISTEMA DE RAÇAS - DADOS ATUALIZADO
 * Estrutura centralizada com habilidades básicas e avançadas
 * Preparado para evolução e especialização
 */

const RACAS_DATABASE = [
  {
    id: "humano",
    nome: "Humano",
    tipo: "Re'Geron",
    raridade: "comum",
    descricao: "Os humanos são a raça mais flexível e diversa entre as civilizações. Eles surgem e prosperam praticamente em qualquer ambiente, espalhando-se por desertos, florestas, montanhas e cidades costeiras sem dificuldade. Sua moral, tradições e ambições mudam drasticamente de região para região, tornando impossível definir um único 'jeito humano' de existir.",
    limiteAtributo: 100,
    imagem: "https://i.imgur.com/VAOeAcl.png",
    atributos: {
      forca: "4d6+10",
      vitalidade: "4d6+10",
      agilidade: "4d6+10",
      inteligencia: "5d6+12",
      percepcao: "4d6+10",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Adaptabilidade",
        descricao: "O jogador pode ajustar na sua ficha um atributo chave (exceto sua sorte) antes da campanha iniciar, assim se adaptando como qualquer humano do mundo de Re'Dungeon.",
        bonus: [
          "Ajusta um atributo principal antes da campanha",
          "Maior flexibilidade no build do personagem",
          "Sem limitações de especialização"
        ]
      },
      {
        nome: "Versatilidade",
        descricao: "O jogador pode aprender uma categoria de art que possua no sistema, assim se tornando uma especialização única como se fosse uma classe.",
        bonus: [
          "Aprende uma categoria de arte extra",
          "Combina especialidades de forma única",
          "Exemplo: Um mago parradeiro"
        ]
      },
      {
        nome: "Ambição",
        descricao: "O jogador declara uma ambição que esteja de acordo com seu background. Durante eventos e acontecimentos na campanha que estejam com sua ambição em jogo, o jogador recebe o benefício de incentivo.",
        bonus: [
          "Bônus +3 em rolagens relacionadas à ambição",
          "Incentivo narrativo durante a campanha",
          "Conexão com objetivos pessoais"
        ]
      }
    ],
    habilidadesAvancadas: [
      
      {
        nome: "Poder Latente",
        descricao: "Quando pressionado ao limite, algo desperta. Durante 1 turno, escolhe um atributo principal e recebe +3 temporário nele. Se usado abaixo de 25% de HP, o bônus aumenta para +5. Sofre fadiga narrativa após o efeito (descrita pelo mestre).",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 1,
        dado: "0",
        bonus: [
          "+3 temporário em um atributo escolhido por 1 turno",
          "+5 se usado abaixo de 25% de HP",
          "Sofre fadiga narrativa após o efeito"
        ]
      },
      {
        nome: "Aprendizado",
        descricao: "Humanos aprendem observando erros — próprios e alheios. Ao falhar um teste em uma Art, perícia ou ação repetível, recebe +1 na próxima tentativa durante o mesmo combate. O bônus não se acumula, mas pode ser aplicado novamente após outra falha diferente.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+1 na próxima tentativa durante o mesmo combate após falha",
          "Bônus não se acumula, mas pode reaplicar após nova falha diferente"
        ]
      },
      {
        nome: "Adaptação",
        descricao: "Ao sofrer dano de um tipo específico, o humano ajusta seu corpo e mente. Até o final do próximo turno, recebe redução leve do mesmo tipo de dano ou 2d6 de Defesa contra aquela fonte específica. Não funciona contra o mesmo tipo de dano duas vezes seguidas sem intervalo.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 1,
        dado: "0",
        bonus: [
          "Redução leve do mesmo tipo de dano até o final do próximo turno",
          "Ou +2d6 de Defesa contra aquela fonte específica",
          "Não funciona contra o mesmo tipo de dano duas vezes seguidas"
        ]
      }
    ],
    codigo: "0001"
  },
  {
    id: "animanos",
    nome: "Animanos",
    tipo: "Re'Geron",
    raridade: "comum",
    descricao: "Animanos são semelhantes aos humanos à primeira vista, mas carregam no corpo marcas vivas de sua ancestralidade animal — caudas que denunciam emoções antes das palavras, orelhas que reagem ao menor som, padrões de pelagem, garras sutis ou olhos que refletem instinto. Essa fusão entre razão humana e herança selvagem dá a eles uma maneira única de perceber o mundo, guiada tanto pela intuição quanto por tradições próprias desenvolvidas ao longo de séculos de isolamento. Seu modo de viver costuma ser moldado pelo ritmo da natureza, e suas técnicas, crenças e costumes nascem dessa conexão profunda com os animais que vieram antes deles, tornando-os uma raça que transita entre o civilizado e o primal sem perder o equilíbrio.",
    limiteAtributo: 100,
    imagem: "https://i.imgur.com/SEQK76x.png",
    atributos: {
      forca: "5d6+12",
      vitalidade: "5d6+12",
      agilidade: "5d6+12",
      inteligencia: "4d6+10",
      percepcao: "5d8+10",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Instinto Desperto",
        descricao: "Os Animanos não dependem apenas da lógica. Seu corpo está constantemente sintonizado com as ameaças ao seu redor, reagindo instintivamente antes mesmo da mente compreender o perigo.",
        bonus: [
          "Detecta perigo iminente com mais facilidade (+3 em Percepção)",
          "Pequeno bônus em esquiva ou reação (+1)",
          "Em situações de surpresa, chance de agir primeiro"
        ]
      },
      {
        nome: "Sentidos Aguçados",
        descricao: "Seus traços animais amplificam significativamente sua percepção do mundo. Audição e olfato superiores funcionam como uma segunda visão, permitindo navegar em completa escuridão ou detectar presenças invisíveis.",
        bonus: [
          "Audição e olfato superiores ao padrão humano (Vantagem sensorial)",
          "Redução no obstáculo para perceber inimigos ocultos ou mudanças no ambiente",
          "+3 em rastreamento e localização"
        ]
      },
      {
        nome: "Intuição Primal",
        descricao: "Uma percepção que vai além do visível. Os Animanos conseguem captar as intenções hostis próximas e sentir quando algo está fora do equilíbrio natural, um dom ancestral que os protege de emboscadas.",
        bonus: [
          "Capta intenções hostis próximas",
          "+2 de bônus leve contra emboscadas",
          "Pode sentir quando algo está fora do equilíbrio natural"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Instinto Feral",
        descricao: "Quando o instinto assume, o corpo responde antes da mente. Ao ativar esta Art, o Animanos entra em um estado feral, recebendo bônus em Precisão à escolha, +2 em Evasão, ignora penalidades de dor, medo ou intimidação. Ao final do turno, sofre 1 nível leve de exaustão narrativa.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 7,
        recarga: 5,
        duracao: 0,
        dado: "0",
        bonus: [
          "+3 em Precisão à escolha",
          "+2 em Evasão",
          "Ignora penalidades de dor, medo ou intimidação",
          "Exaustão narrativa ao final do turno"
        ]
      },
      {
        nome: "Olhar do Predador",
        descricao: "O Animanos fixa o olhar no alvo como uma presa marcada. Até o final do turno: +2 em Testes de Percepção, rastreio e leitura de intenção contra esse alvo. O alvo sofre –3 em Evasão contra o próximo ataque. Se tentar fugir, o Animanos sabe exatamente a direção inicial.",
        tipo: "Imediata",
        alcance: "9 m",
        alvos: "1",
        custo: 5,
        recarga: 2,
        duracao: 0,
        dado: "0",
        bonus: [
          "+2 em Percepção e rastreamento contra o alvo",
          "-3 em Evasão do alvo contra próximo ataque",
          "Detecção de direção de fuga"
        ]
      },
      {
        nome: "Mutação Primal",
        descricao: "Características bestiais se intensificam: garras, presas, escamas, pelagem densa ou músculos distendidos. Enquanto ativa: +2 dado adicional de defesa, ataques desarmados causam dano de arma leve (3d8), ganha resistência leve ao último tipo de dano sofrido.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 13,
        recarga: 3,
        duracao: 0,
        dado: "0",
        bonus: [
          "+2 dado adicional de defesa",
          "Ataques desarmados causam 3d8",
          "Resistência leve ao último tipo de dano sofrido"
        ]
      },
      {
        nome: "Frenesi",
        descricao: "O Animanos converte dor e raiva em violência pura. Se já sofreu dano nesta rodada, o ataque recebe +6 dano adicional. Se estiver abaixo de 50% de HP, recebe +12 dano em vez disso. Após o ataque, sofre –1 dado de Defesa até o início do próximo turno.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "1",
        custo: 9,
        recarga: 4,
        duracao: 0,
        dado: "0",
        bonus: [
          "+6 dano se sofreu dano nesta rodada",
          "+12 dano se abaixo de 50% de HP",
          "-1 dado de Defesa após o ataque"
        ]
      }
    ],
    codigo: "0035"
  },
  {
    id: "mestico",
    nome: "Mestiços",
    tipo: "Re'Geron",
    raridade: "comum",
    descricao: "Os Mestiços são a raça mais imprevisível e diversificada do mundo. Nascidos da união entre sangues distintos, eles não herdam linhagens puras nem características fixas. Cada Mestiço é uma exceção viva, carregando traços físicos, culturais e espirituais fragmentados de suas origens. Por nunca pertencerem inteiramente a um único povo, aprendem desde cedo a sobreviver na intersecção, desenvolvendo uma capacidade rara de adaptação, conflito interno e criatividade extrema.",
    limiteAtributo: 100,
    imagem: "https://i.imgur.com/jA2Xvz4.png",
    atributos: {
      forca: "4d6+12",
      vitalidade: "4d6+12",
      agilidade: "4d6+12",
      inteligencia: "4d6+12",
      percepcao: "4d6+12",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Herança Fragmentada",
        descricao: "Nenhum Mestiço é completo — e exatamente por isso, nunca é limitado. Ao nascer (ou criar o personagem), recebe traços menores de duas ou mais raças diferentes e pode adaptar parte desses traços conforme a situação. Nunca atinge o potencial máximo de uma raça pura, mas acessa múltiplos caminhos ao mesmo tempo.",
        bonus: [
          "Recebe traços menores de duas ou mais raças diferentes",
          "Pode adaptar traços conforme a situação",
          "Acessa múltiplos caminhos simultaneamente"
        ]
      },
      {
        nome: "Instabilidade Adaptativa",
        descricao: "O conflito interno gera evolução constante. Após enfrentar um desafio (combate, ambiente ou efeito), ganha resistência progressiva contra aquilo. Pode ajustar sua abordagem rapidamente e quanto mais pressionado, mais eficiente se torna.",
        bonus: [
          "Ganha resistência progressiva após desafios",
          "Pode ajustar abordagem rapidamente",
          "Quanto mais pressionado, mais eficiente fica"
        ]
      },
      {
        nome: "Identidade Fluida",
        descricao: "Eles não pertencem — então aprendem a caber em qualquer lugar. Facilidade em interações sociais com diferentes culturas e raças, pode imitar comportamentos, sotaques ou posturas com naturalidade. Possui resistência a manipulação, intimidação ou leitura mental leve.",
        bonus: [
          "Facilidade em interações sociais com diferentes culturas",
          "Pode imitar comportamentos e sotaques com naturalidade",
          "Resistência a manipulação, intimidação e leitura mental leve"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Corpo Intermediário",
        descricao: "O corpo do Mestiço nunca é totalmente compatível com extremos. Recebe +1 em testes de Resistência geral, sofre menos penalidades por ambientes extremos. Por outro lado, efeitos que dependem de 'afinidade racial pura' não recebem bônus máximos.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+1 em testes de Resistência geral",
          "Menos penalidades em ambientes extremos",
          "Bônus médios em afinidades raciais puras"
        ]
      },
      {
        nome: "Sinergia Instável",
        descricao: "Ao usar uma Art, o Mestiço pode forçar a convergência de suas heranças, escolhendo um efeito secundário simples de outra Art racial conhecida. Após o uso, sofre –1 em um atributo aleatório até o próximo turno.",
        tipo: "Imediata",
        alcance: "12 m",
        alvos: "1",
        custo: 11,
        recarga: 2,
        duracao: 0,
        dado: "0",
        bonus: [
          "Escolhe efeito secundário de outra Art",
          "Convergência de heranças",
          "-1 em atributo aleatório até próximo turno"
        ]
      },
      {
        nome: "Adaptação Híbrida",
        descricao: "Sob pressão, o corpo híbrido se ajusta. Ao sofrer dano ou efeito negativo, o Mestiço pode ativar esta Art para receber resistência leve ao tipo de dano sofrido ou ignorar uma penalidade negativa leve até o fim do turno.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 9,
        recarga: 3,
        duracao: 0,
        dado: "0",
        bonus: [
          "Resistência leve ao dano sofrido ou",
          "Ignora penalidade negativa leve",
          "Até o fim do turno"
        ]
      },
      {
        nome: "Herança Dupla",
        descricao: "O Mestiço carrega duas raças-base. Em combate ou situações relevantes, pode ativar uma Herança Dominante, recebendo os bônus raciais daquela origem. Uma vez por batalha, ele pode alternar a herança ativa, adaptando-se à situação. No entanto, essa troca causa Instabilidade, aplicando uma penalidade temporária leve (como redução de atributos ou vulnerabilidade momentânea). Apenas uma herança pode estar ativa por vez, e seus efeitos não se acumulam. O Mestiço não é definido por uma única origem — mas pela capacidade de escolher quem precisa ser em cada momento.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Jogador",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Ativa uma Herança Dominante com seus bônus raciais",
          "Alterna herança uma vez por batalha",
          "Troca causa Instabilidade (penalidade leve temporária)",
          "Apenas uma herança ativa por vez (sem acúmulo)"
        ]
      }
    ],
    codigo: "0002"
  },
  {
    id: "gnomo",
    nome: "Gnomo",
    tipo: "Re'Geron",
    raridade: "raro",
    descricao: "Os Gnomos são uma raça pequena, mas perigosamente inteligente. Diferente da imagem cômica que muitos atribuem a eles, os Gnomos são engenheiros da improbabilidade. Onde outras raças veem limites físicos, eles veem desafios temporários. Baixos, de membros compactos, olhos grandes e atentos, sempre parecem estar calculando algo — mesmo quando dormem. Suas mãos são rápidas demais para o tamanho do corpo, e suas vozes costumam alternar entre empolgação e ironia mordaz.",
    limiteAtributo: 100,
    imagem: "https://i.imgur.com/GdcpsPA.png",
    atributos: {
      forca: "2d4+4",
      vitalidade: "3d6+6",
      agilidade: "4d6+10",
      inteligencia: "6d6+14",
      percepcao: "5d6+12",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Mente Iterativa",
        descricao: "Gnomos aprendem com erros em velocidade absurda. Falhas viram melhorias. Repetir o mesmo erro é quase impossível para eles.",
        bonus: [
          "Após falhar em um teste técnico ou intelectual, recebe +2 na próxima tentativa semelhante (1 vez por cena)",
          "Repetir exatamente a mesma ação falha não gera nova penalidade"
        ]
      },
      {
        nome: "Engenharia Improvisada",
        descricao: "Conseguem criar, adaptar ou consertar dispositivos usando recursos mínimos. O resultado nem sempre é bonito, mas quase sempre funciona.",
        bonus: [
          "Pode criar ou adaptar dispositivos simples sem custo de material",
          "Dispositivos improvisados têm –1 durabilidade, mas funcionam plenamente",
          "Arts que envolvam preparação mecânica custam –1 Energia"
        ]
      },
      {
        nome: "Curiosidade Perigosa",
        descricao: "Quando algo novo surge, um Gnomo sente impulso quase físico de mexer, testar ou desmontar. Ignorar isso exige esforço consciente.",
        bonus: [
          "Ao interagir com algo desconhecido, recebe +1 Intelecto temporário por 1 ação",
          "Se ignorar deliberadamente algo novo, sofre –1 em testes intelectuais até o fim da cena"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Dispositivo Improvisado",
        descricao: "O Gnomo cria um artefato funcional usando sucata. Escolha: armadilha, explosivo ou ferramenta. O efeito dura até ser usado ou destruído.",
        tipo: "Duradoura",
        alcance: "3 m",
        alvos: "AOE",
        custo: 9,
        recarga: 3,
        duracao: 0,
        dado: "0",
        bonus: [
          "Cria artefato funcional com sucata",
          "Escolhe tipo: armadilha, explosivo ou ferramenta"
        ]
      },
      {
        nome: "Iteração Forçada",
        descricao: "Após falhar em uma Art ou ataque, o Gnomo pode re-rolar o teste, aceitando o novo resultado.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Usuário",
        custo: 0,
        recarga: 5,
        duracao: 0,
        dado: "0",
        bonus: [
          "Re-rola o teste após falha",
          "Aceita o novo resultado obrigatoriamente"
        ]
      },
      {
        nome: "Sobrecarga Experimental",
        descricao: "Um dispositivo entra em modo crítico. Causa 4d12 de dano. Em caso de falha crítica, o usuário sofre metade do dano.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "No alcance",
        custo: 13,
        recarga: 4,
        duracao: 0,
        dado: "4d12",
        bonus: [
          "Causa 4d12 de dano",
          "Falha crítica: usuário sofre metade do dano"
        ]
      },
      {
        nome: "Engenharia do Caos",
        descricao: "Dispositivos criados pelo Gnomo nunca falham completamente. Em falhas, o efeito ocorre de forma reduzida.",
        tipo: "Duradoura",
        alcance: "0",
        alvos: "Usuário",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Dispositivos nunca falham completamente",
          "Efeitos reduzidos em falhas"
        ]
      },
      {
        nome: "Botão Vermelho Não Identificado",
        descricao: "Ativa uma função desconhecida. O efeito é poderoso, mas o mestre define uma consequência colateral inevitável.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "No alcance",
        custo: 17,
        recarga: "1 p/ Sessão",
        duracao: 0,
        dado: "0",
        bonus: [
          "Ativa função desconhecida",
          "Efeito poderoso",
          "Consequência colateral inevitável"
        ]
      }
    ],
    codigo: "0003"
  },
  {
    id: "anao",
    nome: "Anão",
    tipo: "Re'Geron",
    raridade: "raro",
    descricao: "Anões são seres robustos, persistentes e moldados pela mesma dureza das montanhas que chamam de lar. Baixos e fortes, com músculos compactos e uma resistência lendária, eles prosperam em fortalezas subterrâneas repletas de túneis, forjas e salões ecoando histórias antigas. Sua vida gira em torno da tradição, da honra e do trabalho meticuloso — cada arma, joia ou estrutura criada por um anão carrega séculos de técnica aperfeiçoada.",
    limiteAtributo: 100,
    imagem: "https://i.imgur.com/lQYaH3k.png",
    atributos: {
      forca: "5d8+12",
      vitalidade: "5d8+12",
      agilidade: "5d8+12",
      inteligencia: "3d4+6",
      percepcao: "4d6+10",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Fundamento da Tenacidade",
        descricao: "Uma vez por sessão, o anão pode ignorar completamente os efeitos negativos de uma condição física (exaustão, sangramento, dor, empurrão, imobilização leve).",
        bonus: [
          "Ignora efeitos negativos de condição física",
          "Uma vez por sessão",
          "Exaustão, sangramento, dor, empurrão, imobilização leve"
        ]
      },
      {
        nome: "Fundamento da Forja",
        descricao: "O jogador escolhe um tipo de equipamento (arma, armadura, ferramenta ou artefato). Esse item recebe um aprimoramento exclusivo criado pelo próprio anão. Durante a campanha, o anão pode evoluir esse item sem custo extra sempre que houver tempo, recursos ou narrativa adequada.",
        bonus: [
          "Escolhe um tipo de equipamento",
          "Aprimoramento exclusivo pessoal",
          "Evolução sem custo extra"
        ]
      },
      {
        nome: "Fundamento do Juramento",
        descricao: "O jogador declara um juramento (proteger, vingar, construir, preservar, destruir algo específico). Sempre que agir diretamente em favor desse juramento, recebe o benefício de firmeza, garantindo +3 nas rolagens e imunidade a efeitos de medo ou intimidação naquela cena.",
        bonus: [
          "+3 em rolagens relacionadas ao juramento",
          "Imunidade a medo ou intimidação na cena",
          "Juramento declarado pessoalmente"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Nanismo",
        descricao: "O corpo anão é baixo, denso e estável. O personagem recebe +2 em Testes contra empurrões, esquivas, quedas e efeitos de deslocamento forçado. Redução leve em penalidades por terreno irregular ou instável. Efeitos que dependem de 'derrubar' ou 'arremessar' o anão têm dificuldade aumentada.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+2 em Testes contra empurrões e deslocamento",
          "Redução em penalidades de terreno",
          "Dificuldade aumentada para ser derrubado"
        ]
      },
      {
        nome: "Percepção Anã",
        descricao: "Anões veem o mundo como estrutura, não como paisagem. O personagem recebe +2 em Testes de Percepção ligados a ambientes subterrâneos, armadilhas, mecanismos, construções e falhas estruturais. Uma vez por sessão, pode identificar pontos fracos em objetos, paredes ou armaduras.",
        tipo: "Duradoura",
        alcance: "15 m",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+2 em Percepção de ambientes e estruturas",
          "Detecção de armadilhas e mecanismos",
          "Identificação de pontos fracos uma vez por sessão"
        ]
      },
      {
        nome: "52 Batidas Divinas",
        descricao: "Cada golpe importa. Ao ativar esta Art, o anão entra em um ritmo preciso de golpes calculados. Para cada ataque consecutivo o anão causa dado de dano adicional durante 3 turnos. Se atacar um objeto, arma ou armadura, recebe +2 em testes para quebrar, deformar ou melhorar.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "1",
        custo: 11,
        recarga: 3,
        duracao: 0,
        dado: "0",
        bonus: [
          "+1 dado de dano por ataque consecutivo",
          "+2 em testes contra objetos",
          "Efeito por 3 turnos"
        ]
      },
      {
        nome: "Força do Pequeno Homem",
        descricao: "A força anã vem da densidade, não do tamanho. Sempre que o anão estiver defendendo uma posição, usando escudos, armas pesadas ou ferramentas de impacto, ele recebe um dado de Defesa e +1 em testes de Força. Não sofre penalidades por tamanho ao usar armas feitas para criaturas maiores.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+1 dado de Defesa defensivo",
          "+1 em Testes de Força",
          "Sem penalidade de tamanho com armas grandes"
        ]
      }
    ],
    codigo: "0004"
  },
  {
    id: "elfo",
    nome: "Elfo",
    tipo: "Re'Geron",
    raridade: "raro",
    descricao: "Elfos são seres de graça sobrenatural, longos anos e beleza quase etérea, vivendo em harmonia com a magia e com os ritmos antigos do mundo. Seus corpos são esguios, seus movimentos leves e calculados, e seus sentidos aguçados enxergam nuances que outras raças sequer percebem. Costumam habitar florestas profundas, vales ocultos ou enclaves místicos, preservando culturas que atravessam séculos como se fossem estações do ano.",
    limiteAtributo: 100,
    imagem: "https://i.imgur.com/MflH60q.png",
    atributos: {
      forca: "3d6+10",
      vitalidade: "3d6+10",
      agilidade: "5d8+10",
      inteligencia: "5d8+10",
      percepcao: "5d8+10",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Legado da Eternidade",
        descricao: "O jogador pode escolher um efeito passivo permanente ligado a um atributo mental (Intelecto, Vontade ou Percepção). Uma vez por cena, pode ignorar penalidades relacionadas a fadiga mental, confusão, medo ou distração.",
        bonus: [
          "Escolhe efeito passivo mental permanente",
          "Ignora penalidades mentais uma vez por cena",
          "Fadiga mental, confusão, medo ou distração"
        ]
      },
      {
        nome: "Legado da Sintonia",
        descricao: "O jogador escolhe um elemento, escola mágica ou força natural (ex: Água, Vento ou Mana). Sempre que utilizar habilidades ligadas a essa afinidade, recebe +2 nas rolagens e reduz o custo ou tempo de conjuração.",
        bonus: [
          "+2 em rolagens da afinidade eleita",
          "Redução de custo ou tempo de conjuração",
          "Elemento, escola mágica ou força natural"
        ]
      },
      {
        nome: "Legado da Precisão",
        descricao: "Uma vez por turno, o elfo pode re-rolar um dado em ações que envolvam ataque, furtividade ou ações técnicas. Deve manter o novo resultado. Além disso, recebe bônus narrativo ao agir com planejamento, posicionamento ou paciência.",
        bonus: [
          "Re-rola um dado uma vez por turno",
          "Ataque, furtividade ou ações técnicas",
          "Bônus narrativo com planejamento"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Percepção Aguçada",
        descricao: "Os sentidos élficos são treinados desde a infância para perceber o que outros ignoram. O elfo recebe +2 em Testes de Percepção, rastreio e detecção (incluindo armadilhas, emboscadas e presenças ocultas). Uma vez por sessão, pode agir antes do turno normal ao detectar uma ameaça oculta.",
        tipo: "Duradoura",
        alcance: "19 m",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+2 em Percepção e detecção",
          "Prioridade de reação uma vez por sessão",
          "Contra ameaças ocultas"
        ]
      },
      {
        nome: "Acrobacia Sobrenatural",
        descricao: "O corpo élfico se move com leveza quase irreal. Ao sofrer um ataque corpo a corpo ou à distância, o elfo pode ativar esta Art para receber +2 em Evasão ou Reação contra aquele ataque. Se o ataque errar, o elfo pode se mover até 3 metros sem provocar reações.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 7,
        recarga: 2,
        duracao: 0,
        dado: "0",
        bonus: [
          "+2 em Evasão contra ataque",
          "Movimento de 3 metros sem reação se acerto errar"
        ]
      },
      {
        nome: "Treinamento com Arco",
        descricao: "O arco é uma extensão natural do corpo élfico. O personagem recebe +1 em Precisão ao usar arcos ou armas de longo alcance similares. Ignora penalidades leves de distância. Uma vez por turno, ao permanecer imóvel, o próximo disparo recebe +2 dado de dano adicional.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+1 em Precisão com arcos",
          "Ignora penalidades de distância",
          "+2 dado de dano se imóvel"
        ]
      },
      {
        nome: "Longevidade",
        descricao: "A vida longa do elfo permite aperfeiçoamento contínuo. Sempre que o personagem subir o Domínio de uma Art, ele recebe um bônus narrativo adicional, como redução leve de custo ou pequeno bônus secundário (ex: +1 alcance, +1 duração).",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Bônus narrativo ao subir Domínio de Art",
          "Redução leve de custo ou bônus secundário",
          "Uma vez por Art"
        ]
      }
    ],
    codigo: "0005"
  },
  {
    id: "animalus",
    nome: "Animalus",
    tipo: "Re'Geron",
    raridade: "raro",
    descricao: "Os Animalus são seres de aparência nitidamente animalesca, carregando traços físicos completos de suas linhagens — presas, escamas, asas, carapaças, caudas ou guelras. Possuem uma longevidade superior à dos humanos e um intelecto comparável ao dos elfos, embora sejam frequentemente subestimados ou perseguidos devido à sua aparência bestial. Essa hostilidade moldou sua cultura: ao longo das eras, os Animalus desenvolveram técnicas de combate brutais, eficientes e refinadas, tornando-se os mais aptos ao combate marcial direto.",
    limiteAtributo: 100,
    imagem: "https://i.imgur.com/KLIGWgz.png",
    atributos: {
      forca: "5d6+8",
      vitalidade: "5d6+12",
      agilidade: "5d8+8",
      inteligencia: "5d6+10",
      percepcao: "5d8+8",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Caminho da Predação",
        descricao: "O Animalus recebe +2 em rolagens de ataque corpo a corpo e vantagem em ações de emboscada, perseguição ou combate iniciado por ele. Na primeira rodada de combate, causa dano adicional ou recebe bônus equivalente definido pelo sistema.",
        bonus: [
          "+2 em rolagens de ataque corpo a corpo",
          "Vantagem em emboscada, perseguição ou combate iniciado",
          "Dano adicional ou bônus na primeira rodada de combate"
        ]
      },
      {
        nome: "Caminho da Carapaça",
        descricao: "O Animalus recebe redução passiva de dano físico ou bônus constante em Defesa. Uma vez por cena, pode ignorar completamente um efeito físico negativo (empurrão, atordoamento leve, sangramento ou quebra de postura).",
        bonus: [
          "Redução passiva de dano físico ou +1 em Defesa",
          "Ignora efeito físico negativo uma vez por cena",
          "Empurrão, atordoamento, sangramento ou quebra de postura"
        ]
      },
      {
        nome: "Instinto Selvagem",
        descricao: "O Animalus sente perigos por instinto. Recebe +1 em Percepção e nunca sofre penalidades por ataques surpresa. Pode reagir a ataques mesmo que desprevenido, embora com penalidade reduzida.",
        bonus: [
          "+1 em Percepção geral",
          "Nunca sofre penalidade total de surpresa",
          "Reação possível mesmo desprevenido"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Consciência Selvagem",
        descricao: "O Animalus percebe o mundo como um ecossistema vivo. Recebe +2 em Testes de Percepção ligados a ambiente, clima, presença de criaturas e mudanças naturais (cheiros, vibrações, padrões de movimento). Nunca é pego totalmente desprevenido em ambientes naturais, podendo reagir mesmo em emboscadas bem-sucedidas.",
        tipo: "Duradoura",
        alcance: "12 m",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+2 em Percepção de ambiente e natureza",
          "Detecção de presença de criaturas",
          "Reação mesmo em emboscadas naturais"
        ]
      },
      {
        nome: "Movimento Natural",
        descricao: "O corpo do Animalus se move como nasceu para se mover. Ao se deslocar: ignora penalidades leves de terreno (lama, raízes, neve, pedras), pode se mover até 3 metros adicionais sem provocar reações. Se usado para esquiva, recebe +1 Evasão contra um ataque.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 7,
        recarga: 2,
        duracao: 0,
        dado: "0",
        bonus: [
          "Ignora penalidades leves de terreno",
          "Movimento adicional de 3 metros sem provocação",
          "+1 Evasão em esquiva"
        ]
      },
      {
        nome: "Forma Adaptativa",
        descricao: "O Animalus ajusta seu corpo ao perigo imediato. Ao ativar, escolhe um benefício de acordo com sua fisiologia: Pele endurecida (+2 dado adicional de defesa), Músculos tensos (+1 Precisão), Reflexos aguçados (+1 Evasão). Enquanto ativa, recebe resistência leve ao último tipo de dano sofrido.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 11,
        recarga: 3,
        duracao: 0,
        dado: "0",
        bonus: [
          "Escolhe benefício: defesa, precisão ou evasão",
          "Resistência leve ao último dano sofrido",
          "Adaptação baseada em fisiologia"
        ]
      },
      {
        nome: "Linguagem da Natureza",
        descricao: "O Animalus emite sons, gestos ou feromônios que criaturas naturais reconhecem instintivamente. Pode acalmar animais hostis, alertar aliados animais sobre perigo ou obter uma informação simples do ambiente (predadores, rotas, ameaça recente). Não funciona em criaturas artificiais ou totalmente corrompidas.",
        tipo: "Imediata",
        alcance: "11 m",
        alvos: "No alcance",
        custo: 9,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Acalma animais hostis ou",
          "Alerta aliados sobre perigo ou",
          "Obtém informação simples do ambiente"
        ]
      }
    ],
    codigo: "0006"
  },
  {
    id: "homunculo",
    nome: "Homúnculo",
    tipo: "Re'Geron",
    raridade: "epico",
    descricao: "Os Homúnculos são seres artificiais criados por alquimistas, arcanistas e estudiosos que ousaram imitar o ato primordial da criação. Diferente de construtos comuns, eles não são simples ferramentas: cada Homúnculo nasce a partir de matéria viva, essência mágica e intenção consciente, o que lhes concede vontade própria, memória fragmentada e, em muitos casos, emoções reais. Embora seus corpos sejam moldados em laboratório ou círculos rituais, suas almas não são falsas. Elas surgem incompletas, instáveis ou emprestadas — ecos de algo que poderia ter sido humano, elfo ou algo além. Por isso, Homúnculos vivem em constante busca por identidade, tentando entender se são obra, erro ou evolução. Fisicamente, variam enormemente: alguns são quase indistinguíveis de humanos, outros exibem marcas alquímicas, runas sob a pele, membros artificiais ou olhos que jamais piscam. Eles não envelhecem como raças naturais e raramente adoecem, mas carregam o peso de saber que sua existência foi planejada, não nascida.",
    limiteAtributo: 150,
    imagem: "https://i.imgur.com/MIhOTAl.png",
    atributos: {
      forca: "4d6+12",
      vitalidade: "5d6+14",
      agilidade: "4d6+12",
      inteligencia: "5d6+12",
      percepcao: "4d6+12",
      sorte: "4d20+20"
    },
    habilidadesBasicas: [
      {
        nome: "Protocolo da Otimização",
        descricao: "O jogador escolhe um atributo ou perícia. Esse valor recebe +2 permanente. Além disso, entre campanhas ou descansos longos, o Homúnculo pode realocar um pequeno bônus secundário, representando ajustes físicos ou alquímicos.",
        bonus: [
          "Escolhe um atributo para receber +2 permanente",
          "Realoca bônus secundário entre campanhas",
          "Flexibilidade em ajustes físicos ou alquímicos"
        ]
      },
      {
        nome: "Protocolo da Redundância Vital",
        descricao: "Uma vez por combate, quando o Homúnculo sofreria dano crítico, condição grave ou falha fatal, ele pode reduzir drasticamente o efeito, ativando sistemas de reserva alquímica. Após o uso, sofre penalidade temporária até realizar manutenção adequada.",
        bonus: [
          "Ativa sistemas de reserva alquímica uma vez por combate",
          "Reduz drasticamente dano crítico ou falha fatal",
          "Penalidade temporária até manutenção"
        ]
      },
      {
        nome: "Protocolo da Consciência Emergente",
        descricao: "O Homúnculo recebe bônus em resistência mental, força de vontade e efeitos emocionais. Uma vez por cena, pode ignorar medo, controle ou confusão, agindo como se fosse puramente racional — ou puramente decidido.",
        bonus: [
          "Bônus em resistência mental e força de vontade",
          "Ignora medo, controle ou confusão uma vez por cena",
          "Age puramente racional ou decidido"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Corpo Sintético",
        descricao: "O corpo do Homúnculo não segue biologia comum. Recebe resistência leve a venenos, doenças e sangramento. Efeitos biológicos têm duração reduzida. Cura natural é menos eficiente, mas curas artificiais, alquímicas ou mágicas têm efeito ampliado. Não é imune à dor — apenas foi projetado para suportá-la.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Resistência leve a venenos, doenças e sangramento",
          "Duração reduzida de efeitos biológicos",
          "Curas alquímicas ampliadas"
        ]
      },
      {
        nome: "Núcleo Alquímico",
        descricao: "O Homúnculo ativa o núcleo que sustenta sua existência, alterando temporariamente sua composição interna. Escolha um efeito: +2 em Defesa, +2 em Precisão ou Regeneração leve de HP por turno. Ao final da duração, o corpo sofre instabilidade.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 9,
        recarga: 3,
        duracao: 0,
        dado: "0",
        bonus: [
          "Escolhe: +2 Defesa, +2 Precisão ou Regeneração",
          "Instabilidade narrativa ao final"
        ]
      },
      {
        nome: "Reconfiguração Forçada",
        descricao: "O Homúnculo força uma adaptação emergencial. Remove uma condição negativa leve ou moderada. Converte essa instabilidade em vantagem: recebe +1 em uma ação relevante no próximo turno. Não pode ser usado contra efeitos divinos ou absolutos.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 15,
        recarga: "1 p/ Sessão",
        duracao: 0,
        dado: "0",
        bonus: [
          "Remove condição negativa leve ou moderada",
          "+1 em ação relevante no próximo turno",
          "Não funciona contra efeitos divinos"
        ]
      },
      {
        nome: "Auto-Reparo Emergencial",
        descricao: "Quando o Homúnculo sofre dano significativo ou entra em estado crítico, mecanismos alquímicos internos são ativados à força. Recupera HP moderado imediatamente. Ignora penalidades de ferimentos leves até o início do próximo turno. Remove efeitos de sangramento não mágico. Após o uso, o corpo entra em sobrecarga: no próximo turno, sofre –2 em todas as ações físicas.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 13,
        recarga: 6,
        duracao: 0,
        dado: "10d6+20",
        bonus: [
          "Recupera HP moderado imediatamente",
          "Ignora penalidades de ferimentos leves",
          "Remove sangramento não mágico",
          "-2 em ações físicas no próximo turno"
        ]
      },
      {
        nome: "Aprendizado Antinatural",
        descricao: "O Homúnculo aprende com erros de forma antinatural. Sempre que falhar em uma ação importante, recebe um bônus cumulativo pequeno ao repetir uma tentativa semelhante na cena. O bônus se dissipa ao ter sucesso ou ao fim da batalha.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Bônus cumulativo em tentativas semelhantes",
          "Se falhar, acumula +1 na próxima tentativa",
          "Dissipa ao sucesso ou fim da batalha"
        ]
      }
    ],
    codigo: "0007"
  },
  {
    id: "lukan",
    nome: "Lukans",
    tipo: "Re'Geron",
    raridade: "epico",
    descricao: "Os Lukans são uma raça criados pelos Dracólitos, moldados para servir como guardiões de Sultran, o Inferno, e das fronteiras onde a realidade ameaça ruir. À primeira vista, possuem uma aparência majoritariamente humanoide, marcada por traços infernais: chifres de formas variadas, olhos incandescentes, marcas naturais semelhantes a escamas e uma presença intimidadora que denuncia sua origem. Seus corpos são esculpidos para o conflito, resultado direto de uma criação voltada à guerra e à vigilância eterna. Apesar da estética infernal, a essência dos Lukans vai além da aparência. Em suas veias corre uma linhagem draconica latente, herdada diretamente de seus criadores, manifestando-se como força excepcional, resistência incomum e um potencial de combate. Treinados desde a origem para a batalha absoluta.",
    limiteAtributo: 130,
    imagem: "https://i.imgur.com/RgmZnIM.png",
    atributos: {
      forca: "5d8+12",
      vitalidade: "5d8+12",
      agilidade: "4d6+10",
      inteligencia: "4d6+12",
      percepcao: "4d6+10",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Sangue Dracólito Latente",
        descricao: "A criação dos Lukans não foi apenas infernal — foi celestial. Aumenta força física e resistência naturalmente com +1dn adicional em FOR e VIT. Reduz dano recebido por ataque físico em 10%. Em momentos críticos com HP menor que 30%, o corpo reage com um surto de poder (+3 Evasão).",
        bonus: [
          "+1 dado adicional em Força e Vitalidade",
          "Reduz dano físico em 10%",
          "+3 Evasão com HP menor que 30%"
        ]
      },
      {
        nome: "Forjados em Sultran",
        descricao: "Os Lukans não foram feitos para sobreviver — foram feitos para suportar o impossível. Possuem resistência natural a calor extremo, fogo e ambientes hostis com +30% de resistência. Imunidade parcial a dor sem sofrer penalidades leves por dano. Não se abalam facilmente por medo ou pressão (+3 Bônus).",
        bonus: [
          "+30% de resistência a calor, fogo e ambientes hostis",
          "Imunidade parcial a dor (sem penalidades leves)",
          "+3 Bônus contra medo e pressão"
        ]
      },
      {
        nome: "Sentinela do Véu Quebrado",
        descricao: "Criados para vigiar onde a realidade falha. Detectam distorções, presenças sobrenaturais ou ameaças ocultas com facilidade. Recebem bônus contra criaturas extraplanares ou corrompidas e sofrem dificuldade menor de serem surpreendidos.",
        bonus: [
          "Detecta distorções e presenças sobrenaturais",
          "Bônus contra criaturas extraplanares ou corrompidas",
          "Dificuldade maior de ser surpreendido"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Linhagem Dracônica Latente",
        descricao: "O sangue dos Dracólitos corre adormecido no corpo do Lukan. +5 em FOR e VIT, +1 Resistência Física. Testes contra medo, intimidação ou pressão sobrenatural recebem +2.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+5 em Força e Vitalidade",
          "+1 Resistência Física",
          "+2 contra medo, intimidação e pressão sobrenatural"
        ]
      },
      {
        nome: "Forma Dracônica Reprimida",
        descricao: "Por tradição e controle cultural, a verdadeira forma do Lukan permanece selada. Enquanto não transformado, o Lukan recebe –30% no custo de todas as Arts. Efeitos que drenam mana causam –20% a menos. Habilidades de transformação ficam bloqueadas até liberar o selo.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "-30% custo de todas as Arts",
          "Drenagem de mana reduzida em 20%",
          "Transformações bloqueadas"
        ]
      },
      {
        nome: "Despertar Dracônico",
        descricao: "Utilizando toda sua mana como combustível, o Lukan libera sua forma verdadeira, há muito reprimida. +7 em Ataque, +3 Precisão, +2 Evasão. +2 em todas as ações ofensivas. Pode voar em deslocamentos médios. Imunidade a medo. Ao fim do efeito, o Lukan fica Exausto por 1 turno.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 15,
        recarga: "1 p/ Sessão",
        duracao: 0,
        dado: "0",
        bonus: [
          "+7 Ataque, +3 Precisão, +2 Evasão",
          "+2 em ações ofensivas",
          "Voo em deslocamentos médios",
          "Imunidade a medo"
        ]
      },
      {
        nome: "Corpo Forjado para a Guerra",
        descricao: "Criados para vigiar Sultran, os Lukans não quebram fácil. Dano físico recebido sofre redução de 2dn. Ignora penalidades por dor leve ou ferimentos superficiais. Enquanto abaixo de 50% de HP, recebe +1 em Tolerância.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Dano físico reduzido em 2dn",
          "Ignora penalidades de dor leve",
          "+1 Tolerância abaixo de 50% HP"
        ]
      }
    ],
    codigo: "0008"
  },
  {
    id: "fada",
    nome: "Fada",
    tipo: "Re'Geron",
    raridade: "epico",
    descricao: "As Fadas são seres nascidos da interseção entre o mundo físico e os planos sutis da realidade. Seu corpo não é inteiramente material, nem puramente espiritual, o que as torna profundamente ligadas a forças invisíveis como emoções, desejos, memórias e promessas. Essa natureza liminar faz com que o tempo, a moral e a lógica sejam percebidos por elas de forma diferente das demais raças. Embora geralmente pequenas em estatura, as Fadas jamais devem ser subestimadas. Sua longevidade, astúcia e domínio sobre energias sutis as tornam entidades imprevisíveis, capazes de alterar eventos com gestos mínimos, palavras bem colocadas ou acordos que nunca deveriam ser aceitos. Para uma Fada, poder não se mede em força bruta, mas em influência, significado e consequência.",
    limiteAtributo: 150,
    imagem: "https://i.imgur.com/JGRwGxB.png",
    atributos: {
      forca: "3d4+6",
      vitalidade: "3d4+6",
      agilidade: "5d8+12",
      inteligencia: "5d6+12",
      percepcao: "5d8+10",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Véu do Encanto",
        descricao: "A Fada recebe +2 em ações sociais, manipulação, persuasão ou engano. Uma vez por cena, pode impor hesitação a um alvo consciente, reduzindo sua próxima ação ou atrasando sua reação.",
        bonus: [
          "+2 em ações sociais e persuasão",
          "Hesitação no alvo uma vez por cena",
          "Reduz próxima ação ou atrasa reação"
        ]
      },
      {
        nome: "Véu da Transição",
        descricao: "A Fada pode ignorar obstáculos leves, atravessar espaços estreitos ou alterar brevemente sua posição como se estivesse parcialmente fora do plano físico. Uma vez por cena, pode redefinir seu posicionamento no campo de batalha ou em uma cena narrativa.",
        bonus: [
          "Ignora obstáculos leves",
          "Atravessa espaços estreitos",
          "Redefine posicionamento uma vez por cena"
        ]
      },
      {
        nome: "Véu do Pacto",
        descricao: "O jogador define um tipo de acordo ou promessa (proteção, segredo, troca, favor). Sempre que um pacto válido estiver ativo, a Fada recebe +3 nas rolagens relacionadas àquele acordo. Quebrar um pacto gera consequências narrativas sérias.",
        bonus: [
          "+3 em rolagens relacionadas ao pacto",
          "Define tipo de acordo pessoalmente",
          "Consequências narrativas por quebra"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Corpo Liminal",
        descricao: "O corpo da Fada existe parcialmente fora do plano físico. Ataques puramente físicos causam dano reduzido (+50% Defesa). A Fada pode atravessar espaços estreitos, frestas e obstáculos leves. Efeitos que afetam espírito, emoção ou mente têm maior eficácia, causando dobro de dano (positivo ou negativo).",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+50% Defesa contra dano físico",
          "Atravessa obstáculos leves",
          "Dobro de dano de efeitos espirituais/emocionais"
        ]
      },
      {
        nome: "Encanto Sutil",
        descricao: "A Fada projeta emoções, desejos ou lembranças suavemente na mente do alvo. Escolha um efeito: Desatenção (penalidade em ações ofensivas), Fascínio (alvo evita atacar a Fada), ou Dúvida (alvo hesita em próxima ação). Criaturas sem mente ou emoções são imunes.",
        tipo: "Imediata",
        alcance: "9 m",
        alvos: "1",
        custo: 9,
        recarga: 2,
        duracao: 0,
        dado: "0",
        bonus: [
          "Escolhe efeito: desatenção, fascínio ou dúvida",
          "Penalidade em ações do alvo",
          "Imune a criaturas sem emoção"
        ]
      },
      {
        nome: "Promessa Vinculante",
        descricao: "A Fada sela uma promessa verbal simples com outra criatura. Enquanto a promessa for mantida, ambos recebem um bônus leve narrativo. Se o alvo quebrar a promessa, sofre uma penalidade significativa. A Fada também é afetada se quebrar o acordo.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "1",
        custo: 15,
        recarga: "1 p/ Sessão",
        duracao: 0,
        dado: "0",
        bonus: [
          "Sela promessa verbal simples",
          "Bônus narrativo enquanto mantida",
          "Penalidade por quebra de promessa"
        ]
      },
      {
        nome: "Eco das Emoções",
        descricao: "A Fada percebe emoções residuais no ambiente. Pode identificar emoções fortes recentes (medo, ódio, amor, desespero). Recebe +3 em ações sociais ou mágicas quando age em sintonia com a emoção dominante do local. Ambientes emocionalmente carregados fortalecem suas Arts narrativamente.",
        tipo: "Imediata",
        alcance: "11 m",
        alvos: "No alcance",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Identifica emoções recentes no ambiente",
          "+3 em ações sociais ou mágicas em sintonia",
          "Fortalecimento narrativo em locais emocionados"
        ]
      },
      {
        nome: "Agilidade da Fada",
        descricao: "O corpo leve e a ligação parcial com planos sutis permitem que a Fada se mova com graça antinatural. Recebe +3 em Esquiva e 20% Prontidão. Movimenta-se por terrenos difíceis sem penalidades. Pode realizar pequenos deslocamentos aéreos ou saltos impossíveis como parte do movimento.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+3 em Esquiva",
          "+20% Prontidão",
          "Terreno difícil sem penalidades",
          "Deslocamentos aéreos e saltos impossíveis"
        ]
      }
    ],
    codigo: "0009"
  },
  {
    id: "worgen",
    nome: "Worgen",
    tipo: "Re'Geron",
    raridade: "epico",
    descricao: "Os Worgen surgiram na Era das Trevas, um período esquecido em que deuses ainda caminhavam entre mortais e a magia era moldada sem medo das consequências. Temendo entidades antigas que escapavam à compreensão divina, magos humanos realizaram um ritual proibido: fundiram um Espírito Antigo predatório a corpos mortais, criando guardiões capazes de caçar aquilo que nem deuses ousavam enfrentar. O resultado foram humanos alterados, dotados de intelecto e percepção élficos, mas ligados à magia de sangue, pois o pacto original jamais poderia ser sustentado sem um preço. Em suas veias corre um sangue vivo, pulsante, capaz de se fortalecer, reagir e se adaptar ao conflito. As presas não são apenas traços físicos — são condutores do pacto, símbolos de que cada Worgen carrega dentro de si uma fome ancestral. Com o fim da Era das Trevas, os rituais foram selados e os deuses se afastaram. Os Worgen sobreviveram como uma raça amaldiçoada e poderosa, dividida entre controle e instinto, razão e ferocidade. Eles não são bestas, mas jamais deixam o mundo esquecer que foram criados para caçar o impossível.",
    limiteAtributo: 150,
    imagem: "https://i.imgur.com/IelhWY0.png",
    atributos: {
      forca: "4d6+14",
      vitalidade: "5d6+12",
      agilidade: "4d6+14",
      inteligencia: "5d6+10",
      percepcao: "5d8+12",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Pacto da Fome Ancestral",
        descricao: "Sempre que o Worgen causar dano direto em combate, ele pode recuperar vitalidade ou reduzir o custo de uma habilidade baseada em sangue. Se o combate se prolongar, ele recebe bônus progressivo em força ou agressividade, mas perde sutileza.",
        bonus: [
          "Recupera vitalidade ao causar dano",
          "Reduz custo de habilidades de sangue",
          "Bônus progressivo em combates longos"
        ]
      },
      {
        nome: "Pacto da Mente Predatória",
        descricao: "O Worgen recebe +2 em percepção, estratégia ou leitura de inimigos. Uma vez por cena, pode antecipar uma ação inimiga, ganhando vantagem defensiva ou ofensiva imediata.",
        bonus: [
          "+2 em Percepção e leitura de inimigos",
          "Antecipa ação inimiga uma vez por cena",
          "Vantagem defensiva ou ofensiva"
        ]
      },
      {
        nome: "Pacto do Legado Profano",
        descricao: "O Worgen carrega fragmentos ativos do ritual ancestral em seu sangue. Uma vez por cena, ele pode invocar um eco do Espírito Antigo, fortalecendo uma ação ofensiva ou defensiva com bônus significativo ou um efeito especial. Após o uso, o Worgen sofre recuo ritual: penalidade leve temporária.",
        bonus: [
          "Invoca eco do Espírito Antigo uma vez por cena",
          "Rompe defesa, atravessa resistência ou ignora medo",
          "Penalidade leve temporária após uso"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Fome Carmesim",
        descricao: "Ao causar dano corpo a corpo, o Worgen pode ativar esta Art para absorver vitalidade do alvo, recuperando HP equivalente a uma fração do dano causado. Se o alvo estiver sangrando, inconsciente ou abaixo de 50% de HP, a recuperação é ligeiramente maior.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: 7,
        recarga: 2,
        duracao: 0,
        dado: "0",
        bonus: [
          "Absorve vitalidade do alvo",
          "Recuperação maior se alvo enfraquecido",
          "Baseado em fração do dano causado"
        ]
      },
      {
        nome: "Instinto Predatório",
        descricao: "O Worgen percebe fraqueza como um cheiro no ar. Sempre que houver uma criatura ferida ou debilitada a até 9 metros, o personagem recebe: +1 em Percepção e rastreio, +1 Precisão contra alvos abaixo de 50% de HP.",
        tipo: "Sustentada",
        alcance: "9 m",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+1 em Percepção de alvos feridos",
          "+1 Precisão contra alvos enfraquecidos",
          "Detecta presença de fraqueza"
        ]
      },
      {
        nome: "Metamorfose Bestial",
        descricao: "O Worgen libera parcialmente sua forma amaldiçoada. Ataques desarmados passam a causar dano equivalente a arma média (3d8). Recebe +1 dado de dano e +1 dado de defesa. Sofre –1 em Precisão com armas que exigem técnica fina. Ao encerrar, o personagem fica ofegante.",
        tipo: "Sustentada",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 11,
        recarga: 7,
        duracao: 0,
        dado: "0",
        bonus: [
          "Ataques desarmados causam 3d8",
          "+1 dado de dano e defesa",
          "-1 em Precisão com armas finas"
        ]
      },
      {
        nome: "Regeneração Profana",
        descricao: "Ferimentos se fecham de forma antinatural. No início do turno seguinte à ativação, o Worgen recupera uma quantidade moderada de HP (6d6+12). Ignora penalidades de ferimentos leves durante a duração. Se usado sob fogo sagrado, a cura é reduzida pela metade.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 11,
        recarga: 3,
        duracao: 0,
        dado: "6d6+12",
        bonus: [
          "Recupera HP moderado no turno seguinte",
          "Ignora penalidades de ferimentos leves",
          "Reduzido pela metade contra fogo sagrado"
        ]
      },
      {
        nome: "Fome Worgen",
        descricao: "O personagem possui um atributo especial chamado Fome, variando de 0 a 100, iniciando em 50. Ficar longos períodos sem se alimentar aumenta a Fome. Alimentar-se de uma criatura viva reduz a Fome e recupera HP. Criaturas sem sangue não reduzem Fome nem curam HP.",
        tipo: "Sustentada",
        alcance: "CaC",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Atributo Fome de 0 a 100",
          "Alimentação recupera HP e reduz Fome",
          "Sem alimentação aumenta Fome progressivamente"
        ]
      }
    ],
    codigo: "0010"
  },
  {
    id: "murkal",
    nome: "Mur'kal",
    tipo: "Re'Geron",
    raridade: "epico",
    descricao: "Os Mur’kal são uma raça anfíbia tribal, surgida em costas, pântanos e ruínas submersas. Baixos, de pele escamosa e olhos salientes, emitem sons guturais que soam como grasnados — mas isso é só a camada externa da linguagem. Eles não são burros. São alienígenas ao pensamento terrestre. Cultura e Sociedade A sociedade Mur’kal é baseada em Cardumes-Tribo. Cada grupo é guiado por: um Cantor de Maré (líder espiritual) um Predador Ancião (líder de guerra) Eles acreditam que o mundo terrestre é uma fase temporária do oceano. Tudo, cedo ou tarde, será água novamente. Objetos brilhantes não são tesouros. São iscas sagradas.",
    limiteAtributo: 100,
    imagem: "https://i.imgur.com/FAwwfMj.png",
    atributos: {
      forca: "3d6+6",
      vitalidade: "4d6+8",
      agilidade: "6d6+14",
      inteligencia: "3d6+6",
      percepcao: "5d6+10",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Instinto de Cardume",
        descricao: "Mur'kal lutam melhor em grupo. Quanto mais aliados próximos, mais coordenadas e agressivas se tornam suas ações. Para cada aliado adjacente (máx. 2), recebe +1 Precisão ou +1 Evasão. Em ações combinadas, o Mur'kal pode agir logo após um aliado, sem custo adicional.",
        bonus: [
          "+1 Precisão ou Evasão por aliado adjacente",
          "Máximo de +2 com dois aliados",
          "Ação livre após aliado em combinação"
        ]
      },
      {
        nome: "Anfíbios Natos",
        descricao: "Movem-se com extrema facilidade em ambientes aquáticos ou alagados, enxergando e lutando quase tão bem quanto em terra. Ignora penalidades de combate e movimento em água. Recebe +2 Evasão contra ataques à distância enquanto submerso.",
        bonus: [
          "Ignora penalidades de água",
          "Visão e combate normais na água",
          "+2 Evasão contra distância submerso"
        ]
      },
      {
        nome: "Linguagem da Maré",
        descricao: "Sua comunicação mistura som, ritmo e gesto. Mur'kal conseguem transmitir intenções complexas rapidamente entre si, mas são difíceis de ler por outras raças. Comunicação tática entre Mur'kal ocorre como ação livre. Inimigos não Mur'kal sofrem –3 Reação ao tentar prever ações do grupo.",
        bonus: [
          "Comunicação tática como ação livre",
          "Inimigos sofrem –3 ao prever ações",
          "Linguagem incompreensível para outros"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Ataque Coordenado",
        descricao: "Se houver um aliado adjacente, o ataque causa +4d8 de dano adicional.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: 13,
        recarga: 2,
        duracao: 0,
        dado: "4d8",
        bonus: [
          "+4d8 dano adicional com aliado adjacente"
        ]
      },
      {
        nome: "Maré de Guerra",
        descricao: "Enquanto ativa, aliados recebem +1 Precisão e ignoram parcialmente penalidades de terreno aquático.",
        tipo: "Sustentada",
        alcance: "8 m",
        alvos: "1 a 4",
        custo: 13,
        recarga: 4,
        duracao: 0,
        dado: "0",
        bonus: [
          "+1 Precisão para aliados",
          "Ignora penalidades de terreno aquático",
          "Alcance de até 4 alvos"
        ]
      },
      {
        nome: "Grito Abissal",
        descricao: "Inimigos sofrem Medo e –2 Precisão.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "No alcance",
        custo: 9,
        recarga: 3,
        duracao: 2,
        dado: "0",
        bonus: [
          "Medo nos inimigos",
          "-2 Precisão dos inimigos",
          "Duração de 2 turnos"
        ]
      },
      {
        nome: "Instinto de Cardume Avançado",
        descricao: "Para cada aliado adjacente, o Mur'kal recebe +1 Precisão (máx. +3).",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+1 Precisão por aliado adjacente",
          "Máximo de +3 com três aliados",
          "Permanente enquanto aliados próximos"
        ]
      },
      {
        nome: "Caçador das Profundezas",
        descricao: "Move-se por água ou terreno difícil e ataca. Ignora Evasão baseada em distância e causa 6d8 de dano.",
        tipo: "Imediata",
        alcance: "Movimentação",
        alvos: "1",
        custo: 13,
        recarga: 4,
        duracao: 0,
        dado: "6d8",
        bonus: [
          "Movimento através de qualquer terreno",
          "Ignora Evasão baseada em distância",
          "Dano aumentado em ambiente aquático"
        ]
      }
    ],
    codigo: "0011"
  },
  {
    id: "espirito",
    nome: "Espírito",
    tipo: "Re'Geron",
    raridade: "mitico",
    descricao: "Os Espíritos são entidades formadas a partir de emoções positivas intensas e da convergência de elementos primordiais do mundo. Eles não possuem uma forma fixa: seu corpo se molda conforme o sentimento que os originou e o elemento ao qual estão ligados. Um Espírito de esperança pode parecer luz em movimento; um de serenidade pode assumir a forma de água calma ou vento suave. Diferente das raças físicas, os Espíritos não veem o mundo como território, mas como fluxo. Eles existem enquanto sua emoção-fonte permanece viva e tendem a se transformar quando o ambiente emocional ou elemental ao redor muda, tornando-os seres mutáveis, raros e profundamente simbólicos.",
    limiteAtributo: 150,
    imagem: "https://i.imgur.com/5FGgXkr.png",
    atributos: {
      forca: "3d4+6",
      vitalidade: "4d6+10",
      agilidade: "5d8+12",
      inteligencia: "5d6+12",
      percepcao: "5d8+10",
      sorte: "4d20+20"
    },
    habilidadesBasicas: [
      {
        nome: "Estado da Harmonia",
        descricao: "Enquanto estiver agindo de forma coerente com sua emoção-fonte, o Espírito recebe +2 em todas as rolagens relacionadas a suporte, proteção ou restauração. Uma vez por cena, pode anular um efeito negativo leve em um aliado ao estabilizar o ambiente emocional da cena.",
        bonus: [
          "+2 em ações de suporte, proteção ou restauração",
          "Anula efeito negativo leve em aliado uma vez por cena",
          "Estabiliza ambiente emocional"
        ]
      },
      {
        nome: "Estado da Fluidez",
        descricao: "O Espírito pode alterar parcialmente sua forma para se adaptar à situação (corpo etéreo, expansão elemental, contornos mutáveis). Recebe bônus em movimentação, evasão ou ações criativas que envolvam ambiente e elemento. Uma vez por cena, pode ignorar um obstáculo físico ou condição restritiva.",
        bonus: [
          "Altera forma parcialmente",
          "Bônus em movimentação e evasão",
          "Ignora obstáculo físico uma vez por cena"
        ]
      },
      {
        nome: "Estado da Inspiração",
        descricao: "Sempre que o Espírito inspirar esperança, coragem ou calma em aliados, concede a eles bônus temporários em suas próximas ações. Uma vez por cena, pode elevar uma falha aliada à sucesso parcial, desde que a ação esteja alinhada a um propósito positivo.",
        bonus: [
          "Concede bônus a aliados inspirados",
          "Eleva falha a sucesso parcial uma vez por cena",
          "Propósitos positivos amplificados"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Corpo Emocional",
        descricao: "O corpo do Espírito não é fixo — ele reage ao estado emocional dominante. Recebe +3 Resistência Mágica, sofre -50% de dano físico direto. Efeitos emocionais positivos têm efeito ampliado no Espírito.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+3 Resistência Mágica",
          "-50% dano físico direto",
          "Efeitos positivos ampliados"
        ]
      },
      {
        nome: "Forma Fluida",
        descricao: "O Espírito desfaz parcialmente sua forma, tornando-se fluxo elemental. Recebe +5 em Esquiva, ignora agarrões e empurrões físicos. Pode atravessar espaços estreitos ou parcialmente sólidos.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 13,
        recarga: 2,
        duracao: 0,
        dado: "0",
        bonus: [
          "+5 em Esquiva",
          "Ignora agarrões e empurrões",
          "Atravessa espaços estreitos"
        ]
      },
      {
        nome: "Ressonância Positiva",
        descricao: "A presença do Espírito amplifica emoções construtivas. Aliados recebem +2 em testes defensivos, remove ou reduz efeitos de medo leve, confusão emocional ou hesitação. Não funciona em criaturas sem emoções.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "No alcance",
        custo: 15,
        recarga: 4,
        duracao: 0,
        dado: "0",
        bonus: [
          "+2 Defesa para aliados",
          "Remove medo leve ou confusão",
          "Amplifica emoções construtivas"
        ]
      },
      {
        nome: "Existência em Fluxo",
        descricao: "O Espírito se alinha totalmente ao fluxo emocional do ambiente. Pode alterar sua aparência para refletir a emoção predominante da cena. Recebe +3 em todas as ações não ofensivas por 1 cena.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 15,
        recarga: "1 p/ Combate",
        duracao: 0,
        dado: "0",
        bonus: [
          "Altera aparência à emoção da cena",
          "+3 em ações não ofensivas",
          "Vantagens narrativas pela emoção"
        ]
      },
      {
        nome: "Manifestação Elemental",
        descricao: "O Espírito canaliza o elemento ao qual está ligado (luz, água, vento, calor suave, etc.). Causa 12 de dano elemental leve ou aplica um efeito narrativo coerente.",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "No alcance",
        custo: 17,
        recarga: 2,
        duracao: 0,
        dado: "0",
        bonus: [
          "Dano elemental leve",
          "Efeito narrativo coerente",
          "Escolhe entre dano ou efeito"
        ]
      }
    ],
    codigo: "0012"
  },
  {
    id: "demonoid",
    nome: "Demonoid",
    tipo: "Re'Geron",
    raridade: "lendario",
    descricao: "Os Demonoids são uma raça nativa de Sultran, nascidos da convergência entre energia caótica, desejo, dor e sobrevivência extrema. Diferente de outras raças infernais, os Demonoids evoluem ao abandonar a monstruosidade. Quanto mais humanoide se torna, sua forma mais estável, inteligente e poderosa a criatura se torna. A forma inicial de um Demonoid é bestial, instintiva e grotesca. No entanto, à medida que absorve energia, experiências ou outros seres infernais, sua estrutura se reorganiza, aproximando-se de um corpo humanoide. Esse processo não é apenas físico — é mental e espiritual. Tornar-se “mais humano” significa adquirir consciência, estratégia e controle absoluto do próprio poder. No Inferno, a aparência não engana: quanto mais humano um Demonoid parece, mais perigoso ele é.",
    limiteAtributo: 130,
    imagem: "https://i.imgur.com/aX1Ifl8.png",
    atributos: {
      forca: "5d8+14",
      vitalidade: "5d8+12",
      agilidade: "4d8+12",
      inteligencia: "4d6+8",
      percepcao: "4d6+10",
      sorte: "4d20+20"
    },
    habilidadesBasicas: [
      {
        nome: "Vetor da Assimilação",
        descricao: "Sempre que derrotar inimigos relevantes, o Demonoid pode absorver fragmentos de poder, recebendo bônus temporários ou evoluções graduais a critério do sistema.",
        bonus: [
          "Absorve poder de inimigos derrotados",
          "Bônus temporários progressivos",
          "Evolução gradual permanente"
        ]
      },
      {
        nome: "Vetor da Forma",
        descricao: "O Demonoid pode alterar parcialmente sua forma para combate, defesa ou mobilidade. Quanto mais humanoide for sua forma base, maior o controle e menor o custo dessas alterações.",
        bonus: [
          "Altera forma para combate ou defesa",
          "Controle baseado em humanidade",
          "Custos reduzidos com mais humanoidade"
        ]
      },
      {
        nome: "Vetor da Consciência",
        descricao: "O Demonoid recebe bônus em ações táticas, intimidação e uso consciente de poder. Uma vez por cena, pode antecipar uma ação inimiga, reduzindo seu impacto ou anulando vantagens.",
        bonus: [
          "+2 em ações táticas e intimidação",
          "Antecipa ação inimiga uma vez por cena",
          "Reduz impacto ou anula vantagens"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Forma Bestial Inicial",
        descricao: "O Demonoid nasce como uma criatura instintiva e grotesca. +10 FOR, ataques corpo a corpo causam +9 de dano. Sofre –3 em testes sociais e estratégicos. Essa Art representa o estado primitivo da raça.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+10 Força",
          "+9 dano em ataques corpo a corpo",
          "-3 em testes sociais"
        ]
      },
      {
        nome: "Humanização Progressiva",
        descricao: "Quanto mais o Demonoid se aproxima de uma forma humanoide, mais perigoso ele se torna. Recebe Marcas de Humanização ao absorver poder. A cada 3 Marcas: +1 INT ou PER, reduz penalidades sociais.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Ganha Marcas de Humanização",
          "+1 INT ou PER a cada 3 Marcas",
          "Reduz penalidades sociais progressivamente"
        ]
      },
      {
        nome: "Metabolismo do Caos",
        descricao: "O corpo do Demonoid recicla dor e energia infernal. Sempre que sofre dano, recupera 1d12+4 de Energia. Efeitos caóticos causam –50% de dano. Não funciona contra dano sagrado.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Recupera Energia ao sofrer dano",
          "-50% dano de efeitos caóticos",
          "Conversão de dano em poder"
        ]
      },
      {
        nome: "Aparência do Perigo",
        descricao: "No Inferno, a aparência é um aviso. Quanto mais humanoide o Demonoid se apresenta, maior o respeito gerado. Recebe vantagens narrativas em intimidação ou domínio territorial.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Vantagens em intimidação",
          "Reconhecimento como ameaça",
          "Domínio territorial narrativo"
        ]
      },
      {
        nome: "Olhar do Demônio Civilizado",
        descricao: "Um Demonoid consciente não ameaça — ele calcula. O alvo sofre –3 em ações defensivas, o Demonoid recebe +3 em ações contra esse alvo. Criaturas infernais inferiores podem hesitar.",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "1",
        custo: 13,
        recarga: 4,
        duracao: 0,
        dado: "0",
        bonus: [
          "-3 Defesa do alvo",
          "+3 Ataque do Demonoid",
          "Hesitação em criaturas inferiores"
        ]
      }
    ],
    codigo: "0013"
  },
  {
    id: "drakhen",
    nome: "Drakhen",
    tipo: "Re'Geron",
    raridade: "lendario",
    descricao: "Os Drakhen são uma raça ancestral cuja existência se desenvolve em dois estágios naturais, não por linhagem, mas por acúmulo de era, poder e significado. Todo dragão nasce inferior. Pouquíssimos sobrevivem tempo suficiente para deixar de ser. Não é título. É metamorfose.",
    limiteAtributo: 200,
    imagem: "https://i.imgur.com/36eTUCw.png",
    atributos: {
      forca: "6d8+15",
      vitalidade: "6d8+15",
      agilidade: "3d6+8",
      inteligencia: "5d6+12",
      percepcao: "5d6+10",
      sorte: "4d20+20"
    },
    habilidadesBasicas: [
      {
        nome: "Presença Dracônica",
        descricao: "A simples existência de um Drakhen altera o ambiente: animais fogem, o clima reage, e criaturas menores sentem instintivamente sua autoridade. Inimigos de nível inferior sofrem –3 Precisão no primeiro ataque da cena. Testes de intimidação recebem +3.",
        bonus: [
          "-3 Precisão inimigos inferiores",
          "+3 em intimidação",
          "Alteração ambiental narrativa"
        ]
      },
      {
        nome: "Memória Ancestral",
        descricao: "Drakhen carregam fragmentos de lembranças raciais antigas. Mesmo jovens, sabem coisas que nunca viveram — mapas, nomes, erros passados. 1 vez por cena, pode receber +3 em um teste de conhecimento. Contra criaturas antigas, recebe +2 Precisão no primeiro ataque.",
        bonus: [
          "+3 em teste de conhecimento uma vez por cena",
          "+2 Precisão contra criaturas antigas",
          "Memória de ancestrais"
        ]
      },
      {
        nome: "Ascensão Potencial",
        descricao: "Todo Drakhen carrega a possibilidade de transcender. Ao atingir metade dos PV, recebe +1 Precisão e +1 Evasão por 1 rodada (Max +5). Arts de Domínio III+ custam –30% Energia nesse estado.",
        bonus: [
          "+1 Precisão e Evasão abaixo de 50% HP",
          "Máximo de +5 por rodada",
          "-30% custo de Arts avançadas"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Rugido da Linhagem",
        descricao: "Inimigos sofrem –3 Precisão e debuff condicional de Moral.",
        tipo: "Imediata",
        alcance: "8 m",
        alvos: "No alcance",
        custo: 9,
        recarga: 3,
        duracao: 1,
        dado: "0",
        bonus: [
          "-3 Precisão em inimigos",
          "Debuff de Moral",
          "Efeito por 1 turno"
        ]
      },
      {
        nome: "Escamas Reativas",
        descricao: "A cada 5 pontos na defesa base Drakhen adiciona 1 dado adicional em sua defesa durante uso da art.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 7,
        recarga: 3,
        duracao: 0,
        dado: "0",
        bonus: [
          "+1 dado por 5 pontos de defesa base",
          "Escamas reativas adaptáveis",
          "Defesa progressiva"
        ]
      },
      {
        nome: "Sangue Ancestral",
        descricao: "Abaixo de 50% PV: +3 Precisão. Abaixo de 25% PV: +3 Evasão adicional.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+3 Precisão abaixo de 50% HP",
          "+3 Evasão abaixo de 25% HP",
          "Poder crescente na adversidade"
        ]
      },
      {
        nome: "Memória Elemental",
        descricao: "Libera fogo, gelo ou raio. Causa 6d12 de dano elemental, ignorando resistência comum.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "No alcance",
        custo: 13,
        recarga: 4,
        duracao: 0,
        dado: "6d12",
        bonus: [
          "Escolhe elemento: fogo, gelo ou raio",
          "Ignora resistência comum",
          "Dano elemental puro"
        ]
      },
      {
        nome: "Limiar da Ascensão",
        descricao: "O Drakhen manifesta sua herança superior. Recebe +1 Precisão, +1 Evasão e ataques causam +3 dados de dano elemental adicional.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 16,
        recarga: "1 p/ Sessão",
        duracao: 3,
        dado: "0",
        bonus: [
          "+1 Precisão e Evasão",
          "+3 dados de dano elemental",
          "Duração de 3 rodadas"
        ]
      }
    ],
    codigo: "0014"
  },
  {
    id: "dracolito",
    nome: "Dracólito",
    tipo: "Re'Geron",
    raridade: "mitico",
    descricao: "Os Dracólitos são Espíritos elevados ao mais alto grau de afinidade elemental. Desde o início dos tempos, eles surgem quando um Espírito alcança perfeita ressonância com seu elemento natural, tornando-se não apenas um usuário desse elemento, mas sua encarnação consciente. Cada elemento primordial do mundo possui um único Dracólitos ativo, e sua existência mantém o equilíbrio e a estabilidade daquela força na realidade. Assim como os Espíritos, os dracólitos não possuem uma forma fixa. Sua aparência é fluida e simbólica, moldada pelo elemento que representam e pelo estado do mundo ao seu redor. Um Dracólitos do Fogo pode parecer uma silhueta viva de chamas conscientes; um da Água, uma entidade em constante fluxo; um do Vento, uma presença quase invisível em movimento eterno. Eles não “controlam” o elemento — eles são o elemento, dotado de vontade, memória e propósito. A sucessão dos dracólitos ocorre por meio de um ritual ancestral de transmissão de poder, no qual um Dracólitos veterano treina e prepara seu sucessor por eras, até que a autoridade elemental seja transferida. Caso um Dracólitos seja destruído sem que a sucessão seja concluída, o elemento correspondente entra em desordem, tornando-se instável e afetando profundamente todos os dracólitos irmãos ligados a elementos correlatos.",
    limiteAtributo: 200,
    imagem: "https://i.imgur.com/eCiyC7m.png",
    atributos: {
      forca: "4d10+30",
      vitalidade: "4d10+30",
      agilidade: "4d10+30",
      inteligencia: "4d10+30",
      percepcao: "4d10+30",
      sorte: "3d20+40"
    },
    habilidadesBasicas: [
      {
        nome: "Estado da Harmonia Primordial",
        descricao: "Enquanto o elemento estiver estável no mundo, o Dracólito recebe bônus passivos constantes (defesa, regeneração ou controle ambiental). Pode, uma vez por cena, suprimir instabilidades elementais ou mitigar catástrofes causadas por desequilíbrio.",
        bonus: [
          "Bônus passivo por estabilidade elemental",
          "Suprime instabilidades uma vez por cena",
          "Controle ambiental narrativo"
        ]
      },
      {
        nome: "Estado da Transmissão",
        descricao: "O Dracólito pode investir fragmentos de sua autoridade em discípulos, aliados ou rituais, concedendo poderes temporários ou preparando um sucessor.",
        bonus: [
          "Transmite poder a aliados",
          "Prepara sucessores",
          "Investimento de autoridade elemental"
        ]
      },
      {
        nome: "Ruptura Elemental",
        descricao: "Se um Dracólito for destruído sem que a transmissão seja concluída, o elemento correspondente entra em estado de desordem: fenômenos extremos surgem, a magia se torna instável.",
        bonus: [
          "Consequência de destruição sem sucessão",
          "Desordem elemental narrativa",
          "Efeito cósmico"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Encarnação Elemental",
        descricao: "O Dracólito não manipula o elemento — ele existe como ele. Define 1 Elemento Primordial. Imunidade parcial ao próprio elemento, +3 Resistência Mística. Testes ligados ao elemento recebem +3.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Escolhe elemento primordial",
          "Imunidade ao próprio elemento",
          "+3 Resistência Mística e Testes"
        ]
      },
      {
        nome: "Forma Simbólica",
        descricao: "A forma do Dracólito é fluida e responde ao estado do mundo. Pode alterar aparência de forma simbólica. Recebe vantagens narrativas em ambientes alinhados ao elemento.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Altera forma simbolicamente",
          "Vantagens em ambientes alinhados",
          "Reconhecimento instintivo"
        ]
      },
      {
        nome: "Ressonância Absoluta",
        descricao: "A presença do Dracólito impõe o ritmo natural do elemento. Criaturas alinhadas recebem +2, criaturas opostas sofrem –3. Ambientes instáveis se reorganizam temporariamente.",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "No alcance",
        custo: 15,
        recarga: 3,
        duracao: 0,
        dado: "0",
        bonus: [
          "+2 para criaturas alinhadas",
          "-3 para criaturas opostas",
          "Reorganização ambiental"
        ]
      },
      {
        nome: "Sucessão Ancestral",
        descricao: "O Dracólito carrega a responsabilidade da continuidade. Pode treinar ou preparar um sucessor. Compartilha fragmentos de memória e consciência elemental.",
        tipo: "Imediata",
        alcance: "CaC",
        alvos: "1",
        custo: "100% EnR",
        recarga: 1,
        duracao: 0,
        dado: "0",
        bonus: [
          "Treina sucessor",
          "Compartilha poder elemental",
          "Garante continuidade"
        ]
      },
      {
        nome: "Autoridade Elemental",
        descricao: "Enquanto existir, o Dracólito sustenta o equilíbrio do elemento. Dano recebido sofre –12. Tentativas de selar ou corromper o elemento sofrem penalidade. Recebe +2 em todas as defesas.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "-12 dano recebido",
          "-5 selagem/corrupção elemental",
          "+2 todas as defesas"
        ]
      },
      {
        nome: "Manifestação Primordial",
        descricao: "O Dracólito manifesta uma ação direta do elemento (dano contínuo, empurrão, cura, deslocamento).",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "1",
        custo: 17,
        recarga: 2,
        duracao: 0,
        dado: "0",
        bonus: [
          "Escolhe efeito elemental",
          "Manifesto direto do elemento",
          "Efeito coerente com tipo"
        ]
      }
    ],
    codigo: "0015"
  },
  {
    id: "morvak",
    nome: "Morvak",
    tipo: "Re'Geron",
    raridade: "mitico",
    descricao: "Os Morvak são entidades nascidas do medo do desconhecido, do terror primordial que surge quando a realidade falha em oferecer respostas. Eles não são criados, invocados ou corrompidos — eles emergem sempre que o mundo encara algo que não consegue compreender.Opostos diretos dos Espíritos e dos Dracolitos, os Morvak não representam emoções positivas nem elementos ordenados. Eles personificam o vazio c dúvida, pânico, presságio e a sensação de que algo está errado antes mesmo de acontecer. Assim como os Espíritos, cada Morvak possui uma aparência única e instável, moldada pelo tipo de medo que o originou. Alguns assumem formas distorcidas e fragmentadas, outros parecem sombras com intenção, reflexos errados da realidade ou figuras quase humanoides que causam desconforto apenas por existirem. Onde um Morvak caminha, o mundo não se rompe — ele hesita.",
    limiteAtributo: 200,
    imagem: "https://i.imgur.com/ADeZ9Gn.png",
    atributos: {
      forca: "4d6+18",
      vitalidade: "4d10+25",
      agilidade: "4d8+20",
      inteligencia: "4d6+18",
      percepcao: "5d8+25",
      sorte: "4d20+20"
    },
    habilidadesBasicas: [
      {
        nome: "Núcleo do Presságio",
        descricao: "O Morvak recebe +3 em ações de intimidação, percepção e antecipação. Uma vez por cena, pode impor desvantagem ou penalidade leve a um inimigo ao fazê-lo hesitar.",
        bonus: [
          "+3 em intimidação e percepção",
          "Impõe desvantagem uma vez por cena",
          "Hesitação do inimigo"
        ]
      },
      {
        nome: "Núcleo da Distorção",
        descricao: "O Morvak pode alterar sutilmente sua forma ou presença, confundindo percepção, alcance ou posição. Recebe bônus em esquiva, furtividade ou manipulação de ambiente. Uma vez por cena, pode negar uma ação direta.",
        bonus: [
          "Altera forma ou presença",
          "+1 Esquiva e Furtividade",
          "Nega ação uma vez por cena"
        ]
      },
      {
        nome: "Núcleo da Erosão",
        descricao: "Sempre que um inimigo falhar em uma rolagem próximo ao Morvak, ele sofre efeitos cumulativos de desgaste. Uma vez por cena, o Morvak pode enfraquecer defesas ou bônus ativos.",
        bonus: [
          "Desgaste cumulativo em falhas",
          "Enfraquecimento de defesas uma vez por cena",
          "Erosão de resistências"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Existência Incongruente",
        descricao: "A simples presença do Morvak não se encaixa no mundo. +3 Resistência Mística, primeiro ataque recebido sofre –15 de dano. Criaturas que falham ao acertar sentem desconforto.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+3 Resistência Mística",
          "-15 dano no primeiro ataque",
          "Desconforto em falhas de acerto"
        ]
      },
      {
        nome: "Forma do Medo",
        descricao: "A aparência do Morvak reflete o medo que o originou. Escolhe 1 tipo de medo primário. Recebe vantagens narrativas contra criaturas sensíveis a esse medo.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Escolhe tipo de medo",
          "Vantagens contra sensíveis",
          "Alteração sutil de forma"
        ]
      },
      {
        nome: "Presságio Silencioso",
        descricao: "Inimigos sofrem –2 em Reação e -30% em prontidão. Primeira ação ofensiva de cada inimigo tem chance de falha narrativa.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "No alcance",
        custo: 13,
        recarga: 4,
        duracao: 0,
        dado: "0",
        bonus: [
          "-2 Reação e -30% Prontidão",
          "Falha narrativa em primeira ação",
          "Efeito de presságio"
        ]
      },
      {
        nome: "Reflexo Errado",
        descricao: "Cancela um ataque que acabou de atingir o Morvak. O agressor sofre –5 na próxima ação.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 4,
        duracao: 0,
        dado: "0",
        bonus: [
          "Cancela ataque recebido",
          "-5 próxima ação do agressor",
          "Erro perceptivo"
        ]
      },
      {
        nome: "Vazio Conceitual",
        descricao: "O alvo não pode usar habilidades reativas ou automáticas. Testes estratégicos sofrem –3. Conjurações complexas têm chance de falha.",
        tipo: "Imediata",
        alcance: "5 m",
        alvos: "1",
        custo: 17,
        recarga: 3,
        duracao: 0,
        dado: "0",
        bonus: [
          "Bloqueia habilidades reativas",
          "-3 testes estratégicos",
          "Falha em conjurações"
        ]
      },
      {
        nome: "Onde a Realidade Hesita",
        descricao: "O Morvak força o mundo a questionar a si mesmo. Movimentos rápidos tornam-se comuns. Decisões rápidas exigem testes adicionais.",
        tipo: "Duradoura",
        alcance: "9 m",
        alvos: "No alcance",
        custo: 21,
        recarga: "1 p/ Sessão",
        duracao: 3,
        dado: "0",
        bonus: [
          "Hesitação da realidade",
          "Testes adicionais para ações rápidas",
          "Presságios e eventos estranhos"
        ]
      }
    ],
    codigo: "0016"
  },
  {
    id: "celestine",
    nome: "Celestine",
    tipo: "Re'Geron",
    raridade: "mitico",
    descricao: "Os Celestines são seres alados que não nascem — são consagrados. Cada um deles foi, em vida mortal, responsável por um feito significativo que alterou o curso do mundo de Re’Dungeon. Após a morte, essas almas são elevadas pelos ecos dos deuses antigos e desaparecidos, retornando à existência como Celestines, portadores de um Propósito absoluto. Não possuem uma aparência fixa: sua forma reflete seu propósito, sua história e a lei que passaram a representar. Alguns se assemelham a figuras humanoides aladas, outros a entidades quase abstratas, feitas de luz, símbolos ou conceitos manifestos. Para um Celestine, poder não vem da fé ou da hierarquia, mas da profundidade de seu Propósito — quanto mais fundamental ele é para a ordem do mundo, maior o poder que o Celestine manifesta. Cada Propósito funciona como uma lei viva da realidade. Justiça, Verdade, Vida, Sobrevivência, Esperança ou Domínio não possuem o mesmo peso cósmico, e por isso os Celestines jamais estão no mesmo nível de poder entre si.",
    limiteAtributo: 250,
    imagem: "https://i.imgur.com/bNMxD9E.png",
    atributos: {
      forca: "3d20+35",
      vitalidade: "3d20+35",
      agilidade: "3d20+35",
      inteligencia: "3d20+35",
      percepcao: "3d20+35",
      sorte: "3d20+40"
    },
    habilidadesBasicas: [
      {
        nome: "Manifestação do Dogma",
        descricao: "Enquanto agir estritamente de acordo com seu Propósito, o Celestine recebe +3 em todas as rolagens diretamente relacionadas a ele. Uma vez por cena, pode impor seu Propósito sobre a cena ou um alvo.",
        bonus: [
          "+3 em rolagens do Propósito",
          "Impõe Propósito uma vez por cena",
          "Força resolução alinhada"
        ]
      },
      {
        nome: "Manifestação da Autoridade",
        descricao: "O Celestine emana uma aura conceitual ligada ao seu Propósito, concedendo bônus a aliados alinhados e penalidades a inimigos que o desafiem.",
        bonus: [
          "+2 bônus para aliados alinhados",
          "-2 penalidade para inimigos opostos",
          "Aura conceitual do Propósito"
        ]
      },
      {
        nome: "Manifestação da Ascensão",
        descricao: "Uma vez por cena, o Celestine pode despertar sua habilidade latente, elevando temporariamente seu Propósito a um nível quase divino. Após o uso, sofre consequências narrativas.",
        bonus: [
          "Despertar latente uma vez por cena",
          "Elevação divina temporária",
          "Poder absoluto com custo"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Consagração Pós-Morte",
        descricao: "A alma do Celestine foi elevada além da condição mortal. +5 em um atributo ligado ao Propósito, +1 Resistência Mística. Não sofre penalidades por medo, corrupção ou desespero.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+5 em atributo do Propósito",
          "+1 Resistência Mística",
          "Imunidade a medo e corrupção"
        ]
      },
      {
        nome: "Forma do Propósito",
        descricao: "A aparência do Celestine é reflexo direto da lei que ele representa. Pode alterar sua forma coerentemente com o Propósito.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Altera forma com Propósito",
          "Vantagens narrativas relacionadas",
          "Reconhecimento automático"
        ]
      },
      {
        nome: "Autoridade do Propósito",
        descricao: "A simples presença do Celestine impõe a lei que ele encarna. Inimigos sofrem –3 em ações que contrariem o Propósito. Ações alinhadas recebem –30% no custo.",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "No alcance",
        custo: 15,
        recarga: 3,
        duracao: 0,
        dado: "0",
        bonus: [
          "-3 em ações contrárias",
          "-30% custo alinhado",
          "Hesitação em caóticos"
        ]
      },
      {
        nome: "Manifestação da Lei Viva",
        descricao: "O Celestine manifesta sua lei como efeito direto (Justiça: dano verdadeiro, Vida: cura, Verdade: revelar ilusões, Sobrevivência: escudo).",
        tipo: "Imediata",
        alcance: "7 m",
        alvos: "1",
        custo: 13,
        recarga: 2,
        duracao: 0,
        dado: "0",
        bonus: [
          "Escolhe manifestação do Propósito",
          "Efeito coerente à lei",
          "Poder absoluto limitado"
        ]
      },
      {
        nome: "Existência Consagrada",
        descricao: "O corpo do Celestine não é apenas físico — é um símbolo. Dano recebido sofre –15. Efeitos de selagem sofrem penalidade. Recebe +2 em todas as defesas.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "-15 dano recebido",
          "-5 selagem/corrupção",
          "+2 todas as defesas"
        ]
      },
      {
        nome: "Eco dos Deuses Antigos",
        descricao: "Os ecos dos deuses desaparecidos respondem ao chamado do Celestine. Recebe +3 em todas as ações ligadas ao Propósito por 1 Batalha. Pode alterar sutilmente a realidade.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 21,
        recarga: "1 p/ Sessão",
        duracao: 0,
        dado: "0",
        bonus: [
          "+3 em ações do Propósito",
          "Alteração sutil da realidade",
          "Poder divino residual"
        ]
      }
    ],
    codigo: "0017"
  },
  {
    id: "opharos",
    nome: "Opharos",
    tipo: "Re'Geron",
    raridade: "mitico",
    descricao: "Os Ópharos são uma raça pré-doutrinária. Eles não foram criados para servir, proteger ou louvar. Eles existem para observar. Surgiram quando o mundo ainda não tinha linguagem suficiente para explicar o sagrado — então o sagrado precisou aprender a se ver. Fisicamente, lembram anjos apenas no que é superficial: forma humanoide, asas, halos, luz etérea. Mas isso é só o casco compreensível. A verdadeira natureza deles começa quando você presta atenção demais. Suas asas não são apenas penas: são estruturas sensoriais, cheias de olhos que se abrem conforme o nível de consciência do Ópharo em relação ao Divino, ao Caos ou à Verdade Absoluta. Quanto mais ele entende a realidade, mais olhos surgem. Quanto mais olhos, menos humano ele parece.",
    limiteAtributo: 200,
    imagem: "https://i.imgur.com/lOIcKqW.png",
    atributos: {
      forca: "3d6+8",
      vitalidade: "4d6+10",
      agilidade: "5d8+12",
      inteligencia: "6d6+15",
      percepcao: "6d6+15",
      sorte: "4d20+20"
    },
    habilidadesBasicas: [
      {
        nome: "Olhar Revelador",
        descricao: "Ópharos percebem ilusões, mentiras grosseiras e distorções da realidade com facilidade anormal. +2 em testes de Percepção visual e Identificação de ilusões. Ignora –2 de penalidade por efeitos visuais. 1 vez por cena, pode reduzir em 1 turno duração de uma ilusão.",
        bonus: [
          "+2 em Percepção visual",
          "Ignora penalidades de ilusão",
          "Reduz duração de ilusões uma vez por cena"
        ]
      },
      {
        nome: "Asas Sensoriais",
        descricao: "As asas funcionam como órgãos de percepção ampliada, detectando magia, intenções hostis ou alterações no destino. +2 Reação contra ataques surpresa. Detecta hostilidade até 1 turno antes. Percebe uso de Arts mágicas a 6 metros.",
        bonus: [
          "+2 Reação contra surpresa",
          "Detecta hostilidade antecipadamente",
          "Percebe magia próxima"
        ]
      },
      {
        nome: "Consciência Gradual",
        descricao: "Ópharos não evoluem por nível, mas por compreensão. Ao subir o Domínio de uma Art, recebe +1 de Precisão ou Evasão. Testes sociais de empatia sofrem –1, enquanto análise recebe +1.",
        bonus: [
          "+1 Precisão ou Evasão por Art elevada",
          "-1 empatia, +1 análise",
          "Compreensão gera poder"
        ]
      }
    ],
    habilidadesAvancadas: [
      {
        nome: "Olhar Revelador Avançado",
        descricao: "O Ópharos foca sua visão além do véu. Ilusões, camuflagens e mentiras mágicas são reveladas. O alvo perde bônus de ocultação e sofre –3 Evasão.",
        tipo: "Sustentada",
        alcance: "10 m",
        alvos: "1",
        custo: 9,
        recarga: 2,
        duracao: 0,
        dado: "0",
        bonus: [
          "Revela ilusões totalmente",
          "-3 Evasão do alvo",
          "Ocultação anulada"
        ]
      },
      {
        nome: "Presságio Imediato",
        descricao: "Ao prever o próximo instante, o Ópharos antecipa um ataque. Ganha +3 Evasão contra uma ação inimiga e ignora efeitos de surpresa.",
        tipo: "Imediata",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 7,
        recarga: 3,
        duracao: 0,
        dado: "0",
        bonus: [
          "+3 Evasão contra ataque",
          "Ignora surpresa",
          "Antecipação perfeita"
        ]
      },
      {
        nome: "Asas da Leitura Etérea",
        descricao: "As asas sensoriais detectam fluxos mágicos e intenção hostil. Aliados recebem +1 Precisão e +1 Percepção enquanto ativa.",
        tipo: "Sustentada",
        alcance: "8 m",
        alvos: "1 a 3",
        custo: 11,
        recarga: 4,
        duracao: 0,
        dado: "0",
        bonus: [
          "+1 Precisão e Percepção para aliados",
          "Detecção ampliada",
          "Amplificação sensorial"
        ]
      },
      {
        nome: "Consciência Deslocada",
        descricao: "A mente do Ópharos não se ancora totalmente no presente. Uma vez por cena, ao falhar em teste de Percepção ou Resistência mental, pode tratar como sucesso parcial.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "Sucesso parcial em falhas uma vez por cena",
          "Deslocamento temporal mental",
          "Evasão de penalidades severas"
        ]
      },
      {
        nome: "Visão que Fragmenta",
        descricao: "O inimigo encara uma verdade impossível de processar (Teste de Vontade Obstáculo 15). Caso falhe, sofre 12d6 de dano psíquico e aplica Desorientado.",
        tipo: "Imediata",
        alcance: "6 m",
        alvos: "1",
        custo: 13,
        recarga: 3,
        duracao: 0,
        dado: "12d6",
        bonus: [
          "Dano psíquico puro",
          "Ignora Defesa",
          "Efeito Desorientado"
        ]
      },
      {
        nome: "Excesso de Consciência",
        descricao: "Sempre que o Ópharos revelar uma ilusão, mentira ou efeito oculto, recebe +2 Precisão ou Evasão até o início do próximo turno.",
        tipo: "Duradoura",
        alcance: "Pessoal",
        alvos: "Você",
        custo: 0,
        recarga: 0,
        duracao: 0,
        dado: "0",
        bonus: [
          "+2 Precisão ou Evasão por revelação",
          "Não acumula",
          "Compreensão gera poder"
        ]
      }
    ],
    codigo: "0018"
  },
  {
    id: "refugiado",
    nome: "Refugiado",
    tipo: "A Crônica dos Varkhan",
    raridade: "comum",
    descricao: "O Refugiado é o retrato vivo da sobrevivência diante da adversidade. Forçado a abandonar seu lar devido a guerras devastadoras, catástrofes naturais ou perseguições políticas, ele carrega em sua bagagem não apenas pertences materiais escassos, mas o peso da perda e a cicatriz de um passado abruptamente interrompido. Essa vivência traumática molda uma personalidade cautelosa, observadora e extremamente pragmática. Eles não buscam a glória ou o heroísmo cego; seu objetivo principal é garantir que eles e aqueles sob sua responsabilidade vejam o amanhecer do dia seguinte. No grupo de aventureiros, o Refugiado costuma atuar como a voz da razão e da prudência, sendo excelente em prever riscos e encontrar soluções engenhosas com recursos mínimos.",
    imagem: " https://imgur.com/Dw1dXYE.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d6+2",
      vitalidade: "2d6+6",
      agilidade: "2d6+2",
      inteligencia: "2d6+4",
      percepcao: "2d8+4",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Engenhosidade",
        descricao: "A vida na fuga ensinou o Refugiado a tirar o máximo proveito de cada situação e de cada item. Ele possui uma mente ágil para improvisar soluções em momentos de crise.",
        bonus: [
          "Uma vez por cena, o Refugiado pode gastar uma ação bônus para transformar um item mundano (pedaço de pano, corda, galho, etc.) em uma ferramenta útil à situação. Isso pode conceder vantagem em um teste de perícia específico ou permitir uma ação que seria impossível sem a ferramenta."
        ]
      },
      {
        nome: "Olhar Atento",
        descricao: "Acostumado a vigiar constantemente os horizontes em busca de patrulhas inimigas, perigos naturais ou fontes ocultas de água e comida, o Refugiado desenvolveu sentidos extraordinariamente aguçados.",
        bonus: [
          "+2 em todos os testes ativos ou passivos de Percepção e Furtividade"
        ]
      },
      {
        nome: "Resiliência",
        descricao: "O sofrimento físico e a fadiga mental moldaram um corpo e uma mente difíceis de quebrar. Uma vez por cena, ao sofrer qualquer tipo de dano, o Refugiado pode canalizar sua força de vontade interna para mitigar parte da dor.",
        bonus: [
          "Uma vez por cena: reduz o dano recebido em 2d4"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0019"
  },
  {
    id: "aprendiz",
    nome: "Aprendiz",
    tipo: "A Crônica dos Varkhan",
    raridade: "comum",
    descricao: "O Aprendiz personifica a promessa do futuro e o início da jornada do herói. Geralmente jovem, ele se dedica ao estudo de um ofício complexo, uma arte refinada ou os mistérios da magia sob a tutela rigorosa de um mentor experiente. Transbordando curiosidade, entusiasmo e uma energia quase inesgotável, o Aprendiz compensa sua óbvia falta de experiência prática com uma dedicação fervorosa e uma mente aberta a novas ideias. Eles costumam ser otimistas e um pouco ingênuos, o que pode colocá-los em situações perigosas, mas sua presença em um grupo traz uma vitalidade renovadora. Em termos de jogo, o Aprendiz é um personagem de alto crescimento, que começa como um assistente versátil e gradualmente se molda em uma força especializada.",
    imagem: "https://i.imgur.com/mYwq4Ql.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d6+2",
      vitalidade: "2d6+6",
      agilidade: "2d6+2",
      inteligencia: "2d6+4",
      percepcao: "2d4+2",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Curiosidade",
        descricao: "O desejo insaciável de compreender o funcionamento do mundo faz com que o Aprendiz absorva informações como uma esponja, concedendo proficiência prática em áreas do conhecimento.",
        bonus: [
          "+2 em testes de Conhecimento Geral, História, Arcana e testes relacionados ao uso prático de magia"
        ]
      },
      {
        nome: "Treinável",
        descricao: "Uma mente jovem e maleável possui uma neuroplasticidade fantástica. No início da campanha, o Aprendiz pode escolher uma Aptidão que receberá um nível intermediário (+3) extra sem gastar pontos de criação, representando um foco recente de estudos. A Aptidão escolhida deve ser 'treinável' por um tutor e ter justificativa no background.",
        bonus: [
          "No início da campanha: ganha uma Aptidão extra em nível intermediário (+3) sem gastar pontos. Requer justificativa e disponibilidade de tutor."
        ]
      },
      {
        nome: "Energia Juvenil",
        descricao: "A juventude traz consigo um vigor físico invejável e uma recusa obstinada em aceitar a derrota. Uma vez por cena, após falhar em um teste físico, o Aprendiz pode repetir a rolagem e ficar com o melhor resultado.",
        bonus: [
          "Uma vez por cena: repetir uma rolagem de atributo físico, mantendo o melhor resultado"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0020"
  },
  {
    id: "estudante",
    nome: "Estudante",
    tipo: "A Crônica dos Varkhan",
    raridade: "comum",
    descricao: "O Estudante compartilha a faixa etária e a sede de conhecimento do Aprendiz, mas seu foco é formal, acadêmico e institucional. Criado em grandes bibliotecas, universidades ou academias de prestígio, ele é treinado em metodologias científicas, análise lógica, dedução e catalogação de dados. Costumam ser indivíduos metódicos, organizados e extremamente intelectuais, embora às vezes sofram com uma certa desconexão do mundo prático ou das nuances das ruas. Para o grupo, o Estudante é o decifrador de enigmas, o tradutor de línguas mortas e o estrategista que analisa os padrões de comportamento dos inimigos através de registros históricos.",
    imagem: "https://imgur.com/8psHGk3.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d4+2",
      vitalidade: "2d6+2",
      agilidade: "2d6+2",
      inteligencia: "2d10+4",
      percepcao: "2d6+6",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Aprendizado Rápido",
        descricao: "Graças ao domínio de técnicas avançadas de leitura dinâmica, memorização e associação de ideias, o Estudante consegue absorver novos conceitos com extrema eficiência.",
        bonus: [
          "+2 em todos os treinamentos de Inteligência"
        ]
      },
      {
        nome: "Curiosidade",
        descricao: "A mente analítica do Estudante não aceita respostas superficiais e está sempre em busca de conexões ocultas.",
        bonus: [
          "+2 em testes de Conhecimento e Percepção"
        ]
      },
      {
        nome: "Teoria Aplicada",
        descricao: "O Estudante tem a capacidade de transformar conhecimento teórico em prática imediata. Ele pode usar sua vasta base de informações para improvisar soluções para problemas técnicos ou mágicos.",
        bonus: [
          "Uma vez por descanso curto: gastar uma ação bônus para realizar um teste de Inteligência (Conhecimento) com obstáculo reduzido em 3 para aplicar uma teoria. Se bem-sucedido, pode desativar armadilhas, aplicar condicionantes técnicos ou permitir uma ação que dependa de conhecimento aplicado."
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0021"
  },
  {
    id: "periferia",
    nome: "Periferia",
    tipo: "A Crônica dos Varkhan",
    raridade: "comum",
    descricao: "O arquétipo da Periferia representa aqueles que cresceram nas margens da sociedade — nos becos escuros das metrópoles, nos distritos industriais esquecidos ou nas favelas onde a lei do Estado raramente chega. Criados sob a égide da escassez, eles aprenderam desde cedo que as regras formais da sociedade muitas vezes servem apenas para proteger os privilegiados. Consequentemente, desenvolveram uma astúcia prática invejável, uma profunda desconfiança em relação a figuras de autoridade e uma lealdade inabalável para com o seu próprio grupo.",
    imagem: "https://imgur.com/eEEpZaY.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d6+2",
      vitalidade: "2d6+4",
      agilidade: "2d6+6",
      inteligencia: "2d6+2",
      percepcao: "2d8+4",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Instinto de Rua",
        descricao: "A vida nas ruas ensina que um segundo de distração pode ser fatal. O personagem desenvolve um \"sexto sentido\" para ler as intenções das pessoas e antecipar perigos urbanos.",
        bonus: [
          "Uma vez por cena: repetir um teste de Percepção falhado"
        ]
      },
      {
        nome: "Corre ou Morre",
        descricao: "Em situações de perigo extremo, a velocidade e a agilidade física são as únicas garantias de sobrevivência.",
        bonus: [
          "+2 em Atletismo, Acrobacia e testes de fuga"
        ]
      },
      {
        nome: "Família Acima de Tudo",
        descricao: "Quando o personagem realiza ações de suporte, defesa ou proteção direta a um aliado, ele recebe um bônus em sua rolagem, canalizando sua determinação em manter sua comunidade viva.",
        bonus: [
          "+3 em ações de suporte/defesa para proteger aliados"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0022"
  },
  {
    id: "militar",
    nome: "Militar",
    tipo: "A Crônica dos Varkhan",
    raridade: "raro",
    descricao: "O Militar é o produto de anos de disciplina rigorosa, treinamento tático exaustivo e, na maioria das vezes, do batismo de fogo no campo de batalha. Seja um soldado de infantaria de um império, um guarda de elite de uma metrópole ou um mercenário calejado, ele compreende perfeitamente a importância da hierarquia, do trabalho em equipe e da execução precisa de ordens.",
    imagem: "https://i.imgur.com/9gLD8aP.jpeg",
    limiteAtributo: 150,
    atributos: {
      forca: "2d8+4",
      vitalidade: "2d6+6",
      agilidade: "2d6+4",
      inteligencia: "2d6+4",
      percepcao: "2d6+2",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Disciplina Militar",
        descricao: "O treinamento psicológico das forças armadas prepara a mente para suportar pressões extremas.",
        bonus: [
          "Uma vez por cena: ignorar penalidades mentais ativas"
        ]
      },
      {
        nome: "Treinamento de Combate",
        descricao: "Especialista no manejo de armas e no aproveitamento de coberturas e ângulos de ataque.",
        bonus: [
          "+1 dado extra em testes de ataque ou uso prático de armas físicas"
        ]
      },
      {
        nome: "Veterano",
        descricao: "Anos de serviço ativo concedem ao Militar um olho clínico para a guerra.",
        bonus: [
          "Bônus narrativo em identificar formações táticas, estimar números e prever estratégias"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0023"
  },
  {
    id: "atleta",
    nome: "Atleta",
    tipo: "A Crônica dos Varkhan",
    raridade: "raro",
    descricao: "O Atleta dedicou sua vida à busca da perfeição física, à superação de limites biológicos e à glória da competição. Sejam corredores velocistas, lutadores de arena, ginastas acrobáticos ou nadadores de resistência, eles possuem uma coordenação motora impecável, reflexos rápidos e uma musculatura perfeitamente condicionada. Além do vigor físico, o Atleta carrega uma mentalidade competitiva inabalável; ele vê cada obstáculo, monstro ou desafio como um oponente a ser superado. No grupo de aventureiros, ele se destaca pela mobilidade extraordinária no campo de batalha, sendo capaz de alcançar posições estratégicas e realizar manobras acrobáticas impossíveis para outros personagens.",
    imagem: "https://imgur.com/PfIoCWF.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d8+4",
      vitalidade: "2d6+6",
      agilidade: "2d10+4",
      inteligencia: "2d6+2",
      percepcao: "2d4+2",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Explosão Física",
        descricao: "Uma reserva de energia explosiva acumulada através de anos de treinos de alta intensidade (HIIT). Uma vez por cena, o Atleta pode ativar esta habilidade para receber um bônus temporário massivo em sua velocidade de movimentação, permitindo-lhe cobrir distâncias duplas, saltar abismos ou alcançar inimigos distantes instantaneamente sem gastar suas ações principais.",
        bonus: [
          "Uma vez por cena: dobrar deslocamento/atingir posições distantes",
          "Permite saltos e manobras sem custo extra"
        ]
      },
      {
        nome: "Corpo Treinado",
        descricao: "Um físico moldado pela disciplina biológica e resistência ao ácido lático. O Atleta ignora completamente os efeitos negativos de fadiga leve ou exaustão física básica, permitindo que continue operando em sua performance máxima mesmo sob condições climáticas adversas ou após longos períodos de esforço contínuo que esgotariam personagens comuns.",
        bonus: [
          "Ignora efeitos de fadiga leve/exaustão física básica",
          "Mantém performance máxima sob esforço prolongado"
        ]
      },
      {
        nome: "Competidor",
        descricao: "A chama da vitória queima intensamente em seu peito. Sempre que estiver envolvido em uma disputa física direta contra outro personagem (como testes resistidos de Força, Atletismo, Luta Livre, Queda de Braço ou Corridas de velocidade), o Atleta recebe um bônus significativo em suas rolagens para garantir a vitória e demonstrar sua superioridade atlética.",
        bonus: [
          "+Bônus significativo em disputas físicas diretas",
          "Vantagem em testes resistidos físicos específicos"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0024"
  },
  {
    id: "criminoso",
    nome: "Criminoso",
    tipo: "A Crônica dos Varkhan",
    raridade: "raro",
    descricao: "O Criminoso opera nas sombras da sociedade, dominando as artes da infiltração, do silêncio e da oportunidade. Seja um ladrão de colarinho branco que frauda contratos, um batedor de carteiras ágil nos mercados ou um contrabandista que conhece todas as rotas secretas, ele compreende as fraquezas do sistema legal e sabe como explorá-las em seu benefício. São indivíduos pragmáticos, perspicazes e extremamente discretos, que preferem resolver problemas com inteligência e sutileza antes que as lâminas precisem ser sacadas. Sua rede de contatos no submundo é uma ferramenta inestimável para obter informações que o dinheiro legal não pode comprar.",
    imagem: "https://imgur.com/9TNgBB4.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d4+2",
      vitalidade: "2d6+2",
      agilidade: "2d8+4",
      inteligencia: "2d6+6",
      percepcao: "2d8+4",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Mãos Leves",
        descricao: "Dedos ágeis, movimentos fluidos e uma capacidade excepcional de desviar a atenção visual alheia. O Criminoso possui extrema facilidade e bônus passivos elevados em testes de Prestidigitação, Furtar Bolsos, Arrombar Fechaduras, Sabotar Armadilhas ou ocultar pequenos objetos (como adagas ou chaves) em seu próprio corpo sem levantar suspeitas.",
        bonus: [
          "Bônus elevados em Prestidigitação, Furtar Bolsos e Arrombar",
          "Facilidade para ocultar pequenos objetos no corpo"
        ]
      },
      {
        nome: "Fuga Planejada",
        descricao: "O bom criminoso nunca entra em um recinto sem antes mapear todas as saídas de emergência. Uma vez por sessão de jogo, quando se encontrar cercado fisicamente por inimigos ou guardas, o Criminoso pode ativar esta habilidade para realizar um movimento evasivo espetacular, evitando ser encurralado e reposicionando-se em um local seguro ou rota de fuga.",
        bonus: [
          "Uma vez por sessão: movimento evasivo e reposicionamento seguro"
        ]
      },
      {
        nome: "Contato Sombrio",
        descricao: "Uma vasta e complexa rede de conexões ilegais construída ao longo de sua carreira. O Criminoso possui acesso direto e facilitado ao submundo, permitindo-lhe obter informações confidenciais sobre alvos, adquirir itens contrabandeados ou venenos proibidos, encontrar rotas de fuga seguras e contratar serviços especializados de outros marginais.",
        bonus: [
          "Acesso facilitado a informações e itens contrabandeados",
          "Permite contratar serviços do submundo ou rotas de fuga"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0025"
  },
  {
    id: "professor",
    nome: "Professor",
    tipo: "A Crônica dos Varkhan",
    raridade: "raro",
    descricao: "O Professor representa o ápice do conhecimento acadêmico e da erudição formal. Tendo dedicado décadas de sua vida à pesquisa científica, ao ensino em grandes universidades e à catalogação de saberes esquecidos, ele possui uma mente analítica extraordinária. Embora possa não ter o vigor físico de um guerreiro, o Professor compensa essa fraqueza com uma capacidade incomparável de decifrar línguas antigas, compreender fenômenos físicos e misticismo complexo, e identificar os pontos fracos de qualquer criatura ou estrutura. No grupo, ele atua como o cérebro das operações, o decifrador de mistérios e o conselheiro estratégico.",
    imagem: "https://imgur.com/70AjdXi.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d4+2",
      vitalidade: "2d4+2",
      agilidade: "2d6+2",
      inteligencia: "2d12+6",
      percepcao: "2d6+6",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Enciclopédia Viva",
        descricao: "Uma mente que funciona como uma biblioteca perfeitamente catalogada. O Professor possui um vasto conhecimento sobre as mais diversas disciplinas. Ele pode realizar testes para se lembrar de fatos históricos, leis da física, folclore místico, fraquezas de monstros ou detalhes geográficos com grande facilidade e precisão, muitas vezes dispensando a necessidade de rolagens para informações comuns.",
        bonus: [
          "Bônus elevados em testes de conhecimento e memorização; reduz necessidade de rolagens"
        ]
      },
      {
        nome: "Didática",
        descricao: "A arte de transmitir conhecimentos complexos de forma simples e acionável. Ao explicar detalhadamente um plano tático, uma fraqueza de inimigo ou um método de ação para seus aliados, o Professor concede a eles facilidade ou bônus temporários em seus testes relacionados àquela explicação durante a cena seguinte.",
        bonus: [
          "Concede bônus temporários a aliados após explicação detalhada (próxima cena)"
        ]
      },
      {
        nome: "Pesquisa Avançada",
        descricao: "Métodos eficientes de triagem de dados e análise bibliográfica. Quando o Professor tem acesso a uma biblioteca física, arquivos históricos ou bancos de dados digitais, ele consegue reduzir drasticamente o tempo necessário para encontrar informações cruciais ou desvendar mistérios e criptografias complexas.",
        bonus: [
          "Redução de tempo para descobrir informações; bônus em investigações com recursos disponíveis"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0026"
  },
  {
    id: "sobrevivente",
    nome: "Sobrevivente",
    tipo: "A Crônica dos Varkhan",
    raridade: "raro",
    descricao: "O Sobrevivente é aquele que encarou os cenários mais hostis do mundo — desertos inclementes, florestas tropicais repletas de predadores, invernos polares ou o isolamento total após um desastre — e conseguiu retornar para contar a história. Ele é pragmático, durão e possui uma \"casca grossa\" moldada por privações severas. Não se importa com luxos, etiquetas sociais ou formalidades; seu único foco é a sobrevivência biológica e a manutenção da integridade da seu grupo. No grupo, ele é o especialista em acampamentos, navegação em terrenos selvagens, primeiros socorros e gerenciamento de recursos escassos.",
    imagem: "https://imgur.com/Lkakiqb.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d6+4",
      vitalidade: "2d8+4",
      agilidade: "2d6+2",
      inteligencia: "2d4+2",
      percepcao: "2d6+6",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Instinto de Sobrevivência",
        descricao: "Um \"sexto sentido\" afiado pelo perigo constante de predadores e armadilhas naturais. Uma vez por cena, o Sobrevivente pode antecipar um desastre iminente (como o acionamento de uma armadilha mecânica, um desmoronamento de rochas ou um ataque surpresa de uma criatura oculta), recebendo uma ação de reação imediata para se proteger ou alertar seus aliados.",
        bonus: [
          "Uma vez por cena: reação imediata para evitar desastre iminente"
        ]
      },
      {
        nome: "Casca Grossa",
        descricao: "Um corpo e uma mente temperados contra a dor e o desconforto físico. O Sobrevivente reduz significativamente todos os efeitos negativos causados por exaustão física, fome, sede, temperaturas extremas ou toxinas e venenos leves, mantendo-se totalmente funcional em cenários onde outros personagens sucumbiriam à fraqueza.",
        bonus: [
          "Redução de efeitos negativos por condições ambientais e exaustão"
        ]
      },
      {
        nome: "Improvisador",
        descricao: "A escassez é a mãe de todas as invenções. O Sobrevivente possui a habilidade de criar ferramentas improvisadas, curativos de emergência, armadilhas simples ou abrigos temporários utilizando apenas galhos, pedras, sucatas ou recursos limitados encontrados no ambiente ao seu redor, garantindo a utilidade do grupo mesmo sem equipamentos adequados.",
        bonus: [
          "Criação improvisada de ferramentas, curativos e abrigos com recursos limitados"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0027"
  },
  {
    id: "filho_do_heroi",
    nome: "Filho do Herói",
    tipo: "A Crônica dos Varkhan",
    raridade: "epico",
    descricao: "O Filho de Herói cresceu sob a sombra de feitos lendários e de expectativas sociais esmagadoras. Ele carrega em suas veias o sangue de um herói do passado e, em seus ombros, a pressão constante de provar que é digno desse legado. Essa herança traz tanto uma determinação de aço quanto um conflito interno constante. Eles são líderes natos, cujos nomes e linhagens podem abrir portas em castelos reais ou, inversamente, atrair a fúria de inimigos jurados de seus pais. No campo de batalha, o Filho de Herói luta com uma bravura contagiante, servindo como o escudo e a espada do grupo, inspirando todos ao seu redor a superarem seus próprios limites.",
    imagem: "https://imgur.com/gDWcTrb.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d8+4",
      vitalidade: "2d8+4",
      agilidade: "2d6+4",
      inteligencia: "2d6+2",
      percepcao: "2d6+4",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Marca do Legado",
        descricao: "O próprio destino parece conspirar para manter a linhagem do herói viva. Uma marca ancestral ativa-se nos momentos de maior necessidade, protegendo seu portador contra a morte iminente.",
        bonus: [
          "Três vezes por descanso longo (não acumuláveis): ao sofrer um ataque que o levaria à morte ou dano crítico devastador, uma força interior mística se ativa, recuperando instantaneamente uma quantidade significativa de pontos de vida e permitindo que o personagem continue lutando. Aplicação e valores exatos definidos pelo Mestre."
        ]
      },
      {
        nome: "Destemido",
        descricao: "A linhagem heroica confere uma mente blindada contra o terror. O personagem é parcialmente imune ou ignora penalidades leves e efeitos leves negativos causados por Medo, Pavor, Intimidação ou magias de controle mental que tentem quebrar sua determinação inabalável de combate.",
        bonus: [
          "Parcial imunidade/ignora penalidades leves de Medo, Pavor, Intimidação ou magias de controle mental"
        ]
      },
      {
        nome: "Hereditariedade Heroica",
        descricao: "O sangue dos grandes guerreiros e salvadores do mundo corre em suas veias, despertando em momentos de extrema necessidade. Uma vez por cena, o Filho de Herói recebe um bônus extra massivo em qualquer teste relacionado a atos de pura bravura, resistência moral contra a corrupção ou testes de liderança para inspirar seus companheiros.",
        bonus: [
          "Uma vez por cena: bônus extra massivo em testes de bravura, resistência moral ou liderança"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0028"
  },
  {
    id: "genio",
    nome: "Gênio",
    tipo: "A Crônica dos Varkhan",
    raridade: "epico",
    descricao: "O Gênio possui uma mente que opera em um nível cognitivo e de processamento de dados incompreensível para os mortais comuns. Desde a infância, ele desvenda equações matemáticas impossíveis, cria tecnologias revolucionárias ou decifra fórmulas mágicas ancestrais com a mesma facilidade com que uma criança brinca. Embora possam parecer arrogantes, excêntricos ou emocionalmente distantes devido à velocidade de seus pensamentos, sua capacidade de antecipar cenários e calcular variáveis em tempo real é uma vantagem tática insuperável. No grupo, o Gênio é o arquiteto dos planos mais complexos e o solucionador definitivo de qualquer barreira intelectual ou tecnológica.",
    imagem: "https://imgur.com/W64WhR2.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d4+2",
      vitalidade: "2d6+2",
      agilidade: "2d6+4",
      inteligencia: "2d12+6",
      percepcao: "2d8+4",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Aptidão Inata",
        descricao: "O Gênio possui uma compreensão tão profunda de certos domínios que sua aptidão beira o inato. Ao criar o personagem, o Gênio escolhe uma Aptidão que é elevada ao nível 6. Essa escolha deve ser justificada no background (BKs) e pode ser vetada pelo Mestre se não houver justificativa coerente.",
        bonus: [
          "Ao criar o personagem: escolha uma Aptidão que será elevada ao nível 6. Requer justificativa no background; sujeito à aprovação do Mestre."
        ]
      },
      {
        nome: "Eureka",
        descricao: "Em momentos de grande desafio ou frente a um problema aparentemente insolúvel, a mente do Gênio pode ter um lampejo de inspiração que desbloqueia soluções ocultas.",
        bonus: [
          "Uma vez por descanso curto: como reação quando o Gênio ou um aliado falha em um teste de Conhecimento, Percepção, Persuasão ou aptidão lógica, o Gênio pode ativar 'Eureka' para refazer o teste com Vantagem, ou optar por receber uma pista direta do Mestre sobre a situação."
        ]
      },
      {
        nome: "Mente Estratégica",
        descricao: "O campo de batalha e as interações sociais são vistos pelo Gênio como um tabuleiro de xadrez tridimensional. Uma vez por cena, ele pode analisar o cenário e coordenar as ações de seus aliados, permitindo-lhes reposicionar-se ou reorganizar seus recursos físicos e mágicos de forma taticamente ideal, otimizando a eficiência do grupo.",
        bonus: [
          "Uma vez por cena: analisar cenário e coordenar reposicionamento/táticas dos aliados"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0029"
  },
  {
    id: "herdeiro_de_cla",
    nome: "Herdeiro de Clã",
    tipo: "A Crônica dos Varkhan",
    raridade: "epico",
    descricao: "O Herdeiro de Clã pertence à alta nobreza, a dinastias mercantis de imensa riqueza ou a clãs de guerreiros tradicionais de prestígio histórico. Criado desde o berço sob a tutela dos melhores mentores, ele foi treinado nas artes da diplomacia, da etiqueta, da estratégia política e em técnicas refinadas de combate. Ele possui uma postura impecável e uma autoridade natural que exige respeito. O Herdeiro de Clã sabe como navegar pelas cortes reais, negociar tratados comerciais e usar o peso de seu nome familiar para obter vantagens que a força bruta jamais conseguiria. No grupo, ele é o diplomata refinado, o financiador de expedições e um combatente de técnica cirúrgica.",
    imagem: "https://imgur.com/MSJTiuz.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d6+4",
      vitalidade: "2d6+2",
      agilidade: "2d8+4",
      inteligencia: "2d6+6",
      percepcao: "2d6+4",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Prestígio",
        descricao: "O nome de sua família carrega séculos de história e poder político. O Herdeiro pode influenciar NPCs de alto escalão (nobres, reis, generais ou grandes mercadores) através de testes sociais, usando sua influência familiar para obter favores políticos, informações confidenciais ou livre trânsito em territórios controlados.",
        bonus: [
          "Influenciar NPCs de alto escalão; obter favores, informações ou livre trânsito"
        ]
      },
      {
        nome: "Recursos do Clã",
        descricao: "Uma linha de crédito e suporte logístico quase ilimitada com a riqueza de sua família. O Herdeiro pode solicitar equipamentos de alta qualidade, financiamento para projetos do grupo, transporte de luxo ou até mesmo o apoio temporário de guardas e especialistas leais ao seu clã durante a campanha.",
        bonus: [
          "Solicitar equipamentos, financiamento ou apoio temporário de guardas/especialistas"
        ]
      },
      {
        nome: "Treinamento Privilegiado",
        descricao: "A melhor educação marcial e acadêmica que o dinheiro e a tradição podem comprar. O Herdeiro recebe bônus constantes em técnicas de combate específicas (como esgrima ou arquearia fina) ou em um conjunto selecionado de habilidades sociais e acadêmicas ensinadas exclusivamente pelos tutores de sua dinastia.",
        bonus: [
          "Bônus em técnicas de combate selecionadas e habilidades sociais/acadêmicas específicas"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0030"
  },
  {
    id: "crianca_milagrosa",
    nome: "Criança Milagrosa",
    tipo: "A Crônica dos Varkhan",
    raridade: "lendario",
    descricao: "A Criança Milagrosa é um ser tocado diretamente pelas forças da criação, deuses ou pelo fluxo do próprio universo desde o seu nascimento. Ela exibe um talento místico e uma pureza espiritual tão avassaladores que desafiam qualquer lógica de idade ou experiência. Sua presença é magnética e inspiradora, servindo como um farol de esperança inabalável mesmo nas eras mais sombrias da história. Ela não precisa de anos de estudo acadêmico ou treinamento militar; o poder e o conhecimento fluem através dela de forma natural e intuitiva. No grupo, a Criança Milagrosa é a portadora de milagres, capaz de curar feridas impossíveis, dissipar trevas antigas e elevar a alma de seus aliados a patamares divinos.",
    imagem: "https://i.imgur.com/kmyh2vh.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d4+2",
      vitalidade: "2d6+6",
      agilidade: "2d6+2",
      inteligencia: "2d10+4",
      percepcao: "2d12+6",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Prodígio",
        descricao: "O talento místico e intelectual flui através dela sem qualquer esforço consciente. A Criança Milagrosa recebe um bônus contínuo, permanente e cumulativo em todos os seus testes de Inteligência (INT) ou no uso de suas habilidades especiais e místicas, refletindo sua conexão direta com a sabedoria cósmica.",
        bonus: [
          "Bônus contínuo, permanente e cumulativo em testes de INT e uso de habilidades místicas"
        ]
      },
      {
        nome: "Domínio de Fluxo",
        descricao: "Assim como o 'Infinito', a Criança Milagrosa tem um controle tão perfeito sobre a energia que ela nunca se esgota e sempre flui a seu favor. Ela é o centro de uma tempestade de poder.",
        bonus: [
          "Reduz em 50% qualquer custo de recurso (Mana, Energia, Stamina) aplicado às suas habilidades ou técnicas."
        ]
      },
      {
        nome: "Inspiração",
        descricao: "A pureza de sua alma e a magnitude de sua aura espiritual elevam o moral de todos ao seu redor. Todos os aliados próximos em sua presença recebem bônus temporários significativos em todos os seus testes e rolagens, sentindo-se revigorados, corajosos e protegidos ao lutarem ao lado da Criança Milagrosa.",
        bonus: [
          "Aliados próximos recebem bônus temporários significativos em testes e rolagens"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0031"
  },
  {
    id: "escolhido",
    nome: "Escolhido",
    tipo: "A Crônica dos Varkhan",
    raridade: "lendario",
    descricao: "O Escolhido é o protagonista das lendas e profecias antigas. Marcado pelas divindades, pelo destino ou pelas forças fundamentais do universo para cumprir um propósito monumental que alterará o curso da história humana. Ele carrega uma aura inconfundível de autoridade, destino e poder latente. Cada passo que dá parece ser sutilmente guiado por uma força maior, e o próprio tecido da realidade parece se curvar para garantir que ele cumpra sua missão profética. São líderes natos, guerreiros formidáveis e símbolos vivos de mudança, capazes de realizar feitos considerados impossíveis para qualquer outro ser mortal.",
    imagem: "https://imgur.com/wzZEXlA.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d8+4",
      vitalidade: "2d10+4",
      agilidade: "2d6+4",
      inteligencia: "2d6+4",
      percepcao: "2d8+4",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Ascensão Rápida",
        descricao: "O próprio universo acelera o desenvolvimento de suas capacidades para prepará-lo para seu destino. O Escolhido recebe bônus adicionais constantes e progressivos em qualquer teste relacionado aos seus atributos principais ou no uso de suas técnicas especiais (\"Arts\"), evoluindo a uma velocidade incomparavelmente maior que seus companheiros.",
        bonus: [
          "Bônus adicionais constantes e progressivos em testes de atributos principais e uso de Arts"
        ]
      },
      {
        nome: "Intuição Avançada",
        descricao: "Sussurros do próprio destino alertam sua mente momentos antes do perigo se materializar. Uma vez por cena, o Escolhido pode prever com precisão absoluta a próxima ação, ataque ou movimento de um inimigo, permitindo que ele ou um aliado se esquivem perfeitamente ou realizem um contra-ataque devastador com vantagem total.",
        bonus: [
          "Uma vez por cena: prever ação/ataque do inimigo, permitindo esquiva ou contra-ataque com vantagem"
        ]
      },
      {
        nome: "Aura de Autoridade",
        descricao: "Uma presença magnética e imponente que emana de seu próprio ser, exigindo respeito e lealdade de aliados e temor de inimigos. Aliados sob sua liderança direta recebem bônus significativos em testes de combate, resistência mental e testes de liderança, lutando com um fervor e coragem redobrados sob a bandeira do Escolhido.",
        bonus: [
          "Aliados sob sua liderança recebem bônus significativos em combate, resistência mental e testes sociais"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0032"
  },
  {
    id: "humano_perfeito",
    nome: "Humano Perfeito",
    tipo: "A Crônica dos Varkhan",
    raridade: "lendario",
    descricao: "O Humano Perfeito representa o ápice absoluto da evolução física, mental e espiritual de sua espécie. Ele é a harmonia perfeita encarnada: livre de qualquer falha genética, fraqueza moral ou limitação corporal. Exibe uma simetria física deslumbrante, uma capacidade cognitiva incomparável e atributos físicos que beiram o divino. Ele não é apenas bom em uma área; ele é perfeito em todas. Age com uma calma imperturbável e uma precisão cirúrgica em qualquer situação, seja decifrando uma fórmula científica complexa, negociando a paz entre impérios ou derrotando exércitos inteiros em combate corpo a corpo.",
    imagem: "https://imgur.com/k0mPVED.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d8+4",
      vitalidade: "2d8+4",
      agilidade: "2d8+4",
      inteligencia: "2d8+4",
      percepcao: "2d8+4",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Potencial Máximo",
        descricao: "Seus limites biológicos estão situados muito além do que a ciência ou a magia consideram possíveis para os mortais comuns. Uma vez por cena, o Humano Perfeito pode entrar em um estado de Transcendência por até 5 rodadas.",
        bonus: [
          "Durante Transcendência (até 5 rodadas): +10 em todos os atributos, ganha uma ação adicional por turno e ignora penalidades de movimento ou ferimentos. Uso: 1 vez por cena."
        ]
      },
      {
        nome: "Resiliência Absoluta",
        descricao: "Um corpo e uma mente perfeitamente temperados, capazes de absorver impactos que destruiriam estruturas de aço. Uma vez por cena, ao sofrer um ataque crítico ou uma quantidade de dano que seria fatal para outros personagens, o Humano Perfeito pode mitigar o impacto, reduzindo drasticamente a severidade do ferimento e anulando quaisquer efeitos colaterais negativos.",
        bonus: [
          "Uma vez por cena: mitigar dano crítico/fatal e anular efeitos colaterais"
        ]
      },
      {
        nome: "Percepção Superior",
        descricao: "Seus sentidos operam em frequências perfeitas, processando microdetalhes do ambiente em tempo real. Uma vez por sessão de jogo, o Humano Perfeito pode detectar automaticamente qualquer armadilha oculta, emboscada inimiga, mentira social ou presença invisível em sua vizinhança imediata, anulando completamente qualquer chance de o grupo ser pego de surpresa.",
        bonus: [
          "Uma vez por sessão: detectar armadilhas, emboscadas, mentiras ou presenças invisíveis"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0033"
  },
  {
    id: "reencarnado",
    nome: "Reencarnado",
    tipo: "A Crônica dos Varkhan",
    raridade: "mitico",
    descricao: "O Reencarnado é uma alma antiga que retém as memórias, conhecimentos e experiências de suas vidas passadas, tendo despertado neste novo corpo e era. Ele carrega a sabedoria acumulada de séculos, técnicas de combate esquecidas pelo tempo e uma perspectiva profundamente filosófica sobre a vida, a morte e o fluxo da história. Costumam ser indivíduos calmos, enigmáticos e por vezes melancólicos, pois já viram impérios erguerem-se e caírem em pó múltiplas vezes. No entanto, sua experiência prática acumulada em dezenas de existências anteriores faz dele um aliado de valor inestimável, capaz de trazer soluções do passado para os problemas do presente.",
    imagem: "https://i.imgur.com/ADVh9kV.png",
    limiteAtributo: 150,
    atributos: {
      forca: "2d6+2",
      vitalidade: "2d6+2",
      agilidade: "2d6+6",
      inteligencia: "2d10+4",
      percepcao: "2d6+6",
      sorte: "5d10+20"
    },
    habilidadesBasicas: [
      {
        nome: "Memória de Vidas Anteriores",
        descricao: "O conhecimento acumulado de eras passadas está codificado em sua alma e pode ser acessado à vontade. O Reencarnado pode escolher e utilizar Aptidões, perícias ou conhecimentos específicos que dominou em suas existências anteriores (ou campanhas passadas), mesmo que seu corpo físico atual ainda não as tenha treinado formalmente.",
        bonus: [
          "Pode escolher e utilizar Aptidões/perícias dominadas em vidas anteriores"
        ]
      },
      {
        nome: "Experiência Suprema",
        descricao: "A prática perfeita leva à perfeição eterna. Sempre que o Reencarnado realizar um teste de habilidade ou perícia que ele já dominou em alguma de suas vidas passadas, ele recebe bônus substanciais constantes em sua rolagem, executando a ação com uma maestria e fluidez quase mecânicas.",
        bonus: [
          "Bônus constantes em testes já dominados em vidas anteriores"
        ]
      },
      {
        nome: "Renascimento",
        descricao: "A morte não é o fim, mas apenas uma transição de cenário para uma alma imortal. Uma vez por campanha, caso o Reencarnado sofra uma morte definitiva no campo de batalha, sua alma se recusa a partir para o além ou reencarna de forma milagrosa e acelerada, retornando à vida com metade de seus recursos físicos e de energia restaurados, pronto para continuar sua jornada eterna.",
        bonus: [
          "Uma vez por campanha: reanimação/reencarnação com metade dos recursos físicos e energéticos"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "0034"
  }
  ,
  {
    id: "synoma",
    nome: "Synoma",
    tipo: "The Chaotical Gate",
    raridade: "comum",
    descricao: "É a manifestação mais comum e estável do Gene Anômalo, representando a evolução direta das capacidades naturais do corpo humano. Diferente de outras categorias que criam matéria, manipulam energia ou alteram fenômenos externos, o Synoma atua exclusivamente sobre o próprio organismo, despertando potenciais biológicos adormecidos e levando-os muito além dos limites humanos. Seus usuários desenvolvem corpos capazes de suportar pressões extremas, adaptar-se a ambientes hostis e executar feitos que desafiam a compreensão da ciência moderna. Essa evolução pode ocorrer de diversas formas: através do fortalecimento muscular, permitindo força e resistência sobre-humanas; da amplificação sensorial, elevando os sentidos a níveis extraordinários; da adaptação fisiológica, tornando possível sobreviver em condições letais; ou ainda por especializações biológicas únicas, como regeneração acelerada, produção de toxinas e camuflagem orgânica. Em seus níveis mais elevados, um usuário de Synoma transcende completamente as limitações da espécie humana, adquirindo capacidades capazes de rivalizar com armas de destruição em massa, sobreviver em ambientes impossíveis e remodelar o próprio corpo para enfrentar qualquer ameaça, tornando-se a expressão máxima da adaptação e da sobrevivência.",
    limiteAtributo: 150,
    imagem: "https://i.imgur.com/HJ2ArGy.jpeg",
    atributos: {
      forca: "2d10+4",
      vitalidade: "2d8+8",
      agilidade: "2d8+4",
      inteligencia: "2d6+2",
      percepcao: "2d10+4",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Organismo Superior",
        descricao: "O corpo de um Synoma opera em um nível biológico muito acima do padrão humano. Seus músculos apresentam eficiência elevada, seus órgãos trabalham de forma otimizado e seu metabolismo é capaz de suportar esforços que normalmente levariam um ser humano comum ao colapso físico.",
        bonus: [
          "Recebe +25% HP extra",
          "Maior resistência narrativa contra fadiga, exaustão física e esforços prolongados"
        ]
      },
      {
        nome: "Adaptação Emergencial",
        descricao: "O Gene Anômalo presente nos Synoma reage constantemente a ameaças que colocam sua sobrevivência em risco. Quando submetido a ambientes extremos ou condições hostis, o organismo inicia um processo acelerado de adaptação biológica, buscando reduzir os danos causados pelo estímulo agressor.",
        bonus: [
          "Após sobreviver a uma ameaça ambiental/condição extrema, o Mestre pode conceder resistência parcial ou vantagem narrativa contra exposições semelhantes durante a cena ou campanha",
          "Reduz danos e efeitos repetidos da mesma ameaça (não é perfeito nem instantâneo)"
        ]
      },
      {
        nome: "Instinto Primordial",
        descricao: "Microcontrações musculares, alterações hormonais e impulsos nervosos percorrem seu organismo diante de ameaças iminentes, criando uma sensação instintiva de alerta impossível de explicar logicamente.",
        bonus: [
          "Recebe +3 Reação",
          "Permite perceber perigos iminentes, emboscadas ou situações anormais mesmo sem informação consciente suficiente"
        ]
      },
      {
        nome: "Regeneração Biológica",
        descricao: "As células de um Synoma possuem capacidade regenerativa superior à humana. Tecidos danificados são reconstruídos com maior velocidade e eficiência, reduzindo significativamente o tempo necessário para recuperação.",
        bonus: [
          "Recupera-se mais rapidamente de ferimentos leves, fraturas simples e danos físicos não críticos",
          "Redução nos tempos de recuperação de lesões comuns (a critério do Mestre)"
        ]
      },
      {
        nome: "Vontade de Sobrevivência",
        descricao: "Quando colocado diante da morte, seu organismo mobiliza recursos ocultos, redistribui energia e força o corpo a continuar funcionando mesmo além dos limites considerados seguros.",
        bonus: [
          "Uma vez por cena, ao sofrer dano ou condição que normalmente o deixaria incapaz, pode permanecer consciente por mais um turno/ação",
          "Efeito pode gerar penalidades narrativas ou exaustão após uso"
        ]
      },
      {
        nome: "Evolução Contínua",
        descricao: "O corpo está em constante processo de aperfeiçoamento, observando estímulos, armazenando informações biológicas e refinando suas próprias capacidades para enfrentar desafios futuros. Cada batalha e ambiente hostil deixam marcas evolutivas no organismo.",
        bonus: [
          "O Mestre pode recompensar experiências extremas com adaptações biológicas menores, mutações benéficas ou evoluções narrativas compatíveis com a especialização do personagem",
          "Melhora progressiva do personagem com exposição a desafios reais"
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "9001"
  } 
  ,
  {
    id: "Stoika",
    nome: "Stoika",
    tipo: "The Chaotical Gate",
    raridade: "epico",
    descricao: "Stoika é uma das manifestações mais versáteis e perigosas do Gene Anômalo, permitindo ao usuário interagir diretamente com a matéria presente no ambiente. Diferente de categorias focadas no aprimoramento corporal ou na manipulação de energia, o Stoika estabelece uma conexão genética entre o indivíduo e determinados materiais, possibilitando moldá-los, movimentá-los, alterar sua forma e explorar suas propriedades físicas de maneiras impossíveis para a ciência convencional. Essa capacidade surge através de uma mutação instável do Gene Anômalo, que sacrifica parte do potencial biológico do portador em troca de um domínio excepcional sobre elementos externos. Cada usuário desenvolve afinidade com um ou mais tipos de matéria, tornando-se capaz de transformar ambientes inteiros em extensões de sua própria vontade. Em níveis avançados, um Stoika pode remodelar campos de batalha, erguer fortalezas instantaneamente, criar armamentos complexos ou alterar estruturas inteiras em questão de segundos. Embora extremamente poderoso, o Stoika possui uma regra fundamental: não cria matéria do nada. Todo material manipulado deve existir previamente no ambiente ou ter sido assimilado pelo usuário através de métodos específicos.",
    limiteAtributo: 150,
    imagem: "https://i.imgur.com/s7Lok9I.png",
    atributos: {
      forca: "2d6+2",
      vitalidade: "2d8+2",
      agilidade: "2d6+4",
      inteligencia: "2d8+8",
      percepcao: "2d10+8",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Afinidade Material",
        descricao: "Desde o despertar do Gene Anômalo, o organismo do usuário desenvolve uma conexão instintiva com um tipo específico de matéria. Essa afinidade vai além do simples conhecimento físico; o usuário passa a sentir a presença, densidade, composição e estado do material como se fosse uma extensão de seus próprios sentidos. Mesmo sem treinamento avançado, muitos Stoika conseguem identificar impurezas, rachaduras ou alterações estruturais em materiais compatíveis apenas através do contato ou proximidade.",
        bonus: [
          "Recebe percepção ampliada sobre sua matéria de afinidade (Nv3 Grátis).",
          "Pode identificar propriedades, defeitos e alterações estruturais sem necessidade de equipamentos especializados."
        ]
      } ,
      {
        nome: "Interface Anômala",
        descricao: "O Gene Anômalo cria uma ligação direta entre o sistema nervoso e a matéria compatível. Conforme essa conexão se fortalece, manipular materiais deixa de ser uma ação consciente e passa a ocorrer de forma quase intuitiva. Objetos compatíveis respondem com maior facilidade aos comandos do usuário, reduzindo o esforço necessário para moldagem, movimentação e controle.",
        bonus: [
          "Ações envolvendo a matéria de afinidade possuem menor dificuldade e exigem menor desgaste físico ou mental.",
        ]
      },
      {
        nome: "Consciência Estrutural",
        descricao: "O Stoika aprende a perceber tensões, compressões e falhas estruturais através da própria matéria. Ao tocar uma parede, uma arma ou uma estrutura compatível, o usuário consegue compreender intuitivamente sua resistência, estabilidade e pontos vulneráveis. Veteranos da categoria são capazes de ler construções inteiras apenas através de pequenos fragmentos de material.",
        bonus: [
          "Recebe vantagem rolagem ao analisar construções, armaduras, armas e estruturas feitas de sua matéria de afinidade.",
        ]
      },
      {
        nome: "Assimilação Material",
        descricao: "A exposição constante à matéria compatível provoca alterações graduais no organismo. Embora não transforme diretamente o corpo do usuário, essa convivência cria resistência natural aos efeitos nocivos produzidos por sua própria matéria. Um manipulador de metal aprende a suportar peso e vibrações extremas. Um manipulador de cristal torna-se mais resistente a cortes e fragmentações. Um manipulador mineral desenvolve maior tolerância à pressão e impacto.",
        bonus: [
          "Recebe bônus moderado a efeitos relacionados à sua matéria de afinidade.",
        ]
      },
      {
        nome: "Domínio Territorial",
        descricao: "O verdadeiro poder de um Stoika nunca está apenas nele. Está no ambiente. Quanto maior a quantidade de matéria compatível presente ao redor, mais confortável e eficiente sua manipulação se torna. Campos ricos em sua afinidade tornam-se extensões naturais de sua influência.",
        bonus: [
          "O Mestre pode conceder bônus narrativos ou vantagens situacionais sempre que houver grande abundância da matéria compatível no cenário.",
        ]
      },
      {
        nome: "Reino da Matéria",
        descricao: "Com o passar do tempo, a relação entre usuário e matéria se torna tão profunda que o ambiente passa a reagir naturalmente à sua presença. Não é controle consciente. É familiaridade. É como se a matéria reconhecesse seu manipulador.",
        bonus: [
          "Quando estiver cercado por grande quantidade de sua matéria de afinidade, o usuário recebe vantagens narrativas em manipulação, percepção e controle territorial.",
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "9002"
  }
  ,
  {
    id: "Yaima",
    nome: "Yaima",
    tipo: "The Chaotical Gate",
    raridade: "epico",
    descricao: "O Yaima é uma manifestação singular do Gene Anômalo que permite ao usuário integrar materiais diretamente à própria estrutura biológica. Diferente do Stoika, que manipula a matéria ao seu redor, o Yaima converte o próprio corpo em uma extensão do material assimilado, fundindo carne, ossos e órgãos com substâncias que desafiam as limitações naturais da biologia humana. Essa transformação ocorre através de uma mutação genética altamente adaptativa, capaz de reestruturar células, tecidos e até mesmo o sistema esquelético para reproduzir as propriedades físicas de determinados materiais. Dependendo da afinidade desenvolvida, um usuário pode endurecer a pele como aço, cristalizar membros inteiros, transformar músculos em fibras minerais ou incorporar características orgânicas complexas de outras formas de vida.",    limiteAtributo: 150,
    imagem: "https://i.imgur.com/a6HvVbo.jpeg",
    atributos: {
      forca: "2d10+4",
      vitalidade: "2d8+8",
      agilidade: "2d8+2",
      inteligencia: "2d6+2",
      percepcao: "2d6+4",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Matéria Viva",
        descricao: "O corpo de um Yaima não imita materiais. Ele os incorpora. Quando submetido a danos, pressão ou ambientes hostis, o organismo utiliza as propriedades da matéria assimilada para aumentar suas chances de sobrevivência. Cada transformação fortalece a ligação entre corpo e material, tornando a adaptação cada vez mais natural.",
        bonus: [
          "Sempre que utilizar um material como base de suas transformações, recebe vantagens narrativas relacionadas às propriedades naturais desse material.",
          "Benefícios aplicados como resistência temporária, bônus em testes ou vantagens ambientais, a critério do Mestre."
        ]
      },
      {
        nome: "Estrutura Estável",
        descricao: "Mesmo quando partes do corpo sofrem alterações materiais, a biologia do Yaima mantém suas funções corporais estáveis e eficientes.",
        bonus: [
          "Recebe resistência moderada contra fraturas, deslocamentos e lesões estruturais (Nv.3 Tolerância).",
          "Redução do risco de perda de membros ou incapacitação por dano estrutural; recuperação mais rápida a critério do Mestre."
        ]
      },
      {
        nome: "Estrutura Híbrida",
        descricao: "A fusão constante entre matéria e organismo fortalece naturalmente a estrutura corporal do usuário. Ossos, músculos e tecidos tornam-se progressivamente mais densos e resistentes conforme a evolução do Gene Anômalo. Mesmo em estado parcialmente humano, um Yaima apresenta uma durabilidade física muito superior à média.",
        bonus: [
          "Jogador recebe 1 HP por Vitalidade e Fortitude.",
          "Jogador ganha uma defesa passiva adicional contra ataques físicos, representando a resistência natural de sua estrutura híbrida."
        ]
      } ,
      {
        nome: "Adaptação Morfológica",
        descricao: "O corpo de um Yaima está em constante transformação. Sempre que exposto por longos períodos a um material compatível, o organismo começa a desenvolver pequenas adaptações espontâneas relacionadas às propriedades da matéria assimilada. Essas alterações normalmente surgem de forma sutil antes de evoluírem para transformações completas.",
        bonus: [
          "O Mestre pode conceder adaptações biológicas menores relacionadas ao material predominante utilizado pelo personagem.",
        ]
      },
      {
        nome: "Resistência Estrutural",
        descricao: "Mesmo quando ferido, o organismo híbrido do Yaima apresenta uma estabilidade incomum. Partes do corpo convertidas em materiais especializados mantêm sua integridade por mais tempo, dificultando fraturas, rompimentos e danos estruturais severos. A própria composição híbrida do corpo distribui impactos de maneira mais eficiente.",
        bonus: [
          "Recebe resistência moderada contra ferimentos físicos, esmagamento e danos estruturais (Nv.3 Tolerancia).",
        ]
      },
      {
        nome: "Memória Celular Material",
        descricao: "Após assimilar um material, o organismo registra parte de sua composição em nível celular. Com o passar do tempo, reproduzir características já utilizadas anteriormente torna-se mais natural e menos desgastante para o corpo. Veteranos da categoria conseguem alternar entre diferentes estados de transformação com muito mais facilidade do que usuários iniciantes.",
        bonus: [
          "Transformações e integrações previamente dominadas exigem menor esforço para serem reproduzidas novamente.",
        ]
      },
    ],
    habilidadesAvancadas: [],
    codigo: "9003"
  }  
  ,
  {
    id: "psicoplasmica",
    nome: "Psicoplásmica",
    tipo: "The Chaotical Gate",
    raridade: "lendario",
    descricao: "A Psicoplásmica é uma manifestação instável do Gene Anômalo que permite ao usuário remodelar a própria estrutura biológica através da vontade, emoção e instinto. Diferente do Synoma, que aprimora capacidades já existentes, a Psicoplásmica altera completamente a forma física do indivíduo, permitindo que seu corpo assuma características impossíveis para um ser humano comum. Essa transformação ocorre por meio de uma mutação altamente adaptativa que reescreve músculos, ossos, órgãos e tecidos em tempo real. Usuários dessa categoria frequentemente desenvolvem traços bestiais, monstruosos ou híbridos, refletindo heranças genéticas ligadas aos antigos Anaplásmata ou a linhagens anômalas esquecidas. Em seus estágios iniciais, a transformação costuma ser parcial, manifestando garras, presas, olhos especializados ou membros alterados. Conforme evolui, o usuário torna-se capaz de assumir formas completas, criar estruturas corporais inéditas e adaptar seu organismo para sobreviver aos mais variados ambientes e situações de combate. Nos níveis mais elevados, a Psicoplásmica permite uma evolução contínua, onde cada batalha, ferimento ou desafio acelera a adaptação do corpo, transformando o usuário em uma criatura viva de constante aperfeiçoamento.",
    limiteAtributo: 150,
    imagem: "https://i.imgur.com/04UWpuI.jpeg",
    atributos: {
      forca: "2d10+8",
      vitalidade: "2d8+4",
      agilidade: "2d12+8",
      inteligencia: "2d6+4",
      percepcao: "2d8+4",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Corpo Mutável",
        descricao: "O organismo Psicoplásmico nunca é completamente estático. Pequenas alterações corporais ocorrem naturalmente conforme emoções, estresse ou instintos entram em ação. Olhos podem mudar de formato, unhas podem endurecer e músculos podem se adaptar temporariamente a situações extremas.",
        bonus: [
          "Vantagem narrativa em testes envolvendo adaptação física, escalada, perseguição, sobrevivência ou situações onde o corpo precise improvisar uma solução biológica."
        ]
      },
      {
        nome: "Instinto Bestial",
        descricao: "Mesmo em forma humana, parte dos instintos primitivos permanece ativa. O usuário percebe ameaças, movimentos e intenções hostis com maior facilidade.",
        bonus: [
          "+3 ReA",
          "+1 PreC"
        ]
      },
      {
        nome: "Evolução Reativa",
        descricao: "O corpo aprende através da experiência. Cada combate deixa pequenas marcas evolutivas que tornam o organismo mais eficiente para enfrentar desafios semelhantes.",
        bonus: [
          "Uma vez por cena, após sofrer uma condição negativa pela primeira vez, o usuário recebe uma pequena resistência narrativa contra aquele mesmo efeito."
        ]
      },
      {
        nome: "Flexibilidade Biológica",
        descricao: "Músculos, articulações e tecidos possuem elasticidade muito superior à humana.",
        bonus: [
          "+15 Agilidade",
          "+10% Prontidão"
        ]
      },
      {
        nome: "Instinto Predatório",
        descricao: "Em situações extremas, emoções intensas podem influenciar o comportamento do usuário.",
        bonus: [
          "O Mestre pode solicitar testes de autocontrole em momentos de fúria, medo extremo ou instinto de sobrevivência.",
          "Se, em fúria, o personagem ainda mantiver sanidade, recebe +3 em Precisão e +7 em dano."
        ]
      }
    ,
      {
        nome: "Transmutação Emocional",
        descricao: "As emoções intensas moldam temporariamente a física do Psicoplásmico, permitindo que o corpo adote uma resposta adaptativa imediata e poderosa.",
        bonus: [
          "Uma vez por cena, quando experimentar uma emoção intensa (raiva, medo, desespero, êxtase), escolha uma resposta imediata: +3 Precisão por 1 turno; OU +10 AGI por 1 turno; OU resistência leve a dano físico por 1 turno.",
          "Se usada repetidamente sem recuperação, o Mestre pode impor efeitos colaterais narrativos ou penalidades temporárias para refletir instabilidade fisiológica."
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "9004"
  }
  ,
  {
    id: "anaplasmata",
    nome: "Anaplásmata",
    tipo: "The Chaotical Gate",
    raridade: "raro",
    descricao: "O Anaplásmata é uma manifestação única do Gene Anômalo baseada na criação de um vínculo psíquico e biológico entre um humano e uma criatura compatível. Diferente das demais categorias, seu verdadeiro potencial não reside apenas no usuário, mas na conexão estabelecida entre ambos. Quando o vínculo é formado, humano e criatura passam a compartilhar instintos, emoções, experiências e parte do próprio desenvolvimento evolutivo. O crescimento de um influencia diretamente o outro, permitindo que ambos se fortaleçam juntos ao longo do tempo. As criaturas associadas podem assumir inúmeras formas, variando entre bestas comuns alteradas pelo Gene Anômalo até organismos completamente desconhecidos pela ciência moderna. Quanto mais forte a conexão, maior a capacidade de comunicação, coordenação e evolução compartilhada. Nos estágios avançados, usuário e criatura tornam-se praticamente uma única entidade em dois corpos distintos, capazes de agir como uma consciência sincronizada e desenvolver habilidades exclusivas resultantes dessa união.",
    limiteAtributo: 150,
    imagem: "https://i.imgur.com/pniymVA.png",
    atributos: {
      forca: "2d8+4",
      vitalidade: "2d6+4",
      agilidade: "2d6+4",
      inteligencia: "2d10+8",
      percepcao: "2d12+8",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Elo Simbiótico",
        descricao: "O vínculo entre mestre e companheiro transcende comunicação convencional. Ambos compartilham emoções, intenções e sensações básicas mesmo sem palavras.",
        bonus: [
          "Usuário e criatura sempre sabem a localização aproximada um do outro.",
          "Facilita coordenação em combate e retirada tática."
        ]
      },
      {
        nome: "Sentidos Compartilhados",
        descricao: "A conexão permite que pequenas percepções sejam transmitidas através do vínculo, avisando sobre perigos ou oportunidades.",
        bonus: [
          "Uma vez por cena, mestre ou criatura podem alertar imediatamente o outro sobre um perigo percebido.",
          "Reduz chance de ser surpreendido quando o parceiro está atento."
        ]
      },
      {
        nome: "Crescimento Compartilhado",
        descricao: "A evolução de um fortalece o outro. Treinamentos, adaptações e melhorias têm efeitos reciprócos entre mestre e criatura.",
        bonus: [
          "Quando um dos dois recebe uma evolução, treinamento ou melhoria significativa, o outro recebe um pequeno benefício narrativo relacionado.",
          "Benefícios aplicados conforme decisão do Mestre para manter equilíbrio." 
        ]
      },
      {
        nome: "Proteção Instintiva",
        descricao: "O vínculo desperta um forte instinto de proteção mútua, levando a ações rápidas e arriscadas para salvar o parceiro.",
        bonus: [
          "Quando um estiver em perigo crítico, o outro pode agir mesmo em situações onde normalmente hesitaria ou recuaria.",
          "Gera opções narrativas para intervenções heroicas ou salvamentos arriscados." 
        ]
      }
      ,
      {
        nome: "Síncope Empática",
        descricao: "A ligação é tão profunda que parte da dor ou estresse do companheiro pode ser assumida pelo usuário, equilibrando o custo da proteção.",
        bonus: [
          "Uma vez por cena, o usuário pode absorver parcialmente um efeito negativo sofrido pela criatura ligada (reduzindo dano ou intensidade do efeito pela metade).",
          "Uso repetido pode gerar desgaste narrativo no usuário; a aplicação e limites ficam a critério do Mestre."
        ]
      },
      {
        nome: "Coordenação Instintiva",
        descricao: "Instintos compartilhados permitem movimentos e ataques coordenados quase telepaticamente entre mestre e criatura.",
        bonus: [
          "Quando realizam uma ação conjunta (ataque combinado, defesa mútua ou manobra tática), ambos recebem +2 em Precisão ou +1 dado de bônus, por 1 turno.",
          "A ação conjunta deve ser comunicada em narrativa pelo jogador; o Mestre decide aplicabilidade em situações ambíguas."
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "9005"
  }
  ,
  {
    id: "akonis",
    nome: "Akónis",
    tipo: "The Chaotical Gate",
    raridade: "mitico",
    descricao: "O Akónis representa uma das maiores anomalias já registradas entre os portadores do Gene Anômalo. Enquanto a maioria dos indivíduos desperta apenas uma manifestação principal, os Akónis possuem a rara capacidade de desenvolver múltiplas Unic Skills simultaneamente. Essa condição surge devido a uma compatibilidade genética extraordinária que permite ao organismo sustentar diferentes manifestações sem colapso imediato. Como resultado, um Akónis pode combinar habilidades normalmente incompatíveis, criando estilos de combate e capacidades impossíveis de serem reproduzidos por outros usuários. Entretanto, esse poder possui um preço. A presença de múltiplas manifestações gera uma enorme instabilidade genética, exigindo constante adaptação do organismo para evitar rejeições internas, mutações descontroladas ou colapsos biológicos. Apesar dos riscos, os Akónis são considerados indivíduos de potencial quase ilimitado. Em seus níveis mais elevados, podem fundir diferentes manifestações em habilidades inéditas, criando poderes que desafiam todas as classificações conhecidas.",
    limiteAtributo: 150,
    imagem: "https://i.imgur.com/z9nF43J.png",
    atributos: {
      forca: "2d8+8",
      vitalidade: "2d10+4",
      agilidade: "2d10+4",
      inteligencia: "2d10+4",
      percepcao: "2d10+4",
      sorte: "5d20"
    },
    habilidadesBasicas: [
      {
        nome: "Genoma Compatível",
        descricao: "O organismo Akónis possui uma estabilidade genética anormalmente elevada, permitindo coexistência entre diferentes manifestações.",
        bonus: [
          "Pode possuir mais de uma Unic Skill sem sofrer rejeição imediata.",
          "Reduz chance de falhas de compatibilidade quando combina habilidades distintas."
        ]
      },
      {
        nome: "Desenvolvimento Acelerado",
        descricao: "A presença de múltiplas manifestações estimula o Gene Anômalo constantemente, promovendo adaptação e aprendizado mais rápidos.",
        bonus: [
          "Aprende novas técnicas e aplicações de suas habilidades com maior facilidade.",
          "O Mestre pode conceder progressão narrativa ou pequena redução de custo para aprendizado de novas Unic Skills."
        ]
      },
      {
        nome: "Sinergia Anômala",
        descricao: "As diferentes manifestações presentes no organismo tendem a interagir naturalmente, gerando combinações inesperadas e úteis.",
        bonus: [
          "Recebe vantagem narrativa ao combinar duas ou mais habilidades de formas criativas.",
          "Combinações podem gerar efeitos bônus aprovados pelo Mestre."
        ]
      },
      {
        nome: "Adaptação Genética",
        descricao: "O corpo aprende a administrar conflitos entre manifestações distintas, minimizando efeitos colaterais e rejeições internas.",
        bonus: [
          "Resistência moderada contra efeitos de sobrecarga causados pelas próprias habilidades.",
          "Menor penalidade ao usar múltiplas habilidades simultâneas."
        ]
      }
      ,
      {
        nome: "Catalisador Genético",
        descricao: "Uma vez por combate, o Akónis ativa um catalisador anômalo que potencializa adaptações imediatas. Ao ativar, escolha um dos efeitos: 1) ganhar +1d em uma rolagem de atributo durante a cena; 2) reduzir o custo narrativo de uma Unic Skill em 1; 3) recuperar 1d6 PV. O efeito dura até o fim da cena. Uso: 1 vez por combate.",
        bonus: [
          "Escolha um efeito ao ativar: +1d6 em uma rolagem de atributo como bonus; reduzir custo narrativo de uma Unic Skill em 50%; ou recuperar 4d8+12 PV.",
          "Dura até o fim da cena. Uso: 1 vez por combate. Abuso pode causar instabilidade narrativo-mecânica, a critério do Mestre."
        ]
      },
      {
        nome: "Fusão Controlada",
        descricao: "O corpo do Akónis aprende a combinar partes de duas manifestações em um efeito unificado e controlado, explorando sinergias sem causar rejeições imediatas.",
        bonus: [
          "Pode combinar duas habilidades menores em uma ação única com efeito sinérgico (a critério do Mestre).",
          "A fusão causa custo narrativo ou penalidade leve pós-uso para equilibrar o poder; aplicabilidade decidida pelo Mestre."
        ]
      }
    ],
    habilidadesAvancadas: [],
    codigo: "9006"
  }
]

/**
 * Obtém uma raça pelo ID
 * @param {string} id - ID da raça
 * @returns {Object|null} Objeto raça ou null
 */
function obterRacaPorId(id) {
  return RACAS_DATABASE.find(raca => raca.id === id) || null;
}

/**
 * Obtém todas as raças
 * @returns {Array} Array de todas as raças
 */
function obterTodasAsRacas() {
  return RACAS_DATABASE;
}

/**
 * Obtém raças por raridade
 * @param {string} raridade - Raridade (comum, raro, epico, mitico, lendario, celestial)
 * @returns {Array} Raças da raridade especificada
 */
function obterRacasPorRaridade(raridade) {
  return RACAS_DATABASE.filter(raca => raca.raridade === raridade);
}

/**
 * Obtém habilidades básicas de uma raça
 * @param {string} id - ID da raça
 * @returns {Array} Array de habilidades básicas
 */
function obterHabilidadesBasicas(id) {
  const raca = obterRacaPorId(id);
  return raca ? (raca.habilidadesBasicas || []) : [];
}

/**
 * Obtém habilidades avançadas de uma raça
 * @param {string} id - ID da raça
 * @returns {Array} Array de habilidades avançadas
 */
function obterHabilidadesAvancadas(id) {
  const raca = obterRacaPorId(id);
  return raca ? (raca.habilidadesAvancadas || []) : [];
}
