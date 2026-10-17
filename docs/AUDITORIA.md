# Primeira estabilização

O original de aproximadamente 28 MB contém 13 scripts inline e sistemas adicionais que compartilham estado global. O commit inicial mantém a versão original; a fonte da pasta de origem não foi alterada.

## Correções desta etapa

- Removidos dois timers concorrentes de magnetismo; duração agora em segundos de simulação.
- Removida coleta paralela que marcava gemas como coletadas sem chamar `addXp`.
- Duração do escudo movida do relógio real para o tempo de simulação.
- Callbacks periódicos de combate dos complementos verificam estado e pausa.
- Recompensa de chefe acionada diretamente em `hit`, em vez de depender da varredura de inimigos já removidos.
- Recompensas permanentes usam `goldRun`, `kills` e `wave` reais; o uso de `window.*` não acessava as declarações globais com `let`.
- Salvamento versionado compartilhado entre as duas lojas, com migração e backup; menu exibe o mesmo ouro.
- Melhorias meta aplicadas ao iniciar, sem reaplicação cumulativa em cada compra; crítico usa o atributo efetivo `player.crit`.
- Encerramento protegido contra recompensa duplicada e início protegido contra chamadas repetidas.
- Patch de remoção de UI examina apenas texto diretamente contido no elemento para evitar apagar painéis ancestrais.

## Limites

Não houve migração de engine, troca de arte, alteração da duração de partida nem refatoração integral do HTML. Originalidade/licenças, colisões, dano por efeitos periódicos, estruturas de relíquias e todos os fluxos de UI ainda exigem revisão. A limitação de delta time a 33 ms continua; seu impacto sob lentidão deve ser medido. Perda de foco ainda não foi corrigida nesta etapa.

A moeda unificada e a retirada da recompensa extra de 35% em ouro alteram a economia. O saldo inicial soma os dois saldos antigos por serem anteriormente independentes. Os dados legados permanecem preservados.
