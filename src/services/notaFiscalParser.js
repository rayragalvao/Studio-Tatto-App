const UNIDADES = 'UN|UND|UNID|PC|PCT|CX|KG|G|L|ML|M';

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
  const nome = descricao.replace(/\s+/g, ' ').replace(/^\d{1,14}\s+/, '').trim();
  if (!nome || nome.length < 3 || !Number.isFinite(quantidade) || quantidade <= 0 ||
      !Number.isFinite(valorUnitario) || valorUnitario < 0 || !Number.isFinite(total)) return null;
  // Sugere só linhas cujos números são coerentes; toda sugestão ainda exige revisão.
  if (Math.abs(quantidade * valorUnitario - total) > Math.max(0.06, total * 0.02)) return null;
  return { id: `${Date.now()}-${Math.random()}`, material: nome, unidade: unidade.toLowerCase(), quantidade: String(quantidade), valorUnitario: valorUnitario.toFixed(2).replace('.', ',') };
}

export function extrairItensNota(texto) {
  const itens = [];
  const tabela = new RegExp(`^(?:\\d{1,14}\\s+)?(.+?)\\s+(?:\\d{8}\\s+)?(?:\\d{2,3}\\s+)?(?:[56]\\d{3}\\s+)?(${UNIDADES})\\s+([\\d.,]+)\\s+([\\d.,]+)\\s+([\\d.,]+)(?:\\s|$)`, 'i');
  const cupom = new RegExp(`^(.+?)\\s+([\\d.,]+)\\s*(${UNIDADES})\\s+[xX]\\s*([\\d.,]+)\\s+([\\d.,]+)$`, 'i');
  for (const linha of texto.split(/\r?\n/)) {
    const normalizada = linha.trim().replace(/\s+/g, ' ');
    const matchTabela = normalizada.match(tabela);
    const matchCupom = normalizada.match(cupom);
    let item = null;
    if (matchTabela) item = criarItem(matchTabela[1], matchTabela[2], matchTabela[3], matchTabela[4], matchTabela[5]);
    else if (matchCupom) item = criarItem(matchCupom[1], matchCupom[3], matchCupom[2], matchCupom[4], matchCupom[5]);
    if (item) itens.push(item);
  }
  return itens;
}
