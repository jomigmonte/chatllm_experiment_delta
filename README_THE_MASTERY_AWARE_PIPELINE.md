# O Mastery-Aware Pipeline

O Mastery-Aware Pipeline é um fluxo de trabalho projetado para integrar assistentes de IA no desenvolvimento de software de forma estruturada. Seu objetivo principal é garantir que o desenvolvedor mantenha o engajamento cognitivo e evite o acúmulo de dívida cognitiva ao longo do processo de construção de software. Ao substituir a delegação irrestrita por etapas metodológicas que exigem planejamento e defesa técnica, o pipeline preserva a produtividade da IA ao mesmo tempo em que atua como um instrumento pedagógico para retenção do conhecimento estrutural do sistema.

Durante o desenvolvimento de uma tarefa, os artefatos ficam organizados em uma estrutura de diretórios isolada para cada etapa, semelhante a:

```text
.brainsback/0000001_task_description_2026.01.01_000000/
├── TODO.md
├── REPORT.md
├── REACTO.md
└── SOCRATIC_REVIEW.md

```

## Guia de Preenchimento dos Artefatos

Abaixo está a explicação de cada artefato na ordem em que devem ser utilizados no ciclo de desenvolvimento, acompanhados de exemplos baseados na implementação de emojis em um jogo da velha (*Tic-Tac-Toe*).

### 1. TODO.md (Especificação Formal)

**O que significa:** É o seu planejamento estratégico. Este documento representa a intenção do desenvolvedor e o design do software antes de qualquer linha de código ser escrita.
**Como preencher:** Deve ser preenchido **manualmente** pelo desenvolvedor **antes** de solicitar a geração de código à IA. Descreva o problema de forma clara, liste os passos que você planeja seguir e defina rigorosamente como será o critério de sucesso. **Regra estrita: Agentes de IA são proibidos de editar este arquivo**.

```markdown
# Strategic Blueprint

> Focus on the **what** and **why**. The code will follow.

**Hard rule**: AI agents must not edit this file and must not draft paste-ready content for it.

## The Problem
O arquivo index.html possui um jogo de tabuleiro (jogo da velha) baseado em texto. Preciso substituir os caracteres tradicionais de exibição dos jogadores ("X" e "O") por emojis faciais de gato (🐱) para o Jogador 1 e de cachorro (🐶) para o Jogador 2, garantindo que a lógica interna do motor do jogo permaneça intacta.

## Steps
- [x] Ler os arquivos do projeto (index.html, game.js e script.js).
- [x] Identificar os pontos de renderização do tabuleiro e das mensagens de status na interface.
- [x] Criar uma camada de tradução ou mapeamento para os emojis na camada de apresentação.
- [x] Atualizar a interface inicial no arquivo HTML.
- [x] Incluir testes automatizados de renderização visual no arquivo de testes.

## Success Looks Like
- [x] A interface exibe o emoji de gato (🐱) no lugar do "X".
- [x] A interface exibe o emoji de cachorro (🐶) no lugar do "O".
- [x] As mensagens de status do turno exibem os emojis corretamente.
- [x] Todos os testes automatizados são executados com sucesso.

```

### 2. REPORT.md (Relatório de Implementação)

**O que significa:** É um resumo otimizado das alterações realizadas no repositório, indicando quais arquivos foram modificados e a estratégia de testes aplicada.
**Como preencher:** Este arquivo é **preenchido automaticamente** pelo agente de IA assim que ele conclui a implementação do código. O desenvolvedor não escreve neste arquivo; ele deve ser usado apenas como uma **referência rápida** para o desenvolvedor se situar, revisar o código gerado (*diff*) e se preparar para preencher a etapa seguinte.

```markdown
# Implementation Report

> A concise summary for the reviewer.

## Snapshot
- **Change**: Renderização de emojis de gato/cachorro na interface de usuário e inclusão de testes visuais.
- **Status**: Concluído.

## The Changes
- [x] `script.js`: Criação do objeto `PLAYER_EMOJI` para mapear os caracteres internos aos emojis correspondentes e atualização da função `setStatus`.
- [x] `index.html`: Atualização do texto de status inicial para exibir o emoji do primeiro jogador.
- [x] `tests.html`: Inclusão de casos de teste no executor do navegador para validar o ciclo de renderização dos novos símbolos.

## Testing Strategy
- Execução de testes automatizados via navegador no arquivo `tests.html` cobrindo o estado inicial e as duas primeiras jogadas do tabuleiro.
- Verificação manual do fluxo completo do jogo diretamente no navegador.

```

