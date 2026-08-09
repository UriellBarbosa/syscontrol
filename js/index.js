let editandoIndice = null;

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
          listaMateriais[editandoIndice] = material;
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

mostrarSecao("inicio");
carregarMateriais();
