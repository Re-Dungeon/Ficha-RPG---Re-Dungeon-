/* ============================================ */
/* VANTAGENS-APTIDOES-SYSTEM.JS                 */
/* Sistema de Tipos e Aplicação de Vantagens   */
/* ============================================ */

/**
 * VantagensAptidoesSystem
 * Gerencia todos os tipos de vantagens (bonus, bonus-percentual, bonus-opcional, efeito)
 * Responsável por:
 * - Aplicar bônus corretos por nível
 * - Gerenciar estado de bônus opcionais
 * - Renderizar efeitos narrativos
 * - Validar aplicação de bônus
 */

const VantagensAptidoesSystem = (() => {
  /**
   * Definição de vantagens por aptidão
   * Cada nível contém um objeto com:
   * - tipo: "bonus" | "bonus-percentual" | "bonus-opcional" | "efeito"
   * - valor: string do bônus principal
   * - valorOpcional?: string do bônus alternativo (apenas para bonus-opcional)
   * 
   * Regra de níveis:
   * - Níveis ímpares (1, 3, 5) = EFEITOS
   * - Níveis pares (2, 4, 6) = BÔNUS
   */
  // Sincronizado com o catálogo de `aptidoes-db.js` — níveis 1/3/5 usam os textos do catálogo
  const vantagensAptidoes = {
    'acrobacia': {
      1: { tipo: 'efeito', valor: 'Nunca sofre penalidades por superfícies estreitas ou instáveis comuns.', narrativa: 'Equilíbrio Natural' },
      3: { tipo: 'efeito', valor: 'Pode atravessar obstáculos, grades, janelas e espaços reduzidos sem precisar reduzir o movimento.', narrativa: 'Corpo Adaptável' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, realiza uma manobra física considerada impossível para uma pessoa comum, desde que não desafie as leis do mundo.', narrativa: 'Movimento Impossível' }
    },
    'alquimia': {
      1: { tipo: 'efeito', valor: 'Identifica ingredientes alquímicos apenas observando-os.', narrativa: 'Conhecimento de Reagentes' },
      3: { tipo: 'efeito', valor: 'Pode substituir um ingrediente comum por outro semelhante sem comprometer completamente a receita.', narrativa: 'Improvisação' },
      5: { tipo: 'efeito', valor: 'Uma vez por descanso, uma criação alquímica que falharia produz um resultado imperfeito em vez de falhar totalmente.', narrativa: 'Mestre Alquimista' }
    },
    'ambidestro': {
      1: { tipo: 'efeito', valor: 'Coordenação Total — Utiliza ambas as mãos com a mesma habilidade, sem qualquer perda de precisão ou controle.', narrativa: 'Coordenação Total' },
      3: { tipo: 'efeito', valor: 'Combate Simétrico — Consegue alternar armas, ferramentas e movimentos entre as duas mãos de forma completamente natural, confundindo adversários.', narrativa: 'Combate Simétrico' },
      5: { tipo: 'efeito', valor: 'Mestre das Duas Mãos — Uma vez por combate, pode executar uma sequência perfeitamente coordenada utilizando ambas as mãos simultaneamente, realizando duas ações compatíveis em perfeita sincronia.', narrativa: 'Mestre das Duas Mãos' }
    },
    'arcanismo': {
      1: { tipo: 'efeito', valor: 'Conhecimento Arcano — Reconhece escolas mágicas, encantamentos e fenômenos arcanos com facilidade.', narrativa: 'Conhecimento Arcano' },
      3: { tipo: 'efeito', valor: 'Manipulação Arcana — Consegue moldar a energia mágica com extrema precisão, reduzindo falhas durante conjurações complexas.', narrativa: 'Manipulação Arcana' },
      5: { tipo: 'efeito', valor: 'Arquimago — Uma vez por cena, pode compreender instantaneamente o funcionamento básico de uma magia ou artefato arcano desconhecido.', narrativa: 'Arquimago' }
    },
    'atletismo': {
      1: { tipo: 'efeito', valor: 'Condicionamento Físico — Escala, nada, corre e realiza esforços físicos intensos com muito mais eficiência.', narrativa: 'Condicionamento Físico' },
      3: { tipo: 'efeito', valor: 'Corpo Treinado — Consegue executar acrobacias, saltos e feitos físicos difíceis com naturalidade.', narrativa: 'Corpo Treinado' },
      5: { tipo: 'efeito', valor: 'Limite Humano — Uma vez por cena, pode superar temporariamente seus próprios limites físicos para realizar um feito extraordinário.', narrativa: 'Limite Humano' }
    },
    'atuacao': {
      1: { tipo: 'efeito', valor: 'Ator Nato — Consegue interpretar emoções e personalidades de maneira extremamente convincente.', narrativa: 'Ator Nato' },
      3: { tipo: 'efeito', valor: 'Mestre dos Papéis — Imita sotaques, trejeitos, postura e comportamento de outras pessoas após observá-las.', narrativa: 'Mestre dos Papéis' },
      5: { tipo: 'efeito', valor: 'Transformação Completa — Uma vez por cena, assume um personagem de forma tão perfeita que até conhecidos podem ser enganados.', narrativa: 'Transformação Completa' }
    },
    'beleza': {
      1: { tipo: 'efeito', valor: 'Boa Impressão — Sua aparência chama atenção e costuma causar uma primeira impressão positiva.', narrativa: 'Boa Impressão' },
      3: { tipo: 'efeito', valor: 'Presença Encantadora — Sua postura, elegância e carisma tornam difícil ignorar sua presença.', narrativa: 'Presença Encantadora' },
      5: { tipo: 'efeito', valor: 'Figura Memorável — Uma vez por cena, pode atrair naturalmente a atenção de todos ao redor por alguns instantes, tornando-se o centro das atenções.', narrativa: 'Figura Memorável' }
    },
    'camuflagem': {
      1: { tipo: 'efeito', valor: 'Mistura Natural — Consegue utilizar o ambiente para ocultar sua presença com grande eficiência.', narrativa: 'Mistura Natural' },
      3: { tipo: 'efeito', valor: 'Disfarce Ambiental — Adapta rapidamente sua postura e movimentação para combinar com qualquer terreno ou cenário.', narrativa: 'Disfarce Ambiental' },
      5: { tipo: 'efeito', valor: 'Invisibilidade Natural — Uma vez por cena, consegue permanecer praticamente imperceptível enquanto permanecer imóvel ou utilizar perfeitamente a cobertura do ambiente.', narrativa: 'Invisibilidade Natural' }
    },
    'canto': {
      1: { tipo: 'efeito', valor: 'Voz Harmoniosa — Sua voz é agradável, firme e capaz de prender facilmente a atenção de quem escuta.', narrativa: 'Voz Harmoniosa' },
      3: { tipo: 'efeito', valor: 'Melodia Inspiradora — Seu canto desperta emoções profundas, podendo acalmar, inspirar ou confortar aqueles que o ouvem.', narrativa: 'Melodia Inspiradora' },
      5: { tipo: 'efeito', valor: 'Canção Lendária — Uma vez por cena, pode executar uma apresentação memorável capaz de alterar significativamente o clima emocional de um grupo, desde que possam ouvi-lo.', narrativa: 'Canção Lendária' }
    },
    'compreensao': {
      1: { tipo: 'efeito', valor: 'Após alguns minutos analisando algo, compreende seu funcionamento básico.', narrativa: 'Observador' },
      3: { tipo: 'efeito', valor: 'Consegue identificar fraquezas, padrões ou inconsistências em técnicas, objetos e comportamentos.', narrativa: 'Entendimento Profundo' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode fazer uma pergunta ao mestre sobre uma situação, habilidade ou fenômeno e receber uma resposta verdadeira dentro do conhecimento que seu personagem seria capaz de alcançar.', narrativa: 'Iluminação' }
    },
    'controleqi': {
      1: { tipo: 'efeito', valor: 'Consegue perceber naturalmente a circulação de Qi em si mesmo e em outros seres vivos.', narrativa: 'Fluxo Energético' },
      3: { tipo: 'efeito', valor: 'Pode controlar seu próprio fluxo de Qi com extrema precisão, evitando desperdícios durante técnicas e meditação.', narrativa: 'Circulação Perfeita' },
      5: { tipo: 'efeito', valor: 'Uma vez por combate, pode interromper temporariamente o fluxo de Qi de um alvo, dificultando a utilização de técnicas espirituais por um turno.', narrativa: 'Supressão Energética' }
    },
    'conhecimento': {
      1: { tipo: 'efeito', valor: 'Reconhece facilmente livros, símbolos, artefatos e conhecimentos comuns de diversas áreas.', narrativa: 'Estudioso' },
      3: { tipo: 'efeito', valor: 'Consegue relacionar informações aparentemente desconexas e formular conclusões rapidamente.', narrativa: 'Biblioteca Viva' },
      5: { tipo: 'efeito', valor: 'Nunca esquece algo que tenha estudado ou presenciado conscientemente e pode recordar essas informações sempre que necessário.', narrativa: 'Memória Absoluta' }
    },
    'cultivo': {
      1: { tipo: 'efeito', valor: 'Obtém muito mais proveito de períodos de meditação e treinamento espiritual.', narrativa: 'Meditação Profunda' },
      3: { tipo: 'efeito', valor: 'Seu cultivo torna-se extremamente estável, reduzindo significativamente o risco de desvios energéticos.', narrativa: 'Harmonia Interior' },
      5: { tipo: 'efeito', valor: 'Uma vez por descanso, pode alcançar um estado de profunda compreensão sobre seu próprio cultivo, identificando falhas, gargalos ou o próximo passo para evoluir.', narrativa: 'Iluminação' }
    },
    'danca': {
      1: { tipo: 'efeito', valor: 'Consegue mover-se com extrema leveza e naturalidade, mesmo em ambientes difíceis.', narrativa: 'Passos Elegantes' },
      3: { tipo: 'efeito', valor: 'Adapta seus movimentos ao ritmo de qualquer combate, música ou situação sem perder a fluidez.', narrativa: 'Ritmo Perfeito' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode executar uma sequência de movimentos tão perfeita que confunde momentaneamente todos os observadores.', narrativa: 'Dança Celestial' }
    },
    'diplomacia': {
      1: { tipo: 'efeito', valor: 'Consegue manter conversas respeitosas mesmo entre pessoas com opiniões completamente opostas.', narrativa: 'Mediador' },
      3: { tipo: 'efeito', valor: 'Identifica rapidamente os interesses e motivações de ambas as partes durante uma negociação.', narrativa: 'Negociador Experiente' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode interromper temporariamente um conflito para abrir espaço para diálogo, desde que exista disposição mínima para conversar.', narrativa: 'Pacificador' }
    },
    'douqi': {
      1: { tipo: 'efeito', valor: 'Consegue revestir naturalmente ataques e armas com Qi.', narrativa: 'Canalização Espiritual' },
      3: { tipo: 'efeito', valor: 'Pode moldar o fluxo do Qi durante o combate para adaptar suas técnicas conforme a situação.', narrativa: 'Manipulação Refinada' },
      5: { tipo: 'efeito', valor: 'Seu Qi consegue atravessar barreiras espirituais simples e atingir diretamente a energia do alvo.', narrativa: 'Perfuração Espiritual' }
    },
    'estrategia': {
      1: { tipo: 'efeito', valor: 'Consegue analisar rapidamente um campo de batalha e identificar posições vantajosas.', narrativa: 'Pensamento Estratégico' },
      3: { tipo: 'efeito', valor: 'Antes de uma missão, pode declarar pequenas preparações plausíveis realizadas previamente.', narrativa: 'Plano de Contingência' },
      5: { tipo: 'efeito', valor: 'Uma vez por combate, pode reorganizar completamente o plano de ação do grupo, coordenando aliados de forma quase perfeita.', narrativa: 'Mestre Estrategista' }
    },
    'ferraria': {
      1: { tipo: 'efeito', valor: 'Reconhece facilmente metais, ligas e materiais de qualidade.', narrativa: 'Conhecimento Metalúrgico' },
      3: { tipo: 'efeito', valor: 'Produz equipamentos com acabamento superior e maior resistência ao desgaste.', narrativa: 'Ferreiro Experiente' },
      5: { tipo: 'efeito', valor: 'Uma vez por descanso, pode criar um equipamento excepcional capaz de desenvolver uma característica única, definida durante sua criação.', narrativa: 'Obra-Prima' }
    },
    'folego': {
      1: { tipo: 'efeito', valor: 'Mantém a respiração estável mesmo durante esforços prolongados.', narrativa: 'Respiração Controlada' },
      3: { tipo: 'efeito', valor: 'Consegue prolongar atividades físicas intensas por muito mais tempo que uma pessoa comum.', narrativa: 'Ritmo Constante' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode continuar agindo normalmente mesmo após atingir seu limite físico, até que a situação termine.', narrativa: 'Incansável' }
    },
    'furtividade': {
      1: { tipo: 'efeito', valor: 'Move-se produzindo o mínimo possível de ruído.', narrativa: 'Passos Silenciosos' },
      3: { tipo: 'efeito', valor: 'Sabe aproveitar sombras, obstáculos e distrações para permanecer despercebido.', narrativa: 'Presença Oculta' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, desaparece momentaneamente da percepção dos inimigos ao utilizar perfeitamente o ambiente ao seu redor, reaparecendo em uma posição vantajosa.', narrativa: 'Fantasma' }
    },
    'idioma': {
      1: { tipo: 'efeito', valor: 'Aprende novos idiomas com muito mais facilidade e compreende expressões básicas de línguas aparentadas.', narrativa: 'Poliglota' },
      3: { tipo: 'efeito', valor: 'Consegue identificar a origem, a época e até aspectos culturais de uma língua ou escrita desconhecida após analisá-la.', narrativa: 'Linguista' },
      5: { tipo: 'efeito', valor: 'Após alguns minutos de interação, consegue estabelecer comunicação básica com qualquer criatura inteligente, mesmo sem compartilhar um idioma.', narrativa: 'Comunicação Universal' }
    },
    'intimidacao': {
      1: { tipo: 'efeito', valor: 'Sua simples postura é suficiente para desencorajar indivíduos inseguros ou inexperientes.', narrativa: 'Presença Ameaçadora' },
      3: { tipo: 'efeito', valor: 'Consegue identificar rapidamente quem possui medo, insegurança ou hesitação e explorar essas fraquezas durante uma conversa.', narrativa: 'Domínio Psicológico' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode intimidar um alvo apenas com sua presença, obrigando-o a hesitar antes de agir caso sua determinação seja inferior à sua.', narrativa: 'Olhar do Predador' }
    },
    'intuicao': {
      1: { tipo: 'efeito', valor: 'Percebe quando algo está errado mesmo sem conseguir explicar o motivo.', narrativa: 'Sexto Sentido' },
      3: { tipo: 'efeito', valor: 'Consegue perceber mentiras, intenções ocultas ou mudanças de comportamento através de pequenos detalhes.', narrativa: 'Leitura Instintiva' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode perguntar ao mestre se determinada decisão representa um grande risco ou uma oportunidade favorável.', narrativa: 'Presságio' }
    },
    'labia': {
      1: { tipo: 'efeito', valor: 'Consegue conduzir naturalmente uma conversa para o assunto que desejar.', narrativa: 'Conversador Nato' },
      3: { tipo: 'efeito', valor: 'É capaz de plantar dúvidas, sugestões ou falsas conclusões sem que a outra pessoa perceba imediatamente.', narrativa: 'Manipulador' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode transformar uma conversa extremamente desfavorável em uma negociação justa, desde que o alvo esteja disposto a ouvir.', narrativa: 'Língua de Ouro' }
    },
    'lideranca': {
      1: { tipo: 'efeito', valor: 'Aliados tendem a confiar em suas decisões durante situações difíceis.', narrativa: 'Inspiração Natural' },
      3: { tipo: 'efeito', valor: 'Consegue distribuir tarefas e organizar grupos grandes com extrema eficiência, evitando confusão e desperdício de tempo.', narrativa: 'Coordenação' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, coordena perfeitamente todos os aliados próximos, permitindo que executem um plano previamente elaborado sem falhas de comunicação.', narrativa: 'Comandante Supremo' }
    },
    'maestria': {
      1: { tipo: 'efeito', valor: 'Escolha uma profissão, técnica ou conhecimento específico. Você aprende e evolui nessa área muito mais rapidamente.', narrativa: 'Especialista' },
      3: { tipo: 'efeito', valor: 'Erros simples relacionados à sua especialidade tornam-se extremamente raros.', narrativa: 'Domínio Absoluto' },
      5: { tipo: 'efeito', valor: 'Sua habilidade é tão refinada que outros especialistas conseguem reconhecer sua maestria apenas observando seu trabalho.', narrativa: 'Mestre Lendário' }
    },
    'matrizes': {
      1: { tipo: 'efeito', valor: 'Consegue compreender e reproduzir matrizes simples.', narrativa: 'Conhecimento Rúnico' },
      3: { tipo: 'efeito', valor: 'Pode criar matrizes condicionais que são ativadas apenas quando uma condição específica for atendida.', narrativa: 'Programação Arcana' },
      5: { tipo: 'efeito', valor: 'É capaz de combinar diversas matrizes em uma única formação complexa, produzindo efeitos inéditos.', narrativa: 'Mestre das Matrizes' }
    },
    'olhocritico': {
      1: { tipo: 'efeito', valor: 'Identifica pequenos defeitos em objetos, estruturas e equipamentos.', narrativa: 'Observador' },
      3: { tipo: 'efeito', valor: 'Após observar um alvo por algum tempo, consegue descobrir hábitos, padrões de combate ou possíveis fraquezas.', narrativa: 'Leitura de Vulnerabilidades' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode descobrir o ponto fraco mais evidente de uma criatura, objeto ou construção.', narrativa: 'Análise Perfeita' }
    },
    'percepcao': {
      1: { tipo: 'efeito', valor: 'Percebe sons, odores e movimentos discretos com facilidade.', narrativa: 'Sentidos Aguçados' },
      3: { tipo: 'efeito', valor: 'Consegue reconstruir parcialmente acontecimentos através de pegadas, marcas, vestígios e detalhes do ambiente.', narrativa: 'Investigador' },
      5: { tipo: 'efeito', valor: 'É extremamente difícil ser surpreendido quando estiver atento ao ambiente.', narrativa: 'Olhos que Tudo Veem' }
    },
    'prestidigitacao': {
      1: { tipo: 'efeito', valor: 'Executa movimentos delicados com extrema precisão.', narrativa: 'Dedos Ágeis' },
      3: { tipo: 'efeito', valor: 'Consegue esconder, trocar ou retirar pequenos objetos sem chamar atenção.', narrativa: 'Manipulação Imperceptível' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode realizar um truque manual praticamente impossível aos olhos de quem estiver observando.', narrativa: 'Mãos Fantasma' }
    },
    'pressentimento': {
      1: { tipo: 'efeito', valor: 'Pouco antes de um perigo iminente, sente uma estranha sensação de alerta.', narrativa: 'Mau Presságio' },
      3: { tipo: 'efeito', valor: 'Recebe breves intuições sobre acontecimentos que podem ocorrer nos próximos instantes.', narrativa: 'Vislumbre' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode pedir ao mestre um aviso sobre um perigo imediato antes que ele aconteça.', narrativa: 'Premonição' }
    },
    'religiao': {
      1: { tipo: 'efeito', valor: 'Reconhece divindades, símbolos religiosos, rituais e maldições comuns.', narrativa: 'Erudição Sagrada' },
      3: { tipo: 'efeito', valor: 'Compreende os costumes, doutrinas e práticas das principais religiões.', narrativa: 'Devoto Experiente' },
      5: { tipo: 'efeito', valor: 'Durante uma oração ou ritual, pode receber um pequeno presságio ou orientação da divindade que segue, caso existam condições para isso.', narrativa: 'Revelação Divina' }
    },
    'sanidade': {
      1: { tipo: 'efeito', valor: 'Mantém a calma diante de situações perturbadoras.', narrativa: 'Mente Estável' },
      3: { tipo: 'efeito', valor: 'Recupera-se muito mais rapidamente de traumas emocionais e choques psicológicos.', narrativa: 'Psique Resiliente' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode ignorar completamente um efeito de medo, desespero ou terror.', narrativa: 'Mente Inabalável' }
    },
    'seducao': {
      1: { tipo: 'efeito', valor: 'Sua presença desperta simpatia e curiosidade com facilidade.', narrativa: 'Charme Natural' },
      3: { tipo: 'efeito', valor: 'Consegue criar rapidamente uma conexão emocional durante uma conversa.', narrativa: 'Encanto' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode transformar uma interação hostil em uma oportunidade de diálogo ou aproximação, desde que o alvo seja emocionalmente influenciável.', narrativa: 'Conquista Perfeita' }
    },
    'selos': {
      1: { tipo: 'efeito', valor: 'Consegue armazenar pequenos objetos ou energias em selos.', narrativa: 'Selagem Básica' },
      3: { tipo: 'efeito', valor: 'Pode criar selos mais resistentes e duradouros.', narrativa: 'Selagem Avançada' },
      5: { tipo: 'efeito', valor: 'É capaz de desenvolver selos complexos para armazenar técnicas, criaturas, artefatos ou grandes quantidades de energia.', narrativa: 'Mestre Selador' }
    },
    'sobrevivencia': {
      1: { tipo: 'efeito', valor: 'Encontra facilmente abrigo, água e recursos básicos na natureza.', narrativa: 'Adaptabilidade' },
      3: { tipo: 'efeito', valor: 'Consegue seguir rastros, identificar animais e prever mudanças ambientais.', narrativa: 'Rastreador' },
      5: { tipo: 'efeito', valor: 'Mesmo em ambientes extremamente hostis, encontra maneiras de permanecer vivo utilizando apenas os recursos disponíveis.', narrativa: 'Sobrevivente Lendário' }
    },
    'tolerancia': {
      1: { tipo: 'efeito', valor: 'Suporta melhor temperaturas extremas, fome, sede e desconforto.', narrativa: 'Corpo Adaptável' },
      3: { tipo: 'efeito', valor: 'Seu organismo combate com maior eficiência venenos, doenças e condições adversas.', narrativa: 'Resistência Natural' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, permanece consciente e capaz de agir mesmo quando seu corpo deveria ceder ao esgotamento.', narrativa: 'Vontade Inquebrável' }
    },
    'unicskill': {
      1: { tipo: 'efeito', valor: 'Desenvolve uma habilidade exclusiva ligada ao seu Núcleo.', narrativa: 'Despertar' },
      3: { tipo: 'efeito', valor: 'Descobre novas formas de utilizar sua habilidade única, ampliando sua versatilidade.', narrativa: 'Evolução' },
      5: { tipo: 'efeito', valor: 'Sua habilidade desperta uma característica exclusiva que nenhum outro usuário consegue reproduzir exatamente.', narrativa: 'Singularidade' }
    },
    'vontade': {
      1: { tipo: 'efeito', valor: 'Mantém suas convicções mesmo sob grande pressão.', narrativa: 'Espírito Indomável' },
      3: { tipo: 'efeito', valor: 'É extremamente difícil fazê-lo desistir de um objetivo importante.', narrativa: 'Determinação Absoluta' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, rompe ou resiste a um efeito de manipulação mental, ilusão ou controle da mente.', narrativa: 'Liberdade da Mente' }
    },
    'zanjutsu': {
      1: { tipo: 'efeito', valor: 'Domina corretamente a postura, empunhadura e fundamentos das espadas.', narrativa: 'Técnica Refinada' },
      3: { tipo: 'efeito', valor: 'Consegue adaptar seu estilo rapidamente ao tipo de arma branca utilizada.', narrativa: 'Espadachim Experiente' },
      5: { tipo: 'efeito', valor: 'Uma vez por combate, realiza um aparo perfeito capaz de neutralizar completamente um ataque corpo a corpo executado contra você, desde que seja possível bloqueá-lo.', narrativa: 'Defesa Perfeita' }
    },
    'hoho': {
      1: { tipo: 'efeito', valor: 'Domina os fundamentos do Hohō, movimentando-se com extrema leveza e rapidez.', narrativa: 'Passos Instantâneos' },
      3: { tipo: 'efeito', valor: 'Consegue realizar deslocamentos tão rápidos que deixa pós-imagens ou desaparece momentaneamente da percepção de quem observa.', narrativa: 'Movimento Fantasma' },
      5: { tipo: 'efeito', valor: 'Uma vez por combate, pode realizar um Shunpo para qualquer ponto dentro do seu campo de visão, desde que o local seja acessível.', narrativa: 'Shunpo' }
    },
    'kido': {
      1: { tipo: 'efeito', valor: 'Consegue moldar o Reiryoku com precisão para executar Kidōs com maior estabilidade.', narrativa: 'Canalização Espiritual' },
      3: { tipo: 'efeito', valor: 'É capaz de conjurar Kidōs com menos gestos e palavras, mantendo sua eficiência.', narrativa: 'Domínio do Kidō' },
      5: { tipo: 'efeito', valor: 'Uma vez por combate, pode conjurar um Kidō sem recitar seu encantamento completo, preservando praticamente todo o seu poder.', narrativa: 'Eishōhaki' }
    },
    'hakuda': {
      1: { tipo: 'efeito', valor: 'Domina os fundamentos do combate corpo a corpo utilizando apenas o próprio corpo.', narrativa: 'Artes Marciais' },
      3: { tipo: 'efeito', valor: 'Consegue alternar golpes, projeções, imobilizações e contra-ataques com extrema naturalidade.', narrativa: 'Combate Adaptável' },
      5: { tipo: 'efeito', valor: 'Uma vez por combate, pode executar uma técnica perfeita de combate desarmado capaz de interromper completamente a ação de um inimigo.', narrativa: 'Mestre do Hakuda' }
    },
    'reiatsu': {
      1: { tipo: 'efeito', valor: 'Sua Reiatsu pode ser sentida claramente por outros usuários espirituais.', narrativa: 'Presença Espiritual' },
      3: { tipo: 'efeito', valor: 'Aprende a controlar sua Reiatsu, ocultando-a ou liberando-a conforme desejar.', narrativa: 'Domínio da Pressão' },
      5: { tipo: 'efeito', valor: 'Uma vez por combate, libera sua Reiatsu de forma avassaladora, obrigando todos os inimigos próximos a enfrentarem um teste de Vontade ou ficarem abalados diante da diferença de poder.', narrativa: 'Pressão Absoluta' }
    },
    'reiraku': {
      1: { tipo: 'efeito', valor: 'Percebe naturalmente a presença de seres espirituais próximos.', narrativa: 'Sentido Espiritual' },
      3: { tipo: 'efeito', valor: 'É capaz de seguir rastros espirituais e localizar indivíduos através da assinatura do seu Reiryoku.', narrativa: 'Rastreamento Espiritual' },
      5: { tipo: 'efeito', valor: 'Consegue perceber seres ocultos, invisíveis, disfarçados espiritualmente ou utilizando técnicas de ocultação espiritual.', narrativa: 'Visão da Alma' }
    },
    'comunicacao_zanpakuto': {
      1: { tipo: 'efeito', valor: 'Consegue ouvir e compreender melhor a vontade da sua Zanpakutō durante a meditação.', narrativa: 'Voz Interior' },
      3: { tipo: 'efeito', valor: 'A comunicação com sua Zanpakutō torna-se natural, permitindo compreender seus sentimentos e intenções com facilidade.', narrativa: 'Sincronia Espiritual' },
      5: { tipo: 'efeito', valor: 'Uma vez por descanso, pode pedir orientação diretamente à sua Zanpakutō, recebendo uma resposta sincera dentro do conhecimento que ela possui.', narrativa: 'Harmonia Absoluta' }
    },
    'conhecimento_soul_society': {
      1: { tipo: 'efeito', valor: 'Conhece a estrutura, história e funcionamento da Soul Society.', narrativa: 'Estudioso da Soul Society' },
      3: { tipo: 'efeito', valor: 'Reconhece técnicas, tradições, famílias nobres, divisões e figuras importantes apenas observando detalhes.', narrativa: 'Especialista' },
      5: { tipo: 'efeito', valor: 'Consegue identificar rapidamente características, hábitos e possíveis habilidades de Hollows, Arrancars, Quincy e Shinigamis conhecidos.', narrativa: 'Enciclopédia Viva' }
    },
    'resistencia_espiritual': {
      1: { tipo: 'efeito', valor: 'Mantém a estabilidade espiritual mesmo diante de grandes pressões.', narrativa: 'Espírito Resiliente' },
      3: { tipo: 'efeito', valor: 'Seu espírito suporta técnicas espirituais intensas sem perder facilmente o controle.', narrativa: 'Alma Inabalável' },
      5: { tipo: 'efeito', valor: 'Uma vez por combate, pode suportar completamente uma técnica espiritual que normalmente o incapacitaria, permanecendo consciente.', narrativa: 'Barreira Espiritual' }
    },
    'konso': {
      1: { tipo: 'efeito', valor: 'Consegue realizar corretamente o ritual de envio das almas para a Soul Society.', narrativa: 'Guia Espiritual' },
      3: { tipo: 'efeito', valor: 'Reconhece almas corrompidas e compreende o estado espiritual em que se encontram.', narrativa: 'Purificação' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode purificar uma alma menor ou espírito corrompido sem necessidade de combate, caso sua corrupção ainda seja reversível.', narrativa: 'Purificação Suprema' }
    },
    'meditacao_jinzen': {
      1: { tipo: 'efeito', valor: 'Entra em estado meditativo com extrema facilidade, alcançando rapidamente a paz interior.', narrativa: 'Meditação Profunda' },
      3: { tipo: 'efeito', valor: 'Consegue acessar conscientemente seu mundo interior para compreender melhor sua Zanpakutō e seu próprio espírito.', narrativa: 'Mundo Interior' },
      5: { tipo: 'efeito', valor: 'Uma vez por descanso, pode entrar em um profundo estado de Jinzen, fortalecendo temporariamente sua conexão espiritual e recebendo uma revelação, ensinamento ou orientação de sua Zanpakutō.', narrativa: 'Êxtase Espiritual' }
    },
    'investigacao': {
      1: { tipo: 'efeito', valor: 'Consegue encontrar e preservar pistas, evidências e detalhes que a maioria das pessoas ignoraria durante uma investigação.', narrativa: 'Coleta de Evidências' },
      3: { tipo: 'efeito', valor: 'Após analisar uma cena, consegue reconstruir parcialmente a sequência dos acontecimentos com base nos vestígios encontrados.', narrativa: 'Reconstrução dos Fatos' },
      5: { tipo: 'efeito', valor: 'Uma vez por cena, pode formular uma hipótese sobre um mistério, crime ou acontecimento. O mestre deve informar se essa hipótese está correta, parcialmente correta ou incorreta, sem revelar detalhes adicionais.', narrativa: 'Detetive Exímio' }
    }
  };

  /**
   * Estado de bônus opcionais
   * Estrutura: { "aptidaoId_nivel": "valor" | "valorOpcional" }
   * DESATIVADO - Persistência foi removida
   */
  let estadoBonusOpcionais = {};

  /**
   * REATIVADO: carregarEstadoBonusOpcionais()
   * Carrega estado de bônus opcionais do localStorage
   */
  function carregarEstadoBonusOpcionais() {
    try {
      const salvo = localStorage.getItem('estadoBonusOpcionais');
      if (salvo) {
        estadoBonusOpcionais = JSON.parse(salvo);
        console.log('✅ Estado de bônus opcionais carregado do localStorage:', estadoBonusOpcionais);
      } else {
        estadoBonusOpcionais = {};
        console.log('ℹ️ Nenhum estado anterior de bônus opcionais, começando vazio');
      }
    } catch (e) {
      console.error('❌ Erro ao carregar estado de bônus opcionais:', e);
      estadoBonusOpcionais = {};
    }
  }

  /**
   * REATIVADO: salvarEstadoBonusOpcionais()
   * Salva estado de bônus opcionais no localStorage
   */
  function salvarEstadoBonusOpcionais() {
    try {
      localStorage.setItem('estadoBonusOpcionais', JSON.stringify(estadoBonusOpcionais));
      console.log('💾 Estado de bônus opcionais salvo no localStorage:', estadoBonusOpcionais);
    } catch (e) {
      console.error('❌ Erro ao salvar estado de bônus opcionais:', e);
    }
  }

  /**
   * Limpa todos os bônus opcionais de uma aptidão removida
   * Evita resquícios quando uma aptidão é excluída
   */
  function limparBonusOpcionalDaAptidao(aptidaoId) {
    console.log(`🗑️ Limpando bônus opcionais da aptidão: ${aptidaoId}`);
    
    carregarEstadoBonusOpcionais();
    
    let foiRemovido = false;
    // Remover todas as chaves que começam com o aptidaoId_
    for (const chave in estadoBonusOpcionais) {
      if (chave.startsWith(`${aptidaoId}_`)) {
        delete estadoBonusOpcionais[chave];
        console.log(`  ✓ Removido: ${chave}`);
        foiRemovido = true;
      }
    }
    
    if (foiRemovido) {
      salvarEstadoBonusOpcionais();
      console.log(`✅ Bônus opcionais de "${aptidaoId}" foram limpos`);
    }
  }

  /**
   * Obtém a chave para bônus opcional
   */
  function getChaveBonusOpcional(aptidaoId, nivel) {
    return `${aptidaoId}_${nivel}`;
  }

  /**
   * Obtém qual bônus opcional está ativo
   */
  function getBonusOpcionalAtivo(aptidaoId, nivel) {
    // ✅ Garantir que estado foi carregado
    if (Object.keys(estadoBonusOpcionais).length === 0) {
      carregarEstadoBonusOpcionais();
    }
    
    const chave = getChaveBonusOpcional(aptidaoId, nivel);
    return estadoBonusOpcionais[chave] || 'valor'; // Default: valor principal
  }

  /**
   * Alterna entre bônus opcional principal e alternativo
   */
  function alternarBonusOpcional(aptidaoId, nivel) {
    // ✅ GARANTIR que estado está carregado ANTES de usar
    carregarEstadoBonusOpcionais();
    
    const chave = getChaveBonusOpcional(aptidaoId, nivel);
    const atual = estadoBonusOpcionais[chave] || 'valor';
    const novo = atual === 'valor' ? 'valorOpcional' : 'valor';
    estadoBonusOpcionais[chave] = novo;
    salvarEstadoBonusOpcionais();
    console.log(`🔁 Bônus opcional alternado: ${aptidaoId} nível ${nivel} -> ${novo}`);
    return novo;
  }

  /**
   * Mapeia atributos simples
   * Exemplo: "+5 Força" -> { atributo: "forca", valor: 5 }
   */
  function mapearAtributoSimples(texto) {
    const mapa = {
      'força': 'forca', 'for': 'forca',
      'vitalidade': 'vitalidade', 'vit': 'vitalidade',
      'agilidade': 'agilidade', 'agi': 'agilidade',
      'inteligência': 'inteligencia', 'int': 'inteligencia',
      'percepção': 'percepcao', 'per': 'percepcao',
      'sorte': 'sorte', 'sor': 'sorte',
      'prontidão': 'prontidao', 'pront': 'prontidao',
      'ataque': 'ataque', 'atk': 'ataque',
      'defesa': 'defesa', 'def': 'defesa',
      'reação': 'reacao', 'rea': 'reacao',
      'precisão': 'precisao', 'prec': 'precisao',
      'evasão': 'evasao', 'eva': 'evasao',
      'saúde': 'saude', 'hp': 'saude',
      'energia': 'energia',
      'fadiga': 'fadiga'
    };

    const regex = /([+-])(\d+)\s+([a-zçãêóú]+)/i;
    const match = texto.match(regex);

    if (!match) return null;

    const [, sinal, valor, atributoTexto] = match;
    const atributoNorm = atributoTexto.toLowerCase().trim();
    const atributo = mapa[atributoNorm];

    if (!atributo) {
      console.warn(`⚠️ Atributo não mapeado: ${atributoTexto}`);
      return null;
    }

    return {
      atributo,
      valor: parseInt(sinal + valor)
    };
  }

  /**
   * Mapeia bônus duplo
   * Exemplo: "+3 Força & Agilidade" -> [{ atributo: "forca", valor: 3 }, { atributo: "agilidade", valor: 3 }]
   */
  function mapearBonusDuplo(texto) {
    const partes = texto.split('&').map(p => p.trim());
    const bônus = [];

    partes.forEach(parte => {
      const mapeado = mapearAtributoSimples(parte);
      if (mapeado) {
        bônus.push(mapeado);
      }
    });

    return bônus.length === 2 ? bônus : null;
  }

  /**
   * Mapeia bônus percentual
   * Exemplo: "+20% Prontidão" -> { atributo: "prontidao", percentual: 20 }
   */
  function mapearBonusPercentual(texto) {
    console.log(`🔤 [mapearBonusPercentual] Processando: "${texto}"`);
    
    const mapa = {
      'força': 'forca', 'for': 'forca',
      'vitalidade': 'vitalidade', 'vit': 'vitalidade',
      'agilidade': 'agilidade', 'agi': 'agilidade',
      'inteligência': 'inteligencia', 'int': 'inteligencia',
      'percepção': 'percepcao', 'per': 'percepcao',
      'sorte': 'sorte', 'sor': 'sorte',
      'prontidão': 'prontidao', 'pront': 'prontidao',
      'ataque': 'ataque', 'atk': 'ataque',
      'defesa': 'defesa', 'def': 'defesa',
      'reação': 'reacao', 'rea': 'reacao',
      'precisão': 'precisao', 'prec': 'precisao',
      'evasão': 'evasao', 'eva': 'evasao'
    };

    const regex = /([+-])(\d+)%\s+([a-zçãêóú]+)/i;
    const match = texto.match(regex);

    if (!match) {
      console.warn(`⚠️ [mapearBonusPercentual] Regex não encontrou padrão em: "${texto}"`);
      return null;
    }

    const [, sinal, valor, atributoTexto] = match;
    console.log(`  📦 Sinal: "${sinal}", Valor: "${valor}", Atributo: "${atributoTexto}"`);
    
    const atributoNorm = atributoTexto.toLowerCase().trim();
    const atributo = mapa[atributoNorm];

    if (!atributo) {
      console.warn(`⚠️ Atributo percentual não mapeado: ${atributoTexto} (normalizado: ${atributoNorm})`);
      return null;
    }

    return {
      atributo,
      percentual: parseInt(sinal + valor)
    };
  }

  /**
   * Obtém o valor base de um atributo
   * Tenta múltiplas fontes para encontrar o valor correto
   * Se nenhuma fonte tiver o valor, usa valores padrão
   */
  function obterValorBaseAtributo(atributo) {
    console.log(`🔍 [obterValorBaseAtributo] Procurando valor base para "${atributo}"...`);
    
    // Prioridade 1: AtributosManager.personagemData
    if (window.atributosManager && window.atributosManager.personagemData) {
      const data = window.atributosManager.personagemData;
      const primarios = data.atributos || {};
      const secundarios = data.secundarios || {};
      
      console.log(`  📌 Primários disponíveis:`, Object.keys(primarios));
      console.log(`  📌 Secundários disponíveis:`, Object.keys(secundarios));
      console.log(`  📌 Valor em primarios[${atributo}]:`, primarios[atributo]);
      console.log(`  📌 Valor em secundarios[${atributo}]:`, secundarios[atributo]);
      
      // Verificar primários primeiro
      if (primarios[atributo] && primarios[atributo] > 0) {
        console.log(`  ✅ Valor de "${atributo}": ${primarios[atributo]} (primário)`);
        return primarios[atributo];
      }
      
      // Verificar secundários
      if (secundarios[atributo] && secundarios[atributo] > 0) {
        console.log(`  ✅ Valor de "${atributo}": ${secundarios[atributo]} (secundário)`);
        return secundarios[atributo];
      }
    }

    // Prioridade 2: StateManager
    if (window.appState) {
      const state = window.appState.getState();
      const primarios = state.atributos?.primarios || {};
      const secundarios = state.atributos?.secundarios || {};
      
      console.log(`  📌 StateManager primários:`, Object.keys(primarios));
      console.log(`  📌 StateManager secundários:`, Object.keys(secundarios));
      
      let valor = primarios[atributo]?.total || secundarios[atributo]?.total;
      if (valor && valor > 0) {
        console.log(`  ✅ Valor de "${atributo}": ${valor} (StateManager)`);
        return valor;
      }
    }

    // Fallback 3: Usar valores padrão conhecidos
    const valoresPadrao = {
      // Primários padrão (conforme ReDungeon)
      'forca': 10,
      'vitalidade': 10,
      'agilidade': 10,
      'inteligencia': 10,
      'percepcao': 10,
      'sorte': 10,
      // Secundários padrão (conforme ReDungeon)
      'prontidao': 8,
      'ataque': 10,
      'defesa': 20,
      'reacao': 16,
      'precisao': 12,
      'evasao': 14
    };

    const valorPadrao = valoresPadrao[atributo];
    if (valorPadrao !== undefined) {
      console.warn(`⚠️ [VantagensAptidoesSystem] Usando valor padrão para "${atributo}": ${valorPadrao}`);
      return valorPadrao;
    }

    // Fallback final
    console.warn(`⚠️ [VantagensAptidoesSystem] Valor base não encontrado para "${atributo}" - usando 0`);
    return 0;
  }

  /**
   * Aplica um bônus simples
   */
  function aplicarBonus(atributo, valor, bonusAptidoes) {
    if (!bonusAptidoes.hasOwnProperty(atributo)) {
      console.warn(`⚠️ Atributo não reconhecido: ${atributo}`);
      return;
    }
    bonusAptidoes[atributo] = (bonusAptidoes[atributo] || 0) + valor;
  }

  /**
   * Aplica bônus de uma vantagem
   */
  function aplicarBonusVantagem(vantagem, aptidaoId, nivel, bonusAptidoes) {
    if (!vantagem || !vantagem.tipo) return;

    const tipo = vantagem.tipo;
    const valor = vantagem.valor;

    console.log(`📌 Aplicando ${tipo}: ${valor} (${aptidaoId} nível ${nivel})`);

    switch (tipo) {
      case 'bonus': {
        const mapeado = mapearAtributoSimples(valor);
        if (mapeado) {
          aplicarBonus(mapeado.atributo, mapeado.valor, bonusAptidoes);
        }
        break;
      }

      case 'bonus-duplo': {
        const mapeados = mapearBonusDuplo(valor);
        if (mapeados) {
          mapeados.forEach(m => aplicarBonus(m.atributo, m.valor, bonusAptidoes));
        }
        break;
      }

      case 'bonus-percentual': {
        const mapeado = mapearBonusPercentual(valor);
        if (mapeado) {
          console.log(`  🔢 Mapeamento: ${valor} -> atributo="${mapeado.atributo}", percentual=${mapeado.percentual}%`);
          const base = obterValorBaseAtributo(mapeado.atributo);
          const bonusAbsoluto = Math.round(base * (mapeado.percentual / 100));
          console.log(`  🔢 Cálculo: ${base} * ${mapeado.percentual}% = ${base * (mapeado.percentual / 100)} ≈ ${bonusAbsoluto}`);
          aplicarBonus(mapeado.atributo, bonusAbsoluto, bonusAptidoes);
          console.log(`  ✅ Bônus aplicado: +${bonusAbsoluto} para ${mapeado.atributo}`);
        } else {
          console.error(`  ❌ Falha ao mapear bonus-percentual: ${valor}`);
        }
        break;
      }

      case 'bonus-opcional': {
        const ativo = getBonusOpcionalAtivo(aptidaoId, nivel);
        const bonusTexto = ativo === 'valor' ? valor : vantagem.valorOpcional;
        const mapeado = mapearAtributoSimples(bonusTexto);
        if (mapeado) {
          aplicarBonus(mapeado.atributo, mapeado.valor, bonusAptidoes);
          console.log(`  🔁 Ativo: ${ativo} -> ${bonusTexto}`);
        }
        break;
      }

      case 'efeito':
        // Apenas renderiza, não aplica bônus
        console.log(`  📝 Efeito narrativo: ${valor}`);
        break;
    }
  }

  /**
   * FUNÇÃO CENTRAL: Recalcula todos os bônus a partir das aptidões
   * Deve ser chamada sempre que:
   * - Uma aptidão sobe de nível
   * - Uma aptidão é removida
   * - Uma aptidão é resetada
   * - Bônus opcional é alternado
   * - Ficha é carregada
   * - Ficha é importada
   */
  function recalcularBonusAptidoesAPartirDasAptidoes() {
    console.log('🧮 [VantagensAptidoesSystem] Recalculando bônus a partir das aptidões...');

    // 1️⃣ Zerar bônus
    const bonusAptidoes = {
      forca: 0, vitalidade: 0, agilidade: 0, inteligencia: 0, percepcao: 0, sorte: 0,
      prontidao: 0, ataque: 0, defesa: 0, reacao: 0, precisao: 0, evasao: 0,
      saude: 0, energia: 0, fadiga: 0
    };

    // 2️⃣ Carregar estado de bônus opcionais
    carregarEstadoBonusOpcionais();

    // 3️⃣ Obter aptidões do personagem
    let aptidoes = [];
    if (window.aptidoesManager && window.aptidoesManager.aptidoesPersonagem) {
      aptidoes = window.aptidoesManager.aptidoesPersonagem;
    } else if (window.atributosManager && window.atributosManager.personagemData?.aptidoesPersonagem) {
      aptidoes = window.atributosManager.personagemData.aptidoesPersonagem;
    }

    if (!aptidoes || aptidoes.length === 0) {
      console.log('ℹ️ Nenhuma aptidão para processar');
      return bonusAptidoes;
    }

    console.log(`📌 Processando ${aptidoes.length} aptidões`);

    // 4️⃣ Percorrer cada aptidão até seu nível atual
    aptidoes.forEach(apt => {
      if (!apt || !apt.nivel || apt.nivel <= 0) return;

      const aptidaoId = apt.id;
      const nivelAtual = apt.nivel;

      console.log(`\n🎯 ${aptidaoId.toUpperCase()} - Nível ${nivelAtual}`);

      // Obter vantagens desta aptidão
      const vantagens = vantagensAptidoes[aptidaoId];
      if (!vantagens) {
        console.warn(`⚠️ Aptidão não tem vantagens definidas: ${aptidaoId}`);
        return;
      }

      // Aplicar todas as vantagens até o nível atual
      for (let nivel = 1; nivel <= nivelAtual; nivel++) {
        const vantagem = vantagens[nivel];
        if (!vantagem) {
          console.log(`  ⊘ Nível ${nivel}: sem vantagem definida`);
          continue;
        }

        aplicarBonusVantagem(vantagem, aptidaoId, nivel, bonusAptidoes);
      }
    });

    console.log('\n✅ Bônus recalculados:', bonusAptidoes);
    return bonusAptidoes;
  }

  /**
   * Retorna todas as vantagens desbloqueadas
   * Nota: Mostra APENAS os níveis 1, 3 e 5 (efeitos narrativos)
   * Para renderização na box "Vantagens Desbloqueadas"
   */
  function obterVantagensDesbloqueadas() {
    const vantagens = [];

    let aptidoes = [];
    if (window.aptidoesManager && window.aptidoesManager.aptidoesPersonagem) {
      aptidoes = window.aptidoesManager.aptidoesPersonagem;
    } else if (window.atributosManager && window.atributosManager.personagemData?.aptidoesPersonagem) {
      aptidoes = window.atributosManager.personagemData.aptidoesPersonagem;
    }

    aptidoes.forEach(apt => {
      if (!apt || !apt.nivel || apt.nivel <= 0) return;

      const aptidaoId = apt.id;
      const nivelAtual = apt.nivel;
      const aptidaoVantagens = vantagensAptidoes[aptidaoId];

      if (!aptidaoVantagens) return;

      // Apenas mostrar níveis 1, 3, 5 (efeitos narrativos)
      const niveisAMostrar = [1, 3, 5].filter(n => n <= nivelAtual);

      niveisAMostrar.forEach(nivel => {
        const vantagem = aptidaoVantagens[nivel];
        if (!vantagem) return;

        vantagens.push({
          aptidaoId,
          aptidaoNome: apt.nome,
          nivel,
          tipo: vantagem.tipo,
          valor: vantagem.valor,
          valorOpcional: vantagem.valorOpcional,
          narrativa: vantagem.narrativa || false
        });
      });
    });

    return vantagens;
  }

  /**
   * 💾 Exporta estado de bônus opcionais
   * Retorna um objeto com todas as seleções de bônus opcionais
   */
  function exportarEstadoBonusOpcionais() {
    carregarEstadoBonusOpcionais();
    return { ...estadoBonusOpcionais };
  }

  /**
   * 📥 Importa estado de bônus opcionais
   * Restaura as seleções de bônus opcionais
   */
  function importarEstadoBonusOpcionais(estado) {
    if (!estado || typeof estado !== 'object') {
      console.warn('⚠️ Estado inválido para importação de bônus opcionais');
      return;
    }
    
    estadoBonusOpcionais = { ...estado };
    salvarEstadoBonusOpcionais();
    console.log('✅ Estado de bônus opcionais importado:', estado);
  }

  // ============================================
  // API Pública
  // ============================================
  return {
    vantagensAptidoes,
    recalcularBonusAptidoesAPartirDasAptidoes,
    obterVantagensDesbloqueadas,
    alternarBonusOpcional,
    getBonusOpcionalAtivo,
    carregarEstadoBonusOpcionais,
    salvarEstadoBonusOpcionais,
    exportarEstadoBonusOpcionais, // ✨ NOVO
    importarEstadoBonusOpcionais, // ✨ NOVO
    limparBonusOpcionalDaAptidao,
    getChaveBonusOpcional,
    mapearAtributoSimples,
    mapearBonusDuplo,
    mapearBonusPercentual
  };
})();

// Garantir que está disponível globalmente
if (typeof window !== 'undefined') {
  window.vantagensAptidoesSystem = VantagensAptidoesSystem;
}