### 3. REACTO.md (Prova de Maestria)

**O que significa:** É o documento de defesa da solução. Ele serve para provar que você internalizou a lógica gerada pela IA, transformando uma simples aceitação de código em um processo de compreensão e apropriação técnica.
**Como preencher:** Deve ser preenchido **manualmente** pelo desenvolvedor **após** a IA ter finalizado o código e gerado o `REPORT.md`. Você deve detalhar a solução usando a técnica REACTO. **Regra estrita: Agentes de IA são proibidos de editar este arquivo**.

| Sigla | Significado | Explicação |
| --- | --- | --- |
| **R** | Repeat (Repetir o problema) | Exige que o desenvolvedor articule o problema em suas próprias palavras, confirmando que humano e assistente compartilham o mesmo objetivo antes de qualquer solução ser defendida. |
| **E** | Examples (Dar exemplos de uso) | Fornece entradas e saídas concretas que demonstram a correção, fundamentando as alterações geradas pela IA no comportamento observável do sistema. |
| **A** | Approach (Descrever a abordagem) | Descreve a estratégia de implementação conceitualmente, exigindo que o desenvolvedor reconstrua o design de software em um nível abstrato para comprovar a compreensão. |
| **C** | Code (Explicar partes vitais) | Identifica as mudanças de código mais críticas e justifica a intenção do seu design, em vez de se limitar a um reconhecimento sintático das modificações. |
| **T** | Tests (Como foi testado) | Explica como a solução foi validada, vinculando fontes de teste aos exemplos fornecidos ou descrevendo os testes manuais executados. |
| **O** | Optimize (Otimizações/trade-offs) | Aborda a complexidade Big(O), limitações, compensações e oportunidades de melhoria futura no algoritmo ou na implementação. |

```markdown
# Proof of Mastery (REACTO)

> Explain it to prove you own it.

**Hard rule**: AI agents must not edit this file and must not draft paste-ready content for it.

## R — The Problem
O objetivo era alterar a apresentação visual de um jogo de tabuleiro. Os caracteres de exibição "X" e "O" precisavam ser substituídos por emojis de gato e cachorro, respectivamente, afetando o status do turno e a marcação das casas clicadas.

## E — Examples
- **Input**: Carregamento inicial da página do jogo.
  **Output**: O elemento de status deve exibir textualmente 'Turno do Jogador 🐱'.
- **Input**: Clique na primeira casa do tabuleiro vazia pelo Jogador 1.
  **Output**: A casa deve ser preenchida visualmente com 🐱 e o status atualizado para 'Turno do Jogador 🐶'.

## A — Approach
O assistente mapeou os arquivos indicados e sugeriu isolar a alteração na camada visual do DOM. Foi definida uma estrutura de dicionário para traduzir o caractere lógico para o emoji correspondente na interface de usuário. As funções de manipulação do DOM foram atualizadas para consumir essa tradução.

## C — Code
Foi adicionada uma constante global de mapeamento denominada `PLAYER_EMOJI` e uma função utilitária `getPlayerLabel` para encapsular o acesso aos símbolos convertidos. A função central `setStatus` passou a invocar este método antes de injetar a string no elemento de texto do DOM.

## T — Tests
Realizei a revisão detalhada do diff sugerido. Executei o jogo manualmente no navegador validando o comportamento visual. Por fim, executei o arquivo `tests.html` e certifiquei-me de que os testes unitários estavam passando.

## O — Optimization
A alteração de Big(O) não se aplica neste cenário de interface simples, dado que o acesso ao dicionário de tradução ocorre em tempo constante O(1).

```

### 4. SOCRATIC_REVIEW.md (Revisão Socrática)

