# Rick and Morty — Catálogo de Personagens

Projeto de front-end desenvolvido como atividade acadêmica, utilizando HTML5, CSS3 e JavaScript. O catálogo é inspirado na série *Rick and Morty* e apresenta personagens da animação em cards com imagens e informações, além de conteúdo em vídeo.

O projeto foi desenvolvido com o objetivo de praticar os conceitos de desenvolvimento web, incluindo estruturação semântica, estilização, organização de layouts, responsividade e interatividade com JavaScript.

## Estrutura do projeto

```text
projeto-integrador-frontend-catalogo-rickandmory/
│
├── assets/
│   ├── images/          → Imagens utilizadas no projeto
│   └── videos/          → Vídeos utilizados na página
│
├── css/
│   └── style.css        → Estilização principal
│
├── index.html           → Estrutura e conteúdo da página
├── main.js              → Funcionalidades e interações com JavaScript
├── style.css            → Arquivo de estilos adicional
└── README.md            → Documentação do projeto
```

## Funcionalidades

- Cabeçalho com título e menu de navegação;
- Menu com opções de navegação e submenu;
- Menu responsivo para dispositivos menores;
- Apresentação dos personagens em cards com imagens e informações;
- Pesquisa de personagens pelo nome;
- Filtro de personagens por espécie;
- Contagem dos personagens encontrados;
- Adição de um novo personagem ao catálogo;
- Sistema de favoritos, permitindo marcar e desmarcar personagens;
- Resumo do catálogo com quantidade total de personagens, espécies e status;
- Reprodução de vídeo de apresentação;
- Formulário para avaliação do catálogo;
- Demonstrações práticas de conceitos de JavaScript, como Event Loop, `innerHTML` e `textContent`.

## Desenvolvimento e conteúdos aplicados

### HTML5

- Estruturação semântica da página;
- Utilização de elementos como `header`, `nav`, `main`, `section`, `article` e `footer`;
- Organização de formulários, imagens e vídeos;
- Utilização de atributos para identificação e acessibilidade dos elementos.

### CSS3

- Definição de variáveis de cores e estilos;
- Reset básico e aplicação do modelo de caixa (`box-sizing`);
- Utilização de seletores, pseudo-classes e efeitos visuais;
- Organização dos elementos com Flexbox;
- Criação de layouts com CSS Grid;
- Menu de navegação com posicionamento sticky;
- Responsividade por meio de media queries;
- Estilização de cards, tabelas, formulários e botões.

### JavaScript

- Declaração de variáveis, funções e estruturas condicionais;
- Utilização de arrays e métodos como `map`, `filter`, `find` e `reduce`;
- Manipulação do DOM para criar e atualizar elementos da página;
- Utilização de eventos para interações com botões, campos de pesquisa e filtros;
- Implementação de favoritos e adição dinâmica de personagens;
- Utilização de `template` e `DocumentFragment` para criação de novos cards;
- Uso de `dataset` para acessar informações dos personagens;
- Demonstração da ordem de execução do Event Loop, envolvendo código síncrono, Promises e `setTimeout`;
- Comparação entre `innerHTML` e `textContent`.

## Como usar

Baixe os arquivos ou clone este repositório:

```bash
git clone https://github.com/benevidesmarquim0981-collab/projeto-integrador-frontend-catalogo-rickandmory.git
```

Entre na pasta do projeto e abra o arquivo `index.html` em um navegador, como Google Chrome, Microsoft Edge ou Mozilla Firefox.

A página pode ser executada localmente, sem necessidade de instalação de dependências.

## Tecnologias utilizadas

- **HTML5** — estrutura e organização semântica da página;
- **CSS3** — estilização, Flexbox, Grid e responsividade;
- **JavaScript** — funcionalidades, manipulação do DOM e interatividade;
- **Git** — controle de versão;
- **GitHub** — armazenamento e compartilhamento do projeto.

## Possíveis melhorias futuras

- Integração com a API de Rick and Morty para carregar personagens automaticamente;
- Ampliação dos filtros, incluindo gênero e status;
- Criação de uma página individual com mais detalhes de cada personagem;
- Melhorias na organização e apresentação das informações do catálogo.

## Autor

Desenvolvido por Matheus Benevides para fins acadêmicos, como prática de desenvolvimento front-end.

Projeto inspirado na série *Rick and Morty*, criado sem finalidade comercial.




# Avaliador Ruan Henrique 27/08

1 — Git/GitHub | Repositório, `.gitignore`, commits | Atendido |
2 — Conceitos Web | Lista, tabela, link externo, imagem | Atendido |
3 — Semântica/Formulário | Header/main/footer, sections, formulário acessível | Atendido |
4 — Multimídia | Vídeo com fallback, poster e preload justificado | Atendido |

O projeto cumpre os requisitos técnicos das quatro aulas, com estrutura HTML5 
semântica, formulário validado e acessível, e seção de vídeo corretamente 
implementada com múltiplos formatos de fallback.

# CODE REVIEW PEDRO LUCAS DE ALMEIDA NASCIMENTO 12/11

O projeto está muito bom e demonstra um excelente esforço na aplicação dos conhecimentos de JavaScript e CSS3. É possível perceber uma preocupação com a organização do código, a utilização de funções, arrays, eventos, manipulação do DOM e recursos de acessibilidade. Também merece destaque a implementação de funcionalidades como filtros, sistema de favoritos, avaliações, cálculo de médias e atualização dinâmica das informações.

A estilização também está bem trabalhada, com utilização de variáveis CSS, Flexbox, Grid, responsividade, efeitos visuais e organização dos componentes da página.

Entretanto, alguns pontos precisam de atenção. No JavaScript, a função de adicionar personagens pode apresentar problemas caso a lista esteja vazia, pois tenta inserir o novo card após o último personagem existente. Também seria interessante melhorar o tratamento de algumas informações do formulário e garantir que os dados das avaliações e dos favoritos não sejam perdidos ao atualizar a página.

No CSS, alguns elementos precisam de ajustes, como o posicionamento do botão de favoritos, que utiliza position: absolute, mas não há uma definição de posicionamento relativo no card. Além disso, existem comentários e trechos de estilos que poderiam ser melhor organizados para facilitar a manutenção do código.
