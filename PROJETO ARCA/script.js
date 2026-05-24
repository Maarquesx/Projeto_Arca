// ==========================================================================
// ESTADOS GLOBAIS DA APLICAÇÃO (MEMÓRIA)
// ==========================================================================
var perfilLogado = null; // Armazena o objeto do usuário autenticado no momento
var historico = [];      // Guarda a pilha de telas visitadas para o botão voltar

// Banco de Dados fictício de Usuários cadastrados no sistema do app
var usuarios = [
  { usuario: 'tutor', senha: '123456', perfil: 'Tutor', nome: 'João Tutor', email: 'tutor@arca.es', avatar: '👨' },
  { usuario: 'candidato', senha: 'cand!098', perfil: 'Candidato', nome: 'Maria Candidata', email: 'candidato@arca.es', avatar: '👩' },
  { usuario: 'Ong', senha: 'ong$-135', perfil: 'ONG', nome: 'Patinhas do Bem', email: 'ong@arca.es', avatar: '🏠' },
  { usuario: 'prefeitura', senha: 'pref@456', perfil: 'Prefeitura', nome: 'Prefeitura da Serra', email: 'prefeitura@serra.es.gov.br', avatar: '🏛️' }
];

// Massa de dados inicial para a tabela de Gerenciamento (CRUD)
var animais = [
  { id: 1, nome: 'Luna', tipo: 'Cão', sexo: 'Fêmea', idade: 2 },
  { id: 2, nome: 'Thor', tipo: 'Cão', sexo: 'Macho', idade: 3 },
  { id: 3, nome: 'Mel', tipo: 'Gato', sexo: 'Fêmea', idade: 1 },
  { id: 4, nome: 'Buddy', tipo: 'Cão', sexo: 'Macho', idade: 4 }
];
var proximoId = 5; // Incrementador de chave primária para inserções de novos animais

// Objeto detalhado dos animais para renderização na vitrine e perfil de adoção
var dadosAnimais = {
  luna: {
    nome: 'Luna',
    img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop',
    tags: ['2 anos', 'Fêmea', 'Porte médio'],
    desc: 'Luna é extremamente dócil, brincalhona e adora passeios ao ar livre. Se dá muito bem com outros animais e crianças.',
    local: 'ONG Patinhas do Bem — Boa Vista, ES'
  },
  thor: {
    nome: 'Thor',
    img: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&h=400&fit=crop',
    tags: ['3 anos', 'Macho', 'Porte grande'],
    desc: 'Thor é um cão muito energético, protetor e leal. Ideal para casas com espaço amplo para ele correr e gastar energia.',
    local: 'ONG Patinhas do Bem — Boa Vista, ES'
  },
  mel: {
    nome: 'Mel',
    img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop',
    tags: ['1 ano', 'Fêmea', 'Porte pequeno'],
    desc: 'Mel é uma gatinha calma, carinhosa e adora um colo. Já está vermifugada e pronta para receber amor.',
    local: 'ONG Patinhas do Bem — Boa Vista, ES'
  },
  buddy: {
    nome: 'Buddy',
    img: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&h=400&fit=crop',
    tags: ['4 anos', 'Macho', 'Porte médio'],
    desc: 'Buddy foi resgatado das ruas e hoje está totalmente recuperado. É companheiro, dócil e muito obediente.',
    local: 'ONG Patinhas do Bem — Boa Vista, ES'
  }
};

// Histórico estático de solicitações (Agendamentos e Castrações) exibido no app
var solicitacoes = [
  { id: 101, nome: 'Thor', tipo: 'Agendamento', data: '22/05/2026 - 14:30', status: 'andamento', badgeClass: 'andamento', statusTxt: 'Em análise' },
  { id: 102, nome: 'Luna', tipo: 'Visita Presencial', data: '18/05/2026 - 09:00', status: 'confirmado', badgeClass: 'confirmado', statusTxt: 'Confirmado' },
  { id: 103, nome: 'Mel', tipo: 'Agendamento', data: '15/05/2026 - 10:00', status: 'concluidas', badgeClass: 'concluido', statusTxt: 'Concluído' }
];

