let editandoIndice = null;
let editandoIndiceServico = null;

// BOTÕES DE SEÇÃO DO HEADER
const botoes = document.querySelectorAll(".nav-button");
const sections = document.querySelectorAll("section");

function mostrarSecao(id) {
  sections.forEach((section) => {
    section.style.display = "none";
  });

  botoes.forEach((botao) => {
    botao.classList.remove("active");
  });

  document.getElementById(id).style.display = "block";

  document.querySelector(`.nav-button[data-secao="${id}"]`).classList.add("active");
}

botoes.forEach((botao) => {
  botao.addEventListener("click", () => {
    mostrarSecao(botao.dataset.secao);
  });
});

/* ================
  ABA INÍCIO
================= */
function atualizarDashboard() {
  const materiais = localStorage.getItem('materiais');
  const listaMateriais = materiais ? JSON.parse(materiais) : [];

  const servicos = localStorage.getItem('servicos');
  const listaServicos = servicos ? JSON.parse(servicos) : [];
  const concluidos = listaServicos.filter(servico => servico.statusServico === 'concluido');
  const pendentes = listaServicos.filter(servico => servico.statusServico === 'pendente');

  document.getElementById('total-materiais').textContent = listaMateriais.length;
  document.getElementById('total-concluidos').textContent = concluidos.length;
  document.getElementById('total-pendentes').textContent = pendentes.length;
};

function carregarUltimosServicos() {
  const servicos = localStorage.getItem('servicos');
  const listaServicos = servicos ? JSON.parse(servicos) : [];

  const ultimosServicos = listaServicos.slice(-5);

  document.getElementById('ultimos-servicos').innerHTML = "";

  ultimosServicos.forEach((servico, indice) => {
    const linhaUltimosServicos = `<tr>
        <td>${servico.nomeServico}</td>
        <td>${formatarData(servico.dataServico)}</td>
        <td>${servico.statusServico}</td>
        </tr>`

    document.getElementById('ultimos-servicos').innerHTML += linhaUltimosServicos;
  });
};

// EXPORTAR BACKUP
const expBackup = document.getElementById('exp-backup');

expBackup.addEventListener('click', () => {
  const materiais = localStorage.getItem('materiais');
  const listaMateriais = materiais ? JSON.parse(materiais) : [];
  const servicos = localStorage.getItem('servicos');
  const listaServicos = servicos ? JSON.parse(servicos) : [];

  const itensBackup = {
    materiais: listaMateriais,
    servicos: listaServicos,
  }

  const backup = JSON.stringify(itensBackup);                  // transforma o objeto da const itensBackup em JSON

  const blob = new Blob([backup], { type:'application/json'}); // cria arquivo para download

  const url = URL.createObjectURL(blob);                       // cria URL temporária do arquivo a ser baixado

  const link = document.createElement('a');                    // elemento de link criado dinamicamente

  link.href = url;                                             // configura o link para a URL criada
  link.download = 'backup-syscontrol.json';                    // configura link de download com nome do arquivo
  link.click();                                                // clique invisível que dispara o download automático do backup
});

/* ================
  ABA MATERIAIS
================= */

// LISTENERS 
const novoMaterial = document.getElementById("novo-material");
const abrirFormulario = document.querySelector(".form-card");
const fecharFormulario = document.getElementById("cancelar");
const salvarFormulario = document.getElementById("salvar");
const excluirLinhaTabela = document.getElementById("lista-materiais");

novoMaterial.addEventListener("click", () => {
    abrirFormulario.classList.toggle('hidden');
});

fecharFormulario.addEventListener("click", () => {
    abrirFormulario.classList.toggle('hidden');
});

excluirLinhaTabela.addEventListener("click", (e) => {
  if (e.target.classList.contains('btn-excluir')) {
    const indice = e.target.dataset.indice;

    const materiais = localStorage.getItem('materiais');
    const listaMateriais = materiais ? JSON.parse(materiais) : [];

    listaMateriais.splice(indice, 1);
    localStorage.setItem('materiais', JSON.stringify(listaMateriais));

    carregarMateriais();
    atualizarDashboard();

  } else if (e.target.classList.contains('btn-editar')) {
    const indice = e.target.dataset.indice;

    const materiais = localStorage.getItem('materiais');
    const listaMateriais = materiais ? JSON.parse(materiais) : [];

    const material = listaMateriais[indice];

    document.getElementById('nome-material').value = material.nomeMaterial;
    document.getElementById('categoria').value = material.categoria;
    document.getElementById('quantidade').value = material.quantidade;
    document.getElementById('custo-unitario').value = material.custoUnitario;

    abrirFormulario.classList.remove('hidden');

    editandoIndice = indice;
  }
});

salvarFormulario.addEventListener("click", () => {
    const nomeMaterial = document.getElementById("nome-material").value;
    const categoria = document.getElementById("categoria").value;
    const quantidade = document.getElementById("quantidade").value;
    const custoUnitario = document.getElementById("custo-unitario").value;

    if (nomeMaterial === "" || categoria === "" || quantidade === "" || custoUnitario === "") {
        alert("Para salvar um novo material todos os campos precisam ser preenchidos.");
    } else {
        const material = {
            nomeMaterial: nomeMaterial,
            categoria: categoria,
            quantidade: quantidade,
            custoUnitario: custoUnitario,
        };

        const materiais = localStorage.getItem('materiais');
        const listaMateriais = materiais ? JSON.parse(materiais) : [];

        if (editandoIndice !== null) {
          listaMateriais[editandoIndice] = material; // lógica de editar material
        } else {
          listaMateriais.push(material); // lógica de criar material
        }
        
        localStorage.setItem('materiais', JSON.stringify(listaMateriais));

        document.getElementById("nome-material").value = "";
        document.getElementById("categoria").value = "";
        document.getElementById("quantidade").value = "";
        document.getElementById("custo-unitario").value = "";

        abrirFormulario.classList.add('hidden');

        editandoIndice = null;

        carregarMateriais();
        atualizarDashboard();
    };
});

