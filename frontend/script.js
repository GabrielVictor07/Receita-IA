const listaIngredientes = [];

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  const gerarBtn = document.getElementById("gerarBtn");

  addBtn.addEventListener("click", adicionarIngrediente);
  gerarBtn.addEventListener("click", gerarReceitaIA);
});

function adicionarIngrediente() {
  const input = document.getElementById("ingredienteInput");
  const ingrediente = input.value.trim().toLowerCase();

  if (ingrediente && !listaIngredientes.includes(ingrediente)) {
    listaIngredientes.push(ingrediente);
    atualizarListaIngredientes();
  }
  input.value = "";
}

function removerIngrediente(index) {
  listaIngredientes.splice(index, 1);
  atualizarListaIngredientes();
}

function atualizarListaIngredientes() {
  const ul = document.getElementById("listaIngredientes");
  ul.innerHTML = "";
  listaIngredientes.forEach((item, index) => {
    ul.innerHTML += `
      <li>
        ${item} 
        <button onclick="removerIngrediente(${index})" class="remove-botton">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </li>
    `;
  });
}

async function gerarReceitaIA() {
  const div = document.getElementById("saidaReceita");

  if (listaIngredientes.length === 0) {
    div.innerHTML = "Adicione ingredientes para gerar receitas 🍳";
    return;
  }

  div.innerHTML = "⏳ Gerando receita com IA...";

  try {
    // 🔹 URL relativa para funcionar local e online
    const response = await fetch("/gerar-receita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredientes: listaIngredientes }),
    });

    const data = await response.json();

    if (data.error) {
      div.innerHTML = `❌ ${data.error}`;
      return;
    }

    div.innerHTML = data.receita || "❌ Nenhuma receita gerada.";
  } catch (error) {
    div.innerHTML = "❌ Erro ao se conectar com o servidor.";
    console.error(error);
  }
}