// O animal selecionado atualmente para o fluxo de agendamento de visitas
var animalSelecionadoAgendamento = null;

// ==========================================================================
// FUNÇÕES DE MAPEAMENTO E NAVEGAÇÃO DE TELAS (ROUTING)
// ==========================================================================
function mostrarTela(telaId) {
  var telaAtual = document.querySelector('.screen.active');
  if (telaAtual) {
    // Evita duplicar a mesma tela seguidamente no histórico de navegação
    if (historico.length === 0 || historico[historico.length - 1] !== telaAtual.id) {
      historico.push(telaAtual.id);
    }
    telaAtual.classList.remove('active');
  }
  
  // Exibe a nova tela adicionando a classe ativa
  var novaTela = document.getElementById(telaId);
  if (novaTela) {
    novaTela.classList.add('active');
  }

  // Sincroniza visualmente os botões da barra inferior de navegação
  atualizarMenuNavegacaoAtivo(telaId);

  // Gatilhos para carregar dados dinâmicos ao entrar em telas específicas
  if (telaId === 'tela-adocao') {
    renderizarVitrineAdocao('Todos');
  } else if (telaId === 'tela-crud') {
    renderizarTabela();
  } else if (telaId === 'tela-solicitacoes') {
    renderizarListaSolicitacoes('todas');
  }
}

function voltarTela() {
  if (historico.length > 0) {
    var telaAnteriorId = historico.pop();
    var telaAtual = document.querySelector('.screen.active');
    if (telaAtual) telaAtual.classList.remove('active');
    
    var telaAlvo = document.getElementById(telaAnteriorId);
    if (telaAlvo) {
      telaAlvo.classList.add('active');
      atualizarMenuNavegacaoAtivo(telaAnteriorId);
    }
  }
}

function atualizarMenuNavegacaoAtivo(telaId) {
  // Mapeia quais telas respondem a cada botão da barra de navegação inferior
  var mapaAbas = {
    'tela-inicio': 0,
    'tela-favoritos': 1,
    'tela-solicitacoes': 2,
    'tela-perfil-usuario': 3
  };

  var indiceAba = mapaAbas[telaId];
  if (indiceAba !== undefined) {
    document.querySelectorAll('.bottom-nav').forEach(function(nav) {
      nav.querySelectorAll('.nav-item').forEach(function(btn, idx) {
        if (idx === indiceAba) {
          btn.classList.add('ativo');
        } else {
          btn.classList.remove('ativo');
        }
      });
    });
  }
}

// ==========================================================================
// SISTEMA DE AUTENTICAÇÃO (SESSÃO DE USUÁRIO)
// ==========================================================================
function alternarTab(modo) {
  var tabEntrar = document.getElementById('tab-entrar');
  var tabCadastrar = document.getElementById('tab-cadastrar');
  var formEntrar = document.getElementById('form-entrar');
  var formCadastrar = document.getElementById('form-cadastrar');

  if (modo === 'entrar') {
    tabEntrar.classList.add('ativo');
    tabCadastrar.classList.remove('ativo');
    formEntrar.style.display = 'block';
    formCadastrar.style.display = 'none';
  } else {
    tabCadastrar.classList.add('ativo');
    tabEntrar.classList.remove('ativo');
    formCadastrar.style.display = 'block';
    formEntrar.style.display = 'none';
  }
}

function toggleSenha(inputId, btn) {
  var inp = document.getElementById(inputId);
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.textContent = '🙈';
  } else {
    inp.type = 'password';
    btn.textContent = '👁';
  }
}

