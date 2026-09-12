# Studio-Tatto-App

## Leitura de notas para o estoque

Na tela **Estoque**, toque em **Escanear nota fiscal**, fotografe a nota ou escolha uma imagem da galeria e informe uma [chave gratuita da OCR.space](https://ocr.space/ocrapi/freekey). A chave é usada somente na leitura atual e não fica salva. O aplicativo reduz a foto para o limite do plano gratuito e envia a imagem à OCR.space. Revise ou adicione os materiais, quantidades, unidades e valores; informe um identificador da nota e confirme a entrada.

As entradas são salvas no dispositivo com AsyncStorage e a mesma identificação de nota não pode ser importada duas vezes. O estoque inicial desta branch ainda usa dados demonstrativos, portanto suas quantidades não representam um estoque real. Quando um material demonstrativo recebe uma entrada, a previsão de reposição deixa de ser exibida até existir cálculo baseado em consumo real.

A OCR.space devolve texto, não itens fiscais estruturados. O parser apenas sugere linhas coerentes e a conferência humana é obrigatória. Para produção, uma API própria deve manter a chave fora do aplicativo, controlar usuários e notas, persistir o estoque compartilhado e validar os itens no servidor. Veja [limites e documentação da API](https://ocr.space/ocrapi).

Execute `npm run test:ocr` para verificar os exemplos de extração.
