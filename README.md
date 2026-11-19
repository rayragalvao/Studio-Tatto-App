# Studio-Tatto-App

## Leitura de notas para o estoque

Na tela **Estoque**, toque em **Escanear nota fiscal**, fotografe a nota ou escolha uma imagem da galeria e informe uma [chave gratuita da OCR.space](https://ocr.space/ocrapi/freekey). A chave é usada somente na leitura atual e não fica salva. O aplicativo reduz a foto para o limite do plano gratuito e envia a imagem à OCR.space. Revise ou adicione os materiais, quantidades, unidades e valores; informe um identificador da nota e confirme a entrada.

As entradas são salvas no dispositivo com AsyncStorage e a mesma identificação de nota não pode ser importada duas vezes. O estoque inicial contém os 20 materiais e quantidades informados pelo estúdio. Cada item da nota precisa ser vinculado a um desses materiais; itens sem correspondência devem ser removidos da importação. A quantidade é somada ao material cadastrado, e o mínimo de aviso é aplicado quando definido. Unidades equivalentes (como `UN`/`unidades`) são aceitas e há conversão de litros/mililitros e quilos/gramas. Para `CX` e `PCT`, informe o conteúdo de cada embalagem na unidade do estoque: **1 CX × 50 máscaras** soma 50 unidades, mas **1 CX × R$ 14** continua totalizando R$ 14. O aplicativo não presume o conteúdo da caixa.

A OCR.space devolve texto, não itens fiscais estruturados. O parser apenas sugere linhas coerentes e a conferência humana é obrigatória. Para produção, uma API própria deve manter a chave fora do aplicativo, controlar usuários e notas, persistir o estoque compartilhado e validar os itens no servidor. Veja [limites e documentação da API](https://ocr.space/ocrapi).

Em DANFEs com letras pequenas, fotografe a tabela **Dados do produto/serviço** de perto. Se o texto extraído não contiver todos os produtos, use **Refazer foto da tabela**; o parser não consegue recuperar linhas que o OCR não reconheceu. As siglas fiscais `Rl`, `Par` e `Cx` são lidas como itens.

Se uma nota foi importada com quantidade ou preço incorretos, abra **Notas importadas**, remova a nota e escaneie-a novamente. A remoção desfaz somente as entradas daquela nota.

Execute `npm run test:ocr` para verificar os exemplos de extração.