function fazerLogin() {
  var userInp = document.getElementById('inp-usuario').value.trim();
  var passInp = document.getElementById('inp-senha').value;
  var erroLabel = document.getElementById('erro-login');
  var encontrado = null;

  // Percorre o array procurando correspondência de credenciais
  for (var i = 0; i < usuarios.length; i++) {
    if (usuarios[i].usuario === userInp && usuarios[i].senha === passInp) {
      encontrado = usuarios[i];
      break;
    }
  }

  if (!encontrado) {
    erroLabel.textContent = 'Usuário ou senha inválidos.';
    return;
  }

  // Define sessão do usuário e preenche elementos do Perfil
  erroLabel.textContent = '';
  perfilLogado = encontrado;
  document.getElementById('nome-usuario').textContent = encontrado.nome;
  document.getElementById('email-usuario').textContent = encontrado.email;
  document.getElementById('badge-perfil').textContent = encontrado.perfil;
  document.getElementById('avatar-usuario').textContent = encontrado.avatar;

  // Controle de Nível de Acesso (RBAC) com base no perfil logado
  var btnCrud = document.getElementById('btn-crud-admin');
  var btnDash = document.getElementById('btn-dashboard');
  
  // Exibe o gerenciador apenas para ONGs e Prefeitura
  btnCrud.style.display = (encontrado.perfil === 'ONG' || encontrado.perfil === 'Prefeitura') ? 'flex' : 'none';
  // Exibe o Dashboard Analítico apenas para a Prefeitura
  btnDash.style.display = encontrado.perfil === 'Prefeitura' ? 'flex' : 'none';

  mostrarTela('tela-inicio');
  mostrarToast('Bem-vindo(a), ' + encontrado.nome + '!');
}

function fazerLogout() {
  perfilLogado = null;
  historico = [];
  document.getElementById('inp-usuario').value = '';
  document.getElementById('inp-senha').value = '';
  mostrarTela('tela-login');
  mostrarToast('Sessão encerrada com sucesso.');
}

// ==========================================================================
// RENDERIZAÇÃO E FLUXOS DA VITRINE DE ADOÇÃO E DETALHES
// ==========================================================================
function renderizarVitrineAdocao(filtroTipo) {
  var container = document.getElementById('lista-animais');
  if (!container) return;
  container.innerHTML = '';

  // Filtra as chaves de dadosAnimais conforme a categoria selecionada nos chips
  Object.keys(dadosAnimais).forEach(function(chave) {
    var info = dadosAnimais[chave];
    
    // Filtro condicional básico
    if (filtroTipo !== 'Todos') {
      if (filtroTipo === 'Cães' && !info.tags.includes('Cão') && chave !== 'luna' && chave !== 'thor' && chave !== 'buddy') return;
      if (filtroTipo === 'Gatos' && chave !== 'mel') return;
    }

    // Geração do template HTML via string literal
    var cardHtml = `
      <div class="animal-card-wrap">
        <div class="animal-card" onclick="abrirPerfil('${chave}')">
          <img src="${info.img}" alt="${info.nome}" />
          <div class="animal-card-info">
            <h3>${info.nome}</h3>
            <p>${info.tags[0]} | ${info.tags[1]}</p>
          </div>
        </div>
        <button class="fav-btn" onclick="toggleFav(this)">🤍</button>
      </div>
    `;
    container.innerHTML += cardHtml;
  });
}

function filtrarAnimais(categoria, elementoChip) {
  // Alterna o estilo visual ativo entre os chips de categoria
  var chips = elementoChip.parentNode.querySelectorAll('.chip');
  chips.forEach(function(c) { c.classList.remove('ativo'); });
  elementoChip.classList.add('ativo');
  
  renderizarVitrineAdocao(categoria);
}

