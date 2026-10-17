# Almas do Eclipse

Roguelite de sobrevivência em fantasia sombria, atualmente em estabilização para Windows.

Fonte original recebida de `F:\CODEX PROJETOS\JOGO ESTILO VAMPIRES\Vampire_Survivors_Jogo.html`.
A cópia original permanece naquela pasta e no primeiro commit da branch `main`.
As correções são feitas nesta pasta de trabalho, na branch `teste`.

## Executar

Com Node.js instalado: `npm test` e `npm run build`.
Sirva a pasta `dist` com um servidor HTTP local, por exemplo `python -m http.server 8080 --directory dist`, e abra `http://localhost:8080`.
Não publique a raiz do repositório; distribua apenas `dist`.

## Fluxo de publicação

1. Commit e envio à branch `teste`.
2. GitHub Actions executa verificações e gera um pacote de teste.
3. Publicar esse commit no ambiente de teste e registrar o endereço.
4. O usuário testa e confirma explicitamente a promoção daquele commit.
5. Só então preparar PR para `main` e publicar a mesma versão aprovada.

Repositório, nome definitivo e hospedagem ainda precisam ser definidos com o usuário.
O workflow atual gera um artefato; não configura hospedagem nem deploy de produção.
Proteções de branches e aprovadores de ambiente precisarão ser configurados no GitHub quando o repositório for escolhido.
Os ambientes de teste e produção devem usar origens diferentes para isolar o localStorage.
O save antigo só pode ser migrado no mesmo navegador/origem em que foi criado; mudar de arquivo local para hospedagem não transfere os dados automaticamente.

## Salvamento

Um save versionado substitui as gravações separadas. Na primeira abertura, os saldos independentes de `vs10` e `metaProgression` são somados uma única vez e suas melhorias preservadas. As chaves antigas permanecem intactas. A gravação mantém o save anterior como backup. A unificação altera a economia: ambas as lojas passam a compartilhar o saldo e o ouro da partida é pago uma única vez.
Melhorias da loja meta são aplicadas no início da próxima partida, evitando reaplicar cumulativamente todas as melhorias a cada compra.