// FUNÇÃO CARREGAR MATERIAIS
function carregarMateriais() {
  const materiais = localStorage.getItem('materiais');
  const listaMateriais = materiais ? JSON.parse(materiais) : [];

  document.getElementById('lista-materiais').innerHTML = "";

  listaMateriais.forEach((material, indice) => {
    const linha = `<tr>
        <td>${material.nomeMaterial}</td>
        <td>${material.categoria}</td>
        <td>${material.quantidade}</td>
        <td>${material.custoUnitario}</td>
        <td>${material.quantidade * material.custoUnitario}</td>
        <td>
        <button class="action-button btn-editar" data-indice="${indice}">Editar</button>
        <button class="action-button btn-excluir" data-indice="${indice}">Excluir</button>
        </td>
        </tr>`

    document.getElementById('lista-materiais').innerHTML += linha;
  });
};

/* ================
  ABA SERVIÇOS
================= */

const novoServico = document.getElementById("novo-servico");
const abrirFormularioServico = document.querySelector(".form-card-servico");
const fecharFormularioServico = document.getElementById("cancelar-servico");
const salvarFormularioServico = document.getElementById("salvar-servico");
const excluirLinhaTabelaServico = document.getElementById("lista-servicos");

// LISTENERS
novoServico.addEventListener("click", () => {
    abrirFormularioServico.classList.toggle('hidden');
});

fecharFormularioServico.addEventListener("click", () => {
    abrirFormularioServico.classList.toggle('hidden');
});

salvarFormularioServico.addEventListener("click", () => {
  const nomeServico = document.getElementById("nome-servico").value;
  const categoriaServico = document.getElementById("categoria-servico").value;
  const dataServico = document.getElementById("data-servico").value;
  const statusServico = document.getElementById("status-servico").value;

  if (nomeServico === "" || categoriaServico === "" || dataServico === "" || statusServico === "") {
    alert("Para salvar um novo serviço todos os campos precisam estar preenchidos")
  } else {
    const servico = {
      nomeServico: nomeServico,
      categoriaServico: categoriaServico,
      dataServico: dataServico,
      statusServico: statusServico,
    };

    const servicos = localStorage.getItem('servicos');
    const listaServicos = servicos ? JSON.parse(servicos) : [];

    if (editandoIndiceServico !== null) {
          listaServicos[editandoIndiceServico] = servico; // lógica de editar material
        } else {
          listaServicos.push(servico); // lógica de criar material
        }

    localStorage.setItem('servicos', JSON.stringify(listaServicos));

    document.getElementById("nome-servico").value = "";
    document.getElementById("categoria-servico").value = "";
    document.getElementById("data-servico").value = "";
    document.getElementById("status-servico").value = "";

    abrirFormularioServico.classList.add('hidden');

    editandoIndiceServico = null;

    carregarServicos();
    atualizarDashboard();
  }
});

excluirLinhaTabelaServico.addEventListener("click", (e) => {
  if (e.target.classList.contains('btn-excluir')) {
    const indiceServico = e.target.dataset.indice;

    const servicos = localStorage.getItem('servicos');
    const listaServicos = servicos ? JSON.parse(servicos) : [];

    listaServicos.splice(indiceServico, 1);
    localStorage.setItem('servicos', JSON.stringify(listaServicos));

    carregarServicos();
    atualizarDashboard();

  } else if (e.target.classList.contains('btn-editar')) {
    const indiceServico = e.target.dataset.indice;

    const servicos = localStorage.getItem('servicos');
    const listaServicos = servicos ? JSON.parse(servicos) : [];

    const servico = listaServicos[indiceServico];

    document.getElementById('nome-servico').value = servico.nomeServico;
    document.getElementById('categoria-servico').value = servico.categoriaServico;
    document.getElementById('data-servico').value = servico.dataServico;
    document.getElementById('status-servico').value = servico.statusServico;

    abrirFormularioServico.classList.remove('hidden');

    editandoIndiceServico = indiceServico;
  }
});

// FUNÇÃO CARREGAR SERVIÇOS
function carregarServicos() {
  const servicos = localStorage.getItem('servicos');
  const listaServicos = servicos ? JSON.parse(servicos) : [];

  document.getElementById('lista-servicos').innerHTML = "";

  listaServicos.forEach((servico, indice) => {
    const linhaServico = `<tr>
        <td>${servico.nomeServico}</td>
        <td>${servico.categoriaServico}</td>
        <td>${formatarData(servico.dataServico)}</td>
        <td>${servico.statusServico}</td>
        <td>
        <button class="action-button btn-editar" data-indice="${indice}">Editar</button>
        <button class="action-button btn-excluir" data-indice="${indice}">Excluir</button>
        </td>
        </tr>`

    document.getElementById('lista-servicos').innerHTML += linhaServico;
  });
};

// FUNÇÃO PARA APRESENTAR A DATA FORMATADA PADRÃO BRASILEIRO
function formatarData(data) {
  const partes = data.split('-');

  const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
  return dataFormatada;
}


mostrarSecao("inicio");
carregarUltimosServicos();
atualizarDashboard();
carregarMateriais();
carregarServicos();