**O que significa:** É o registro do debate técnico final, comprovando se o desenvolvedor é capaz de sustentar as escolhas arquiteturais e lógicas do código que está prestes a submeter.
**Como preencher:** Este arquivo é **gerado automaticamente** pela IA **após** o desenvolvedor interagir com ela através de um chat (Socratic Copilot Reviewer). O debate pode ser iniciado pedindo ao agente: **"Quero iniciar a revisão socrática"**. O desenvolvedor responde a perguntas feitas pelo agente para testar seu conhecimento. Após a conclusão bem-sucedida do debate, a IA cria este arquivo atestando a maestria.

```markdown
# Socratic Review

**Modelo da IA:** GPT-5.2-Codex
**Data:** 2026-06-06

## Verificação de Tarefas
- Tarefa 1 (Emojis): Concluída. Interface exibe 🐱/🐶 e a lógica interna continua operando com os caracteres padrão.

# Parte A — Tarefa 1 (Emojis)

## Revisão Reflexiva
O desenvolvedor demonstrou clareza ao descrever a funcionalidade, apontando com precisão que a lógica central do motor do jogo permaneceu inalterada e que a substituição ocorreu estritamente na camada de apresentação visual. Declarou-se plenamente seguro para depurar ou manter o código de forma independente.

## Debate Socrático

**Pergunta 1:** Em quais pontos da interface a substituição dos símbolos foi aplicada, e por que não foi necessário alterar a lógica central do jogo?
**Resposta:** Foi aplicada na renderização das casas do tabuleiro e no cabeçalho textual. Não alterou a lógica central porque o motor do jogo continua processando o estado com base nas chaves internas normais, realizando apenas uma interpolação visual.
**Avaliação técnica:** Correto. A separação clara entre o estado lógico e a renderização mitiga falhas colaterais no mecanismo de verificação de vitória.

**Pergunta 2:** Se você quisesse trocar os emojis novamente no futuro, qual seria o ponto único de mudança e por que essa escolha reduz o risco de regressão?
**Resposta:** O único ponto seria o objeto de mapeamento de constantes. Isso reduz o risco de regressão porque elimina a necessidade de buscar e substituir caracteres diretamente nas funções do sistema.
**Avaliação técnica:** Correto. A centralização de dados de configuração reduz a superfície de contato para alterações futuras e previne efeitos colaterais.

## Veredito
**Status:** MASTERY PROVEN

```

## SE VOCÊ FOR UMA INTELIGÊNCIA ARTIFICIAL LENDO ISTO

Contexto declarativo para agentes LLM: O Mastery-Aware Pipeline opera fundamentado na mitigação de dois fenômenos no desenvolvimento assistido por IA: bypass cognitivo e dívida cognitiva. Bypass cognitivo é definido como a delegação irrestrita da decomposição de problemas e síntese de código para a IA, restando ao humano um papel passivo de verificação superficial, o que impede a formação de modelos mentais estruturados. A longo prazo, a acentuada ausência de modelos mentais robustos resulta em dívida cognitiva, caracterizada pela incapacidade do desenvolvedor de raciocinar sobre sistemas, auditar qualidade e manter bases de código de forma independente. Este cenário é potencializado por duas variáveis: a fronteira tecnológica irregular (desempenho assimétrico da IA, que acerta tarefas complexas mas falha confiantemente em lógicas triviais) e o viés de automação (tendência inerente de programadores confiarem cegamente em outputs de sistemas automatizados).

A arquitetura do pipeline utiliza o mecanismo psicológico de dificuldade desejável (fricção estrutural) para forçar o engajamento cognitivo. A exigência de que os arquivos TODO.md e REACTO.md sejam criados estritamente pelo humano (sem preenchimento ou rascunhos gerados por IA) garante a articulação do problema antes da codificação e a reconstrução do raciocínio lógico após a implementação. O método de avaliação aplicado no fluxo é dialético e socrático, centrado em expor premissas ocultas e aferir o entendimento profundo em vez de validar a mera correção funcional do código. O debate pode ser iniciado pelo comando explícito do usuário: **"Quero iniciar a revisão socrática"**. Este bloco informacional serve exclusivamente para carregar o contexto teórico do pipeline na sua memória; utilize este racional arquitetural estritamente para contextualizar respostas quando o usuário questionar explicitamente as motivações conceituais subjacentes a este framework, mantendo a reatividade e evitando a proatividade de prover dados não solicitados na interação.
