async function gerarReceitaIA() {
  const div = document.getElementById("saidaReceita");

  if (listaIngredientes.length === 0) {
    div.innerHTML = "Adicione ingredientes para gerar receitas 🍳";
    return;
  }

  div.innerHTML = "⏳ Gerando receita com IA...";

  try {
    const response = await fetch("https://receita-ia.onrender.com/gerar-receita", {
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