function abrirPerfil(chaveAnimal) {
  var dados = dadosAnimais[chaveAnimal];
  if (!dados) return;

  animalSelecionadoAgendamento = dados; // Salva referência para eventual agendamento

  document.getElementById('perfil-img').src = dados.img;
  document.getElementById('perfil-img').alt = dados.nome;
  document.getElementById('perfil-nome').textContent = dados.nome;
  document.getElementById('perfil-local').textContent = dados.local;
  document.getElementById('perfil-desc').textContent = dados.desc;

  // Injeção dinâmica de pequenas etiquetas (tags) com características do pet
  var tagsBox = document.getElementById('perfil-tags');
  tagsBox.innerHTML = '';
  dados.tags.forEach(function(tagTexto) {
    var span = document.createElement('span');
    span.className = 'tag-info';
    span.textContent = tagTexto;
    tagsBox.appendChild(span);
  });

  mostrarTela('tela-perfil-animal');
}

function toggleFav(botaoCoracao) {
  // Simulação puramente visual de adição à lista de favoritos
  if (botaoCoracao.textContent === '🤍') {
    botaoCoracao.textContent = '❤️';
    botaoCoracao.style.color = 'var(--vermelho)';
    mostrarToast('Adicionado aos favoritos!');
  } else {
    botaoCoracao.textContent = '🤍';
    botaoCoracao.style.color = '';
    mostrarToast('Removido dos favoritos.');
  }
}

// ==========================================================================
// FLUXO DE SOLICITAÇÃO DE AGENDAMENTOS E CASTRAÇÕES
// ==========================================================================
function abrirAgendamento() {
  if (!animalSelecionadoAgendamento) return;
  document.getElementById('agend-img').src = animalSelecionadoAgendamento.img;
  document.getElementById('agend-nome').textContent = animalSelecionadoAgendamento.nome;
  mostrarTela('tela-agendamento');
}

function selecionarHorario(botaoHorario) {
  var btns = botaoHorario.parentNode.querySelectorAll('.horario-btn');
  btns.forEach(function(b) { b.classList.remove('ativo'); });
  botaoHorario.classList.add('ativo');
}

function confirmarAgendamento() {
  if (!animalSelecionadoAgendamento) return;
  
  var novoAgend = {
    id: Math.floor(Math.random() * 1000),
    nome: animalSelecionadoAgendamento.name || animalSelecionadoAgendamento.nome,
    tipo: 'Visita Presencial',
    data: '25/05/2026 - 09:00',
    status: 'andamento',
    badgeClass: 'andamento',
    statusTxt: 'Em análise'
  };

  solicitacoes.unshift(novoAgend); // Insere no topo da lista
  mostrarTela('tela-solicitacoes');
  mostrarToast('Visita pré-agendada com sucesso!');
}

function salvarSolicitacaoCastracao() {
  var novoRegistro = {
    id: Math.floor(Math.random() * 1000),
    nome: 'Pedido de Castração',
    tipo: 'Castração',
    data: 'Just agora',
    status: 'andamento',
    badgeClass: 'andamento',
    statusTxt: 'Em análise'
  };
  solicitacoes.unshift(novoRegistro);
  mostrarTela('tela-solicitacoes');
  mostrarToast('Solicitação de castração cadastrada!');
}

function renderizarListaSolicitacoes(filtro) {
  var container = document.getElementById('lista-solicitacoes');
  if (!container) return;
  container.innerHTML = '';

  solicitacoes.forEach(function(sol) {
    if (filtro !== 'todas' && sol.status !== filtro) return;

    var itemHtml = `
      <div class="sol-item">
        <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop" alt="Pet" />
        <div class="sol-item-info">
          <h3>${sol.nome}</h3>
          <p>${sol.tipo}</p>
          <small>${sol.data}</small>
        </div>
        <span class="badge ${sol.badgeClass}">${sol.statusTxt}</span>
      </div>
    `;
    container.innerHTML += itemHtml;
  });
}

function filtrarSolicitacoes(status, elementoAba) {
  var abas = elementoAba.parentNode.querySelectorAll('.sol-tab');
  abas.forEach(function(tab) { tab.classList.remove('ativo'); });
  elementoAba.classList.add('ativo');
  renderizarListaSolicitacoes(status);
}

// ==========================================================================
// OPERAÇÕES DO BANCO DE DADOS LOCAL (CRUD DE ANIMAIS)
// ==========================================================================
function renderizarTabela() {
  var tbody = document.getElementById('tbody-animais');
  if (!tbody) return;
  tbody.innerHTML = '';

  animais.forEach(function(animal) {
    var tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${animal.nome}</td>
      <td>${animal.tipo}</td>
      <td>${animal.idade} ano(s)</td>
      <td>
        <div class="crud-acoes">
          <button class="btn-crud editar" onclick="abrirModalCrud(${animal.id})">Editar</button>
          <button class="btn-crud excluir" onclick="excluirAnimal(${animal.id})">Excluir</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function abrirModalCrud(id) {
  var modal = document.getElementById('modal-crud');
  var titulo = document.getElementById('modal-titulo');
  
  if (id) {
    // Modo Edição: Localiza o objeto pelo ID e preenche o formulário
    titulo.textContent = 'Editar Registro Animal';
    var animal = animais.find(function(a) { return a.id === id; });
    if (animal) {
      document.getElementById('crud-id').value = animal.id;
      document.getElementById('crud-nome').value = animal.nome;
      document.getElementById('crud-tipo').value = animal.tipo;
      document.getElementById('crud-sexo').value = animal.sexo;
      document.getElementById('crud-idade').value = animal.idade;
    }
  } else {
    // Modo Criação: Reseta todos os inputs
    titulo.textContent = 'Adicionar Novo Animal';
    document.getElementById('crud-id').value = '';
    document.getElementById('crud-nome').value = '';
    document.getElementById('crud-tipo').value = 'Cão';
    document.getElementById('crud-sexo').value = 'Macho';
    document.getElementById('crud-idade').value = '';
  }
  modal.classList.add('aberto');
}

function fecharModal() {
  document.getElementById('modal-crud').classList.remove('aberto');
}

function salvarAnimal() {
  var id = document.getElementById('crud-id').value;
  var nome = document.getElementById('crud-nome').value.trim();
  var tipo = document.getElementById('crud-tipo').value;
  var sexo = document.getElementById('crud-sexo').value;
  var idade = parseInt(document.getElementById('crud-idade').value) || 0;

  if (!nome) { 
    mostrarToast('Informe o nome do animal.'); 
    return; 
  }

  if (id) {
    // Lógica de Update: substitui os dados no índice correto do array
    var idx = animais.findIndex(function(a) { return a.id === parseInt(id); });
    if (idx > -1) {
      animais[idx] = { id: parseInt(id), nome: nome, tipo: tipo, sexo: sexo, idade: idade };
      mostrarToast('Animal atualizado com sucesso!');
    }
  } else {
    // Lógica de Insert: adiciona novo objeto e incrementa o ID
    animais.push({ id: proximoId++, nome: nome, tipo: tipo, sexo: sexo, idade: idade });
    mostrarToast('Novo animal cadastrado no sistema!');
  }

  fecharModal();
  renderizarTabela(); // Atualiza a tabela imediatamente na interface
}

function excluirAnimal(id) {
  if (confirm('Tem certeza que deseja apagar permanentemente este registro?')) {
    animais = animais.filter(function(animal) { return animal.id !== id; });
    renderizarTabela();
    mostrarToast('Registro removido do banco de dados.');
  }
}

// ==========================================================================
// UTILITÁRIOS INTERNOS GLOBALIZADOS
// ==========================================================================
function mostrarToast(msg) {
  var toastBox = document.getElementById('toast-notif');
  if (!toastBox) return;
  toastBox.textContent = msg;
  toastBox.classList.add('show');
  
  // Oculta a notificação após 2.5 segundos de exibição
  setTimeout(function() {
    toastBox.classList.remove('show');
  }, 2500);
}