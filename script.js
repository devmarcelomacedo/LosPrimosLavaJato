// Memória do App
let pátio = JSON.parse(localStorage.getItem('primos_patio')) || [];
let historico = JSON.parse(localStorage.getItem('primos_historico')) || [];
let faturamentoTotal = parseFloat(localStorage.getItem('primos_fatur')) || 0;

// Ícone Flutuante: Abre o cadastro de qualquer lugar
document.getElementById('btn-flutuante').onclick = () => {
    mudarAba('entrada');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function cadastrarEntrada() {
    const modelo = document.getElementById('modelo-veiculo').value;
    const placa = document.getElementById('placa-veiculo').value;
    const cor = document.getElementById('cor-veiculo').value;
    const valor = parseFloat(document.getElementById('tipo-servico').value);
    const tipoTxt = document.getElementById('tipo-servico').options[document.getElementById('tipo-servico').selectedIndex].text;

    if (!modelo || !placa) return alert("Preencha o modelo e a placa!");

    const veiculo = {
        id: Date.now(),
        modelo, placa, cor, valor, tipoTxt,
        entrada: new Date().toLocaleString('pt-BR')
    };

    pátio.push(veiculo);
    salvarESincronizar();
    
    // Limpar campos
    document.querySelectorAll('input').forEach(i => i.value = "");
    alert("Cadastrado com sucesso!");
    mudarAba('saida');
}

function finalizarServico(id) {
    const index = pátio.findIndex(v => v.id === id);
    const veiculo = pátio[index];
    
    veiculo.saida = new Date().toLocaleString('pt-BR');
    veiculo.dataSaidaObj = new Date(); // Para o filtro de relatório
    
    historico.push(veiculo);
    faturamentoTotal += veiculo.valor;
    pátio.splice(index, 1);
    
    salvarESincronizar();
}

function baixarRelatorio() {
    const periodo = document.getElementById('periodo-relatorio').value;
    const agora = new Date();
    
    const filtrados = historico.filter(v => {
        const dataVenda = new Date(v.dataSaidaObj);
        const diffDias = (agora - dataVenda) / (1000 * 60 * 60 * 24);
        
        if(periodo === 'diario') return dataVenda.toDateString() === agora.toDateString();
        if(periodo === 'semanal') return diffDias <= 7;
        if(periodo === 'mensal') return diffDias <= 30;
    });

    let txt = `RELATÓRIO ${periodo.toUpperCase()} - LOS PRIMOS\n`;
    txt += `Total de Veículos: ${filtrados.length} | Faturamento: R$ ${filtrados.reduce((a,b) => a + b.valor, 0).toFixed(2)}\n\n`;
    
    filtrados.forEach(v => {
        txt += `${v.modelo} [${v.placa}] - ${v.tipoTxt}\nEntrada: ${v.entrada} | Saída: ${v.saida}\n---\n`;
    });

    const blob = new Blob([txt], {type: 'text/plain'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${periodo}.txt`;
    link.click();
}

function salvarESincronizar() {
    localStorage.setItem('primos_patio', JSON.stringify(pátio));
    localStorage.setItem('primos_historico', JSON.stringify(historico));
    localStorage.setItem('primos_fatur', faturamentoTotal.toString());
    renderizar();
}

function renderizar() {
    const lista = document.getElementById('lista-veiculos');
    lista.innerHTML = pátio.length ? "" : "<p style='text-align:center; color:#555'>Pátio vazio</p>";

    pátio.forEach(v => {
        lista.innerHTML += `
            <div class="card-veiculo">
                <div>
                    <strong>${v.modelo}</strong> [${v.placa}]<br>
                    <small>${v.tipoTxt}</small>
                </div>
                <button class="btn-saida" onclick="finalizarServico(${v.id})">R$ ${v.valor}</button>
            </div>
        `;
    });

    document.getElementById('vagas-disponiveis').innerText = 50 - pátio.length;
    document.getElementById('vagas-ocupadas').innerText = pátio.length;
    document.getElementById('faturamento').innerText = `R$ ${faturamentoTotal.toFixed(2)}`;
}

function mudarAba(id) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    // Marca o botão da aba como ativo
    const btn = Array.from(document.querySelectorAll('.tab-button')).find(b => b.innerText.toLowerCase().includes(id));
    if(btn) btn.classList.add('active');
}

renderizar();