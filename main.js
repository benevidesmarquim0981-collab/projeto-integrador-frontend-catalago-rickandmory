/* ============================================================
   js/main.js — Catálogo de Personagens (Rick and Morty)
   Aula 09: lógica (variáveis, tipos, condicionais, laços)
   Aula 11: funções, arrays com callbacks e DOM básico
   Aula 12: eventos, delegação, acessibilidade e organização

   Carregado com "defer" no <head>: quando este arquivo roda,
   o HTML já foi lido e os elementos existem.
   ============================================================ */
'use strict';

/* ============================================================
   CONFIGURAÇÃO E DADOS
   ============================================================ */

// const: valores que nunca mudam (Aula 9)
const NOTA_MINIMA = 1;
const NOTA_MAXIMA = 5;
const LIMITE_DE_VOLTAS = 1000; // trava de segurança contra laço infinito

// Tabela de consulta: faixa de classificação -> classe CSS (Aula 11)
const CLASSES_DA_FAIXA = {
  'Excelente': 'faixa-excelente',
  'Muito bom': 'faixa-muito-bom',
  'Regular': 'faixa-regular',
  'Fraco': 'faixa-fraco',
  'Sem avaliações': 'faixa-sem-nota',
};

// Personagens extras, adicionados um a um pelo botão "Adicionar personagem".
// Dados de exemplo para demonstrar elementos criados pelo JavaScript.
const novosPersonagens = [
  { id: 'squanchy', nome: 'Squanchy', especie: 'Alienígena', status: 'Vivo', origem: 'Desconhecida' },
  { id: 'evil-morty', nome: 'Evil Morty', especie: 'Humano', status: 'Vivo', origem: 'Desconhecida' },
  { id: 'mr-meeseeks', nome: 'Mr. Meeseeks', especie: 'Alienígena', status: 'Vivo', origem: 'Desconhecida' },
];

/* ============================================================
   ESTADO: a fonte de verdade (Aula 12, seção 9)
   A tela é só um desenho dos dados abaixo. Quem muda os dados
   chama uma função que redesenha a parte afetada.
   ============================================================ */

// Elementos fixos da página
const listaPersonagens = document.querySelector('#lista-personagens');
const menuPrincipal = document.querySelector('#menu-principal');
const botaoMenu = document.querySelector('.menu-hamburguer');
const campoBusca = document.querySelector('#campo-busca');
const filtroEspecie = document.querySelector('#filtro-especie');
const filtroStatus = document.querySelector('#filtro-status');
const contadorExibidos = document.querySelector('#contador-exibidos');
const botaoAdicionar = document.querySelector('#btn-adicionar-personagem');
const formularioAvaliacao = document.querySelector('#form-avaliacao');

// Os dados dos personagens vêm do próprio HTML (atributos data-*)
const catalogo = Array.from(document.querySelectorAll('.personagem'), lerPersonagemDoCard);
const favoritos = new Set();   // ids dos favoritos (só na memória: some ao recarregar)
const avaliacoes = [];         // notas enviadas pelo formulário

// Elementos criados uma vez e preenchidos depois
const painelResumo = document.createElement('section');
const listaResumo = document.createElement('ul');
const mensagemFormulario = document.createElement('p');
const painelAvaliacoes = document.createElement('div');
const listaAvaliacoes = document.createElement('ul');

/* ============================================================
   PARTE 1 — FUNÇÕES PURAS (Aulas 9 e 11)
   Só calculam e decidem: não mexem na página e sempre usam return.
   ============================================================ */

// Valida e converte a nota. Todo valor digitado chega como TEXTO,
// por isso o Number() vem ANTES de qualquer conta (evita "4" + "5" = "45").
function converterNota(texto) {
  if (texto === null || String(texto).trim() === '') {
    return { valida: false, motivo: 'Informe uma nota.' };
  }
  const valor = Number(texto);
  if (Number.isNaN(valor)) {
    return { valida: false, motivo: 'A nota precisa ser um número.' };
  }
  if (valor < NOTA_MINIMA || valor > NOTA_MAXIMA) {
    return { valida: false, motivo: `A nota deve ficar entre ${NOTA_MINIMA} e ${NOTA_MAXIMA}.` };
  }
  return { valida: true, valor };
}

// Média de uma lista de notas (null se não há nenhuma)
function calcularMedia(notas) {
  if (notas.length === 0) return null;
  const soma = notas.reduce((total, nota) => total + nota, 0);
  return soma / notas.length;
}

// Faixas em ordem decrescente: a primeira condição verdadeira encerra a função
function classificarMedia(media) {
  if (media === null) return 'Sem avaliações';
  if (media >= 4.5) return 'Excelente';
  if (media >= 3.5) return 'Muito bom';
  if (media >= 2.5) return 'Regular';
  return 'Fraco';
}

// reduce: transforma o array em UM objeto com a contagem por propriedade
function contarPor(lista, propriedade) {
  return lista.reduce((acumulado, item) => {
    acumulado[item[propriedade]] = (acumulado[item[propriedade]] || 0) + 1;
    return acumulado;
  }, {});
}

// Média das notas recebidas por um personagem (filter + map + calcularMedia)
function mediaDoPersonagem(id) {
  const notas = avaliacoes
    .filter((avaliacao) => avaliacao.personagemId === id)
    .map((avaliacao) => avaliacao.nota);
  return calcularMedia(notas);
}

// reduce com acumulador: o personagem com a maior média (ou null)
function encontrarMelhorAvaliado() {
  return catalogo.reduce((melhor, personagem) => {
    const media = mediaDoPersonagem(personagem.id);
    if (media === null) return melhor;
    if (melhor === null || media > melhor.media) {
      return { nome: personagem.nome, media };
    }
    return melhor;
  }, null);
}

// Decide se um personagem passa nos filtros atuais da tela
function personagemPassaNoFiltro(personagem) {
  const termo = campoBusca ? campoBusca.value.trim().toLowerCase() : '';
  const especie = filtroEspecie ? filtroEspecie.value : '';
  const status = filtroStatus ? filtroStatus.value : '';

  const achouNome = personagem.nome.toLowerCase().includes(termo);
  const achouEspecie = especie === '' || personagem.especie === especie;
  const achouStatus = status === '' || personagem.status === status;
  return achouNome && achouEspecie && achouStatus;
}

/* ============================================================
   PARTE 2 — LÓGICA NO CONSOLE (Aula 09)
   Roda ao carregar a página e escreve no Console (F12).
   ============================================================ */

function analisarCatalogoNoConsole(lista) {
  /* PSEUDOCÓDIGO
     1. contar quantos personagens estão vivos e mortos
     2. listar os alienígenas, pulando os humanos
     3. achar o primeiro personagem morto, com trava de segurança

     TESTE DE MESA (contagem de vivos, 3 primeiras voltas):
       volta 0: Rick   -> Vivo -> vivos = 1
       volta 1: Morty  -> Vivo -> vivos = 2
       volta 2: Summer -> Vivo -> vivos = 3 */
  console.group('Análise do catálogo (Aula 9)');

  const total = lista.length;
  let vivos = 0;
  let mortos = 0;

  // for: o limite é "<" (e não "<="), para não passar do último item
  for (let i = 0; i < lista.length; i++) {
    // switch: cada case termina com break; o default pega o inesperado
    switch (lista[i].status) {
      case 'Vivo':
        vivos++;
        break;
      case 'Morto':
        mortos++;
        break;
      default:
        console.warn(`Status desconhecido: ${lista[i].status}`);
    }
  }

  // Operador ternário: decisão simples, evita divisão por zero
  const percentualVivos = total > 0 ? (vivos / total) * 100 : 0;
  console.log(`${total} personagens: ${vivos} vivos, ${mortos} mortos (${percentualVivos.toFixed(0)}% vivos)`);
  console.log('Tipos:', typeof total, lista.length > 0 ? typeof lista[0].nome : 'sem dados', typeof (vivos > 0));

  // for...of com continue: pula os humanos e acumula só os alienígenas
  const alienigenas = [];
  for (const personagem of lista) {
    if (personagem.especie !== 'Alienígena') continue;
    alienigenas.push(personagem.nome);
  }
  console.log('Alienígenas:', alienigenas.join(', '));

  // while: a condição é atualizada em toda volta + trava contra laço infinito
  let posicao = 0;
  let voltas = 0;
  while (posicao < lista.length && lista[posicao].status !== 'Morto') {
    posicao++;
    voltas++;
    if (voltas > LIMITE_DE_VOLTAS) {
      console.error('Trava de segurança acionada.');
      break;
    }
  }
  console.log(posicao < lista.length
    ? `Primeiro morto: ${lista[posicao].nome} (posição ${posicao})`
    : 'Nenhum personagem morto.');

  // do...while: executa ao menos uma vez, mesmo com a lista vazia
  let indice = 0;
  do {
    console.log(`Rodada ${indice + 1}: ${lista[indice] ? lista[indice].nome : '(lista vazia)'}`);
    indice++;
  } while (indice < Math.min(3, lista.length));

  console.table(lista);
  console.groupEnd();

  /* ERROS COMUNS (Aula 9) — todos evitados neste arquivo:
     1. if (nota = 5)      -> "=" atribui; o certo é "===" para comparar
     2. "4" + "5"          -> prompt/campos devolvem texto; converta com Number()
     3. while (true) sem saída -> sempre atualize a condição e use trava
     4. i <= lista.length  -> passa do fim; use i < lista.length
     5. switch sem break   -> a execução "cai" nos cases seguintes */
}

// Treino de entrada com prompt (chame no Console: perguntarNotaPeloPrompt())
function perguntarNotaPeloPrompt() {
  const resposta = prompt(`Que nota (${NOTA_MINIMA} a ${NOTA_MAXIMA}) você dá ao catálogo?`);
  const resultado = converterNota(resposta);   // trata Cancelar (null), vazio, texto e faixa
  if (resultado.valida) {
    console.log(`Nota registrada: ${resultado.valor}`);
  } else {
    console.warn(resultado.motivo);
  }
  return resultado;
}

/* ============================================================
   PARTE 3 — DOM: LER, CRIAR E DESENHAR (Aula 11)
   ============================================================ */

// dataset devolve sempre texto: aqui os dados do card viram um objeto
function lerPersonagemDoCard(card) {
  return {
    id: card.dataset.id,
    nome: card.dataset.nome,
    especie: card.dataset.especie,
    status: card.dataset.status,
    origem: card.dataset.origem,
  };
}

// Escreve a nota média dentro do card e marca a faixa com uma classe
function exibirPontuacao(card) {
  const id = card.dataset.id;
  const media = mediaDoPersonagem(id);
  const faixa = classificarMedia(media);
  const quantidade = avaliacoes.filter((avaliacao) => avaliacao.personagemId === id).length;

  let paragrafo = card.querySelector('.pontuacao');
  if (!paragrafo) {
    paragrafo = document.createElement('p');
    paragrafo.className = 'pontuacao';
    card.append(paragrafo);
  }
  // textContent: o texto nunca vira HTML (seguro)
  paragrafo.textContent = media === null
    ? 'Sem avaliações ainda'
    : `Nota dos fãs: ${media.toFixed(1)} · ${faixa} (${quantidade})`;

  card.classList.remove(...Object.values(CLASSES_DA_FAIXA));
  card.classList.add(CLASSES_DA_FAIXA[faixa]);
}

function atualizarTodasAsPontuacoes() {
  document.querySelectorAll('.personagem').forEach(exibirPontuacao);
}

// O botão guarda só a aparência (aria-pressed); o dado mora em "favoritos"
function adicionarBotaoFavorito(card) {
  if (card.querySelector('.botao-favoritar')) return;
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao-favoritar';
  botao.textContent = '\u2665';
  botao.setAttribute('aria-pressed', String(favoritos.has(card.dataset.id)));
  botao.setAttribute('aria-label', `Favoritar ${card.dataset.nome}`);
  card.append(botao);
}

function prepararCard(card) {
  exibirPontuacao(card);
  adicionarBotaoFavorito(card);
}

// Recebe um objeto e devolve um card pronto, ainda fora da página.
// Todo texto entra por textContent, nunca por innerHTML.
function criarCardPersonagem(personagem) {
  const card = document.createElement('article');
  card.className = 'personagem';
  card.dataset.id = personagem.id;
  card.dataset.nome = personagem.nome;
  card.dataset.especie = personagem.especie;
  card.dataset.status = personagem.status;
  card.dataset.origem = personagem.origem;

  const titulo = document.createElement('h3');
  titulo.textContent = personagem.nome;

  const linhas = [
    ['Espécie', personagem.especie],
    ['Status', personagem.status],
    ['Origem', personagem.origem],
  ].map(([rotulo, valor]) => {
    const paragrafo = document.createElement('p');
    const destaque = document.createElement('strong');
    destaque.textContent = `${rotulo}:`;
    paragrafo.append(destaque, ` ${valor}`);   // append aceita texto e elementos
    return paragrafo;
  });

  card.append(titulo, ...linhas);
  return card;
}

// Redesenha o painel "Resumo do catálogo" a partir dos dados
function atualizarResumo() {
  const contagemStatus = contarPor(catalogo, 'status');
  const porEspecie = Object.entries(contarPor(catalogo, 'especie'))
    .map(([especie, quantidade]) => `${quantidade} ${especie}`)
    .join(', ');
  const melhor = encontrarMelhorAvaliado();

  const linhas = [
    ['Personagens no catálogo', catalogo.length],
    ['Exibidos agora', catalogo.filter(personagemPassaNoFiltro).length],
    ['Por espécie', porEspecie],
    ['Vivos / Mortos', `${contagemStatus.Vivo || 0} / ${contagemStatus.Morto || 0}`],
    ['Favoritos', favoritos.size],
    ['Avaliações recebidas', avaliacoes.length],
    ['Melhor avaliado', melhor ? `${melhor.nome} (${melhor.media.toFixed(1)})` : 'Nenhum ainda'],
  ];

  // replaceChildren troca todos os itens de uma vez
  listaResumo.replaceChildren(...linhas.map(([rotulo, valor]) => {
    const item = document.createElement('li');
    item.textContent = `${rotulo}: ${valor}`;
    return item;
  }));
}

// A tabela "Resumo por status" do HTML também acompanha os dados
function atualizarTabelaStatus() {
  if (!listaPersonagens) return;
  const corpo = listaPersonagens.querySelector('table tbody');
  if (!corpo) return;

  const contagem = contarPor(catalogo, 'status');
  const linhas = ['Vivo', 'Morto'].map((status) => {
    const linha = document.createElement('tr');
    const celulaStatus = document.createElement('td');
    const celulaQuantidade = document.createElement('td');
    celulaStatus.textContent = status;
    celulaQuantidade.textContent = contagem[status] || 0;
    linha.append(celulaStatus, celulaQuantidade);
    return linha;
  });
  corpo.replaceChildren(...linhas);
}

function redesenharResumos() {
  atualizarResumo();
  atualizarTabelaStatus();
}

// Liga/desliga o atributo hidden de cada card (esconde, mas não destrói)
function filtrarCards() {
  if (!listaPersonagens) return;
  let exibidos = 0;
  for (const card of listaPersonagens.querySelectorAll('.personagem')) {
    const visivel = personagemPassaNoFiltro(lerPersonagemDoCard(card));
    card.hidden = !visivel;
    if (visivel) exibidos += 1;
  }
  if (contadorExibidos) {
    contadorExibidos.textContent =
      exibidos === 1 ? '1 personagem exibido' : `${exibidos} personagens exibidos`;
  }
  redesenharResumos();
}

// Garante que o select do formulário tenha todos os personagens do catálogo
function preencherSelectDoFormulario() {
  const select = document.querySelector('#personagem-favorito');
  if (!select) return;
  catalogo.forEach((personagem) => {
    const jaExiste = Array.from(select.options).some((opcao) => opcao.value === personagem.id);
    if (jaExiste) return;
    const opcao = document.createElement('option');
    opcao.value = personagem.id;
    opcao.textContent = personagem.nome;
    select.append(opcao);
  });
}

function mostrarMensagemDoFormulario(texto, ehErro) {
  mensagemFormulario.textContent = texto;
  mensagemFormulario.classList.toggle('erro', ehErro);
}

// Redesenha a lista "Avaliações recebidas": as mais recentes primeiro
function renderizarAvaliacoes() {
  if (avaliacoes.length === 0) {
    const vazio = document.createElement('li');
    vazio.textContent = 'Nenhuma avaliação ainda. Seja o primeiro!';
    listaAvaliacoes.replaceChildren(vazio);
    return;
  }

  // [...avaliacoes] copia o array: reverse() altera o original (Aula 11, erro 4)
  const recentes = [...avaliacoes].reverse().slice(0, 5);
  listaAvaliacoes.replaceChildren(...recentes.map((avaliacao) => {
    const personagem = catalogo.find((item) => item.id === avaliacao.personagemId);
    const item = document.createElement('li');
    const recomendacao = avaliacao.recomenda === 'sim' ? ' · recomenda a série'
      : avaliacao.recomenda === 'nao' ? ' · não recomenda' : '';
    item.textContent = `${avaliacao.autor} deu ${avaliacao.nota} para ${personagem ? personagem.nome : '?'}${recomendacao}`;
    if (avaliacao.comentario !== '') {
      const comentario = document.createElement('em');
      comentario.textContent = ` — "${avaliacao.comentario}"`;   // texto digitado: sempre textContent
      item.append(comentario);
    }
    return item;
  }));
}

/* ============================================================
   PARTE 4 — OUVINTES DE EVENTOS (Aula 12)
   Todos são funções NOMEADAS e entregues SEM parênteses:
   addEventListener('click', alternarMenu)   -> certo
   addEventListener('click', alternarMenu()) -> errado (executa na hora)
   ============================================================ */

// ----- Menu hambúrguer -----
function alternarMenu() {
  const aberto = menuPrincipal.classList.toggle('aberto');
  botaoMenu.setAttribute('aria-expanded', String(aberto));
  botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
}

function fecharMenuComEscape(evento) {
  if (evento.key === 'Escape' && menuPrincipal.classList.contains('aberto')) {
    alternarMenu();
    botaoMenu.focus();   // devolve o foco ao botão (acessibilidade)
  }
}

// Delegação no menu: um ouvinte só atende todos os links
function aoClicarNoMenu(evento) {
  const link = evento.target.closest('a');
  if (!link) return;

  menuPrincipal.querySelectorAll('a.ativo').forEach((item) => {
    item.classList.remove('ativo');
    item.removeAttribute('aria-current');
  });
  link.classList.add('ativo');
  link.setAttribute('aria-current', 'page');

  if (menuPrincipal.classList.contains('aberto')) alternarMenu();
}

// ----- Aviso do formulário -----
function fecharAlerta(evento) {
  const alerta = evento.currentTarget.closest('.alerta');
  if (alerta) alerta.remove();
}

// ----- Favoritos (delegação) -----
function alternarFavorito(botao) {
  const id = botao.closest('.personagem').dataset.id;
  const marcado = !favoritos.has(id);
  if (marcado) {
    favoritos.add(id);
  } else {
    favoritos.delete(id);
  }
  botao.setAttribute('aria-pressed', String(marcado));
  atualizarResumo();
}

// UM ouvinte na seção atende todos os botões, inclusive os dos cards
// criados depois. closest() acha o botão mesmo se o clique cair no ♥.
function aoClicarNaLista(evento) {
  const botao = evento.target.closest('.botao-favoritar');
  if (botao && listaPersonagens.contains(botao)) {
    alternarFavorito(botao);
  }
}

function adicionarProximoPersonagem() {
  const personagem = novosPersonagens.shift();   // tira o primeiro (ou undefined)
  if (!personagem) return;

  const card = criarCardPersonagem(personagem);
  prepararCard(card);

  const cards = listaPersonagens.querySelectorAll('.personagem');
  cards[cards.length - 1].after(card);
  catalogo.push(personagem);

  if (novosPersonagens.length === 0) botaoAdicionar.disabled = true;

  preencherSelectDoFormulario();
  filtrarCards();   // o novo card respeita o filtro ativo e o resumo se atualiza
}

// ----- Formulário de avaliação -----
function aoEnviarAvaliacao(evento) {
  evento.preventDefault();   // impede o recarregamento da página
  const formulario = evento.currentTarget;
  const dados = new FormData(formulario);

  const autor = String(dados.get('nome')).trim();
  const personagemId = String(dados.get('personagem-favorito'));
  const comentario = String(dados.get('comentario')).trim();
  const recomenda = dados.get('recomenda');   // "sim", "nao" ou null
  const nota = converterNota(dados.get('nota'));

  if (!nota.valida) {
    mostrarMensagemDoFormulario(nota.motivo, true);
    formulario.elements.nota.focus();
    return;
  }
  const personagem = catalogo.find((item) => item.id === personagemId);
  if (!personagem) {
    mostrarMensagemDoFormulario('Escolha um personagem.', true);
    return;
  }

  avaliacoes.push({ autor, personagemId, nota: nota.valor, recomenda, comentario });

  atualizarTodasAsPontuacoes();
  redesenharResumos();
  renderizarAvaliacoes();
  formulario.reset();
  mostrarMensagemDoFormulario(`Obrigado, ${autor}! Sua nota ${nota.valor} para ${personagem.nome} foi registrada.`, false);
}

// ----- Busca e filtros -----
// input: a cada letra digitada | change: quando uma opção é escolhida
function iniciarMenu() {
  if (!menuPrincipal || !botaoMenu) return;
  botaoMenu.addEventListener('click', alternarMenu);
  document.addEventListener('keydown', fecharMenuComEscape);
  menuPrincipal.addEventListener('click', aoClicarNoMenu);
}

function iniciarAlerta() {
  const botaoFechar = document.querySelector('#btn-fechar-alerta');
  if (botaoFechar) botaoFechar.addEventListener('click', fecharAlerta);
}

function iniciarResumo() {
  if (!listaPersonagens) return;
  painelResumo.className = 'resumo-catalogo';
  const titulo = document.createElement('h3');
  titulo.textContent = 'Resumo do catálogo';
  painelResumo.append(titulo, listaResumo);
  const tituloSecao = listaPersonagens.querySelector('h2');
  if (tituloSecao) tituloSecao.after(painelResumo);
}

function iniciarFavoritos() {
  if (!listaPersonagens) return;
  listaPersonagens.querySelectorAll('.personagem').forEach(prepararCard);
  listaPersonagens.addEventListener('click', aoClicarNaLista);
  if (botaoAdicionar) botaoAdicionar.addEventListener('click', adicionarProximoPersonagem);
}

function iniciarFiltro() {
  if (campoBusca) campoBusca.addEventListener('input', filtrarCards);
  if (filtroEspecie) filtroEspecie.addEventListener('change', filtrarCards);
  if (filtroStatus) filtroStatus.addEventListener('change', filtrarCards);
}

function iniciarFormulario() {
  if (!formularioAvaliacao) return;
  mensagemFormulario.className = 'mensagem-form';
  mensagemFormulario.setAttribute('role', 'status');
  mensagemFormulario.setAttribute('aria-live', 'polite');   // leitores de tela anunciam a mudança

  painelAvaliacoes.className = 'painel-avaliacoes';
  const titulo = document.createElement('h3');
  titulo.textContent = 'Avaliações recebidas';
  painelAvaliacoes.append(titulo, listaAvaliacoes);

  formularioAvaliacao.after(mensagemFormulario, painelAvaliacoes);
  preencherSelectDoFormulario();
  renderizarAvaliacoes();
  formularioAvaliacao.addEventListener('submit', aoEnviarAvaliacao);
}

/* ============================================================
   PARTE 5 — DEMONSTRAÇÕES PARA O CONSOLE (Aula 12)
   Não rodam sozinhas: chame pelo nome no Console (F12).
   ============================================================ */

// Event Loop: código síncrono -> microtarefas (promessas) -> tarefas (setTimeout)
// Saída esperada: 1, 2, 3, 4
function demonstrarOrdemDeExecucao() {
  console.log('1. código síncrono');
  setTimeout(() => console.log('4. setTimeout (tarefa)'), 0);
  Promise.resolve().then(() => console.log('3. promessa (microtarefa)'));
  console.log('2. fim do código síncrono');
}

// ERRADO, só para estudo: innerHTML transforma o texto em HTML (risco de XSS)
function criarCardInseguro(personagem) {
  const card = document.createElement('article');
  card.className = 'personagem';
  card.innerHTML = '<h3>' + personagem.nome + '</h3>';
  return card;
}

// Compara as duas versões com uma carga inofensiva (só escreve no Console)
function demonstrarXss() {
  const carga = '<img src=x onerror="console.log(\'XSS executado\')">';
  console.log('Versão insegura (innerHTML):');
  listaPersonagens.append(criarCardInseguro({ nome: carga }));          // imprime "XSS executado"
  console.log('Versão segura (textContent):');
  listaPersonagens.append(criarCardPersonagem({                         // não imprime nada
    id: 'teste-xss', nome: carga, especie: 'Humano', status: 'Vivo', origem: 'Teste',
  }));
  console.log('Recarregue a página para remover os cards de teste.');
}

/* ============================================================
   INICIALIZAÇÃO: os registros ficam reunidos aqui, e o arquivo
   se lê de cima para baixo (Aula 12, seção 11).
   ============================================================ */
analisarCatalogoNoConsole(catalogo);
iniciarMenu();
iniciarAlerta();
iniciarResumo();
iniciarFavoritos();
iniciarFiltro();
iniciarFormulario();
filtrarCards();   // primeiro desenho: contador, resumo e tabela já preenchidos