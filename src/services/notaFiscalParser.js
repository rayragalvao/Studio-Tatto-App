// Siglas encontradas em DANFEs e cupons; não indicam conversão automática para o estoque.
const UNIDADES = 'UNIDADES|UNID|UND|UN|PCT|PAC|PC|CX|CAIXA|ROLOS|ROLO|RL|PARES|PAR|KG|ML|G|L|M';
const NUMERO = '[\\d.,]+';

export function interpretarNumero(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : NaN;
  const texto = String(valor ?? '').replace(/\s/g, '').replace(/^R\$/i, '');
  if (!/^\d[\d.,]*$/.test(texto)) return NaN;
  const ultimaVirgula = texto.lastIndexOf(',');
  const ultimoPonto = texto.lastIndexOf('.');
  const separadorDecimal = Math.max(ultimaVirgula, ultimoPonto);
  if (separadorDecimal < 0) return Number(texto);
  const parteDecimal = texto.length - separadorDecimal - 1;
  if (parteDecimal === 3 && ultimaVirgula < 0 && (texto.match(/\./g) || []).length === 1) {
    return Number(texto.replace('.', ''));
  }
  return Number(texto.slice(0, separadorDecimal).replace(/[.,]/g, '') + '.' + texto.slice(separadorDecimal + 1));
}

function criarItem(descricao, unidade, quantidadeTexto, precoTexto, totalTexto) {
  const quantidade = interpretarNumero(quantidadeTexto);
  const valorUnitario = interpretarNumero(precoTexto);
  const total = interpretarNumero(totalTexto);
  const nome = descricao.replace(/\s+/g, ' ').trim()
    .replace(/\s+(?:\d{8}\s+)?(?:\d{2,4}\s+)?[56]\d{3}$/, '')
    .replace(/^\d{3,14}\s+/, '').trim();
  if (!nome || nome.length < 3 || !Number.isFinite(quantidade) || quantidade <= 0 ||
      !Number.isFinite(valorUnitario) || valorUnitario < 0 || !Number.isFinite(total)) return null;
  // Sugere só linhas cujos números são coerentes; toda sugestão ainda exige revisão.
  if (Math.abs(quantidade * valorUnitario - total) > Math.max(0.06, total * 0.02)) return null;
  return { id: `${Date.now()}-${Math.random()}`, material: nome, unidade: unidade.toLowerCase(), quantidade: String(quantidade), valorUnitario: valorUnitario.toFixed(2).replace('.', ',') };
}

export function extrairItensNota(texto) {
  const itens = [];
  const tabela = new RegExp(`\\b(${UNIDADES})\\s+(${NUMERO})\\s+(${NUMERO})\\s+(${NUMERO})(?=\\s|$)`, 'ig');
  const cupom = new RegExp(`^(.+?)\\s+(${NUMERO})\\s*(${UNIDADES})\\s+[xX]\\s*(${NUMERO})\\s+(${NUMERO})$`, 'i');
  const linhas = texto.split(/\r?\n/).map((linha) => linha.replace(/[|¦]/g, ' ').trim().replace(/\s+/g, ' ')).filter(Boolean);

  function tentarExtrair(linha) {
    tabela.lastIndex = 0;
    let matchTabela;
    while ((matchTabela = tabela.exec(linha)) !== null) {
      const item = criarItem(linha.slice(0, matchTabela.index), matchTabela[1], matchTabela[2], matchTabela[3], matchTabela[4]);
      if (item) return item;
    }
    const matchCupom = linha.match(cupom);
    return matchCupom ? criarItem(matchCupom[1], matchCupom[3], matchCupom[2], matchCupom[4], matchCupom[5]) : null;
  }

  for (let indice = 0; indice < linhas.length; indice += 1) {
    let item = tentarExtrair(linhas[indice]);
    if (item) {
      itens.push(item);
      continue;
    }
    // Algumas descrições ocupam duas linhas; só une quando a primeira começa com código de produto.
    if (/^\d{3,14}\s/.test(linhas[indice])) {
      for (let alcance = 2; alcance <= 3 && indice + alcance <= linhas.length; alcance += 1) {
        item = tentarExtrair(linhas.slice(indice, indice + alcance).join(' '));
        if (item) {
          itens.push(item);
          indice += alcance - 1;
          break;
        }
      }
    }
  }
  return itens;
}
