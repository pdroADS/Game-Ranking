document.addEventListener('DOMContentLoaded', function() {
    // ========== CONFIGURAÇÃO INICIAL ==========
    const elements = {
        addJogoBtn: document.querySelector('.add-btn'),
        campoNomeJogo: document.querySelector('.Nome'),
        tiposJogoDiv: document.querySelector('.tipos-jogo'),
        modoCriacao: document.querySelector('.modo_criacao'),
        separadorManual: document.querySelector('.separador_manual'),
        separadorAutomatico: document.querySelector('.separador_automatico'),
        individual: document.querySelector('.individual'),
        separarManualRadio: document.querySelector('input[name="separar"][value="Manual"]'),
        separarAutoRadio: document.querySelector('input[name="separar"][value="Automaticamente"]'),
        timesContainer: document.getElementById('times-container'),
        adicionarTimeBtn: document.getElementById('adicionar-time-btn'),
        notification: document.getElementById('notification'),
        btnConfig: document.querySelector('.btn_icons'),
        menuSair: document.querySelector('.sair')
    };

    // Estados da aplicação
    const state = {
        timeCounter: 1,
        menuAberto: false,
        todosJogadores: [],
        todosTimes: [],
        jogadoresIndividual: []
    };

    // ========== FUNÇÕES DE UTILIDADE ==========
    function showNotification(message, type = 'success') {
        elements.notification.textContent = message;
        elements.notification.className = `notification ${type}`;
        elements.notification.style.display = 'block';
        setTimeout(() => elements.notification.style.display = 'none', 3000);
    }

    function processarNomes(texto) {
        return texto.split(',')
            .map(nome => nome.trim())
            .filter(nome => nome !== '');
    }

    // ========== GERENCIAMENTO DE INTERFACE ==========
    function inicializarVisibilidade() {
        const elementosOcultos = [
            elements.campoNomeJogo, elements.tiposJogoDiv, elements.modoCriacao,
            elements.separadorManual, elements.separadorAutomatico, elements.individual
        ];
        elementosOcultos.forEach(el => el.style.display = 'none');
    }

    function atualizarVisibilidadeTipoJogo() {
        [elements.modoCriacao, elements.separadorManual, elements.separadorAutomatico, elements.individual]
            .forEach(el => el.style.display = 'none');

        const tipoSelecionado = document.querySelector('input[name="tipo"]:checked');
        if (!tipoSelecionado) return;

        if (tipoSelecionado.value === 'Individual') {
            elements.individual.style.display = 'block';
        } else if (tipoSelecionado.value === 'Grupo') {
            elements.modoCriacao.style.display = 'block';
            atualizarVisibilidadeSeparacao();
        }
    }

    function atualizarVisibilidadeSeparacao() {
        if (elements.separarManualRadio.checked) {
            elements.separadorManual.style.display = 'block';
            elements.separadorAutomatico.style.display = 'none';
            if (elements.timesContainer.children.length === 0) adicionarTime();
        } else if (elements.separarAutoRadio.checked) {
            elements.separadorManual.style.display = 'none';
            elements.separadorAutomatico.style.display = 'block';
        }
    }

    // ========== GERENCIAMENTO DO MENU SAIR ==========
    function toggleMenuSair() {
        if (state.menuAberto) {
            elements.menuSair.style.animation = 'fadeOut 0.2s ease-in-out forwards';
            setTimeout(() => elements.menuSair.style.display = 'none', 200);
        } else {
            elements.menuSair.style.display = 'flex';
            elements.menuSair.style.animation = 'fadeIn 0.2s ease-in-out forwards';
        }
        state.menuAberto = !state.menuAberto;
    }

    function fecharMenuSair() {
        if (state.menuAberto) {
            elements.menuSair.style.animation = 'fadeOut 0.2s ease-in-out forwards';
            setTimeout(() => {
                elements.menuSair.style.display = 'none';
                state.menuAberto = false;
            }, 200);
        }
    }

    // ========== FUNÇÕES GENÉRICAS PARA LISTAS ==========
    function adicionarItensLista(texto, arrayDestino, callbackAtualizacao, tipo = 'jogador') {
        const nomes = processarNomes(texto);
        if (nomes.length === 0) {
            showNotification(`Nenhum ${tipo} válido encontrado!`, 'error');
            return false;
        }

        arrayDestino.push(...nomes);
        callbackAtualizacao();
        showNotification(`${nomes.length} ${tipo}(es) adicionado(s) com sucesso!`);
        return true;
    }

    function criarItemLista(nome, index, array, callbackAtualizacao, tipo = 'jogador') {
        const li = document.createElement('li');
        li.className = `${tipo}-item`;
        li.innerHTML = `
            <span class="${tipo}-nome">${nome}</span>
            <div class="${tipo}-actions">
                <button class="edit-btn" type="button" title="Editar ${tipo}">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button class="delete-btn" type="button" title="Remover ${tipo}">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `;

        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        const nomeSpan = li.querySelector(`.${tipo}-nome`);

        editBtn.addEventListener('click', () => {
            const novoNome = prompt(`Editar nome do ${tipo}:`, nomeSpan.textContent);
            if (novoNome?.trim()) {
                array[index] = novoNome.trim();
                callbackAtualizacao();
                showNotification(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} atualizado!`);
            }
        });

        deleteBtn.addEventListener('click', () => {
            if (confirm(`Remover ${tipo} "${nomeSpan.textContent}"?`)) {
                array.splice(index, 1);
                callbackAtualizacao();
                showNotification(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} removido!`);
            }
        });

        return li;
    }

    function atualizarListaUI(array, listaElement, contadorElement, emptyMsgElement, tipo = 'jogador') {
        listaElement.innerHTML = '';
        
        if (array.length === 0) {
            emptyMsgElement.style.display = 'block';
            contadorElement.textContent = '0';
            return;
        }
        
        emptyMsgElement.style.display = 'none';
        contadorElement.textContent = array.length.toString();
        
        array.forEach((item, index) => {
            listaElement.appendChild(criarItemLista(item, index, array, 
                () => atualizarListaUI(array, listaElement, contadorElement, emptyMsgElement, tipo), tipo));
        });
    }

    // ========== MODO MANUAL - TIMES ==========
    function adicionarTime() {
        const timeCard = document.createElement('div');
        timeCard.className = 'time-card';
        timeCard.innerHTML = `
            <div class="time-header">
                <label class="step-label">Nome do Time</label>
                <input type="text" class="nome-time-input" placeholder="Ex: Vingadores,...">
            </div>
            <div class="adicionar-jogadores-section">
                <label class="step-label">Adicionar Jogadores</label>
                <div class="modo-multi">
                    <textarea class="multi-jogador-input" placeholder="Digite os nomes separados por vírgula:&#10;Ex: João, Maria, Pedro, Ana"></textarea>
                    <button class="btn-adicionar-multi" type="button">Adicionar</button>
                </div>
                <div class="lista-jogadores-container">
                    <h4>Jogadores (<span class="jogadores-count">0</span>)</h4>
                    <ul class="lista-jogadores"></ul>
                    <p class="lista-vazia-msg">Nenhum jogador adicionado ainda.</p>
                </div>
            </div>
            <button class="remove-time-btn" type="button">
                <i class="fa-solid fa-trash"></i> Remover Time
            </button>
        `;

        elements.timesContainer.appendChild(timeCard);
        configurarTimeCard(timeCard);
    }

    function configurarTimeCard(timeCard) {
        const multiInput = timeCard.querySelector('.multi-jogador-input');
        const addBtn = timeCard.querySelector('.btn-adicionar-multi');
        const removeBtn = timeCard.querySelector('.remove-time-btn');
        const listaJogadores = timeCard.querySelector('.lista-jogadores');
        const contador = timeCard.querySelector('.jogadores-count');
        const emptyMsg = timeCard.querySelector('.lista-vazia-msg');

        const adicionarHandler = () => {
            const texto = multiInput.value.trim();
            if (!texto) {
                showNotification('Digite os nomes dos jogadores', 'error');
                return;
            }

            const nomes = processarNomes(texto);
            if (nomes.length === 0) return;

            nomes.forEach(nome => {
                const li = criarItemListaManual(nome, listaJogadores, contador, emptyMsg);
                listaJogadores.appendChild(li);
            });

            multiInput.value = '';
            emptyMsg.style.display = 'none';
            contador.textContent = listaJogadores.children.length;
            showNotification(`${nomes.length} jogador(es) adicionado(s)!`);
        };

        addBtn.addEventListener('click', adicionarHandler);
        multiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                adicionarHandler();
            }
        });

        removeBtn.addEventListener('click', () => {
            if (confirm('Remover este time e todos os jogadores?')) {
                timeCard.remove();
                showNotification('Time removido!');
            }
        });
    }

    function criarItemListaManual(nome, lista, contador, emptyMsg) {
        const li = document.createElement('li');
        li.className = 'jogador-item';
        li.innerHTML = `
            <span class="jogador-nome">${nome}</span>
            <div class="jogador-actions">
                <button class="edit-btn" type="button"><i class="fa-solid fa-pencil"></i></button>
                <button class="delete-btn" type="button"><i class="fa-solid fa-times"></i></button>
            </div>
        `;

        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        const nomeSpan = li.querySelector('.jogador-nome');

        editBtn.addEventListener('click', () => {
            const novoNome = prompt('Editar jogador:', nomeSpan.textContent);
            if (novoNome?.trim()) nomeSpan.textContent = novoNome.trim();
        });

        deleteBtn.addEventListener('click', () => {
            if (confirm(`Remover jogador "${nomeSpan.textContent}"?`)) {
                li.remove();
                contador.textContent = lista.children.length;
                if (lista.children.length === 0) emptyMsg.style.display = 'block';
                showNotification('Jogador removido!');
            }
        });

        return li;
    }

    // ========== MODO AUTOMÁTICO ==========
    function adicionarTimesAuto() {
        const input = document.querySelector('.separador_automatico .multi-time-input');
        if (adicionarItensLista(input.value, state.todosTimes, atualizarListaTimesAuto, 'time')) {
            input.value = '';
        }
    }

    function atualizarListaTimesAuto() {
        const lista = document.getElementById('lista-times-auto');
        const contador = document.querySelector('.separador_automatico .times-count');
        const emptyMsg = document.querySelector('.separador_automatico .lista-times-vazia-msg');
        atualizarListaUI(state.todosTimes, lista, contador, emptyMsg, 'time');
    }

    function adicionarJogadoresAuto() {
        const input = document.querySelector('.separador_automatico .multi-jogador-input');
        if (adicionarItensLista(input.value, state.todosJogadores, atualizarListaJogadoresAuto)) {
            input.value = '';
        }
    }

    function atualizarListaJogadoresAuto() {
        const lista = document.getElementById('lista-jogadores-auto');
        const contador = document.querySelector('.separador_automatico .jogadores-count');
        const emptyMsg = document.querySelector('.separador_automatico .lista-vazia-msg');
        atualizarListaUI(state.todosJogadores, lista, contador, emptyMsg);
    }

    // ========== MODO INDIVIDUAL ==========
    function adicionarJogadoresIndividual() {
        const input = document.querySelector('.individual .multi-jogador-input');
        if (adicionarItensLista(input.value, state.jogadoresIndividual, atualizarListaJogadoresIndividual)) {
            input.value = '';
        }
    }

    function atualizarListaJogadoresIndividual() {
        const lista = document.getElementById('lista-jogadores-individual');
        const contador = document.querySelector('.individual .jogadores-count');
        const emptyMsg = document.querySelector('.individual .lista-vazia-msg');
        atualizarListaUI(state.jogadoresIndividual, lista, contador, emptyMsg);
    }

    // ========== SEPARAÇÃO AUTOMÁTICA ==========
    function separarJogadoresAutomaticamente() {
        if (state.todosTimes.length === 0) {
            showNotification('Adicione pelo menos um time.', 'error');
            return;
        }
        if (state.todosJogadores.length === 0) {
            showNotification('Adicione pelo menos um jogador.', 'error');
            return;
        }

        const jogadoresEmbaralhados = [...state.todosJogadores].sort(() => Math.random() - 0.5);
        const timesDistribuidos = distribuirJogadores(jogadoresEmbaralhados, state.todosTimes);
        
        const dadosParaBackend = {
            modo: "automatico",
            nomesTimes: state.todosTimes,
            jogadores: state.todosJogadores,
            timesDistribuidos: timesDistribuidos
        };

        showNotification(`Jogadores distribuídos entre ${state.todosTimes.length} times!`);
        console.log('Dados para backend:', dadosParaBackend);
        
        // Mostrar resultado (substituir por UI melhor posteriormente)
        let mensagem = 'Distribuição dos Times:\n\n';
        timesDistribuidos.forEach(time => {
            mensagem += `${time.nome} (${time.jogadores.length} jogadores):\n`;
            mensagem += `- ${time.jogadores.join('\n- ')}\n\n`;
        });
        alert(mensagem);
    }

    function distribuirJogadores(jogadores, nomesTimes) {
        const times = nomesTimes.map(nome => ({ nome, jogadores: [] }));
        let indexTime = 0;
        jogadores.forEach(jogador => {
            times[indexTime].jogadores.push(jogador);
            indexTime = (indexTime + 1) % times.length;
        });
        return times;
    }

    // ========== COLETAR DADOS PARA BACKEND ==========
    function coletarDadosTimesManuais() {
        const times = [];
        document.querySelectorAll('.time-card').forEach(card => {
            const nomeTime = card.querySelector('.nome-time-input').value.trim();
            const jogadores = [];
            card.querySelectorAll('.jogador-item .jogador-nome').forEach(item => {
                jogadores.push(item.textContent.trim());
            });
            if (nomeTime) times.push({ nome: nomeTime, jogadores });
        });
        return times;
    }

    function coletarDadosIndividual() {
        return {
            modo: "individual",
            metaVitorias: document.querySelector('.individual .Meta').value,
            jogadores: state.jogadoresIndividual
        };
    }

    function validarEGerarJogo(modo, validacao, coletaDados) {
        if (!validacao()) return;
        
        const dadosParaBackend = coletaDados();
        console.log(`Dados para backend (${modo}):`, dadosParaBackend);
        showNotification(`Jogo ${modo} gerado com sucesso!`);
        
        // Integração com backend aqui
        // fetch('/api/criar-jogo', { method: 'POST', body: JSON.stringify(dadosParaBackend) })
    }

    // ========== CONFIGURAÇÃO DE EVENTOS ==========
    function configurarEventListeners() {
        // Menu sair
        if (elements.btnConfig && elements.menuSair) {
            elements.btnConfig.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMenuSair();
            });

            elements.menuSair.addEventListener('click', () => {
                if (confirm('Deseja sair ?')) {
                    showNotification('Saindo...');
                    setTimeout(() => console.log('Usuário saiu'), 1000);
                }
                fecharMenuSair();
            });
        }

        document.addEventListener('click', (e) => {
            if (state.menuAberto && !elements.menuSair.contains(e.target) && 
                !elements.btnConfig.contains(e.target)) {
                fecharMenuSair();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.menuAberto) fecharMenuSair();
        });

        // Controle de visibilidade
        elements.addJogoBtn.addEventListener('click', () => {
            elements.campoNomeJogo.style.display = elements.tiposJogoDiv.style.display = 'block';
        });

        document.addEventListener('change', (e) => {
            if (e.target.name === 'tipo') atualizarVisibilidadeTipoJogo();
            if (e.target.name === 'separar') atualizarVisibilidadeSeparacao();
        });

        // Modo Manual
        if (elements.adicionarTimeBtn) {
            elements.adicionarTimeBtn.addEventListener('click', adicionarTime);
        }

        // Modo Automático
        const configurarBotao = (seletor, callback) => {
            const btn = document.querySelector(seletor);
            if (btn) btn.addEventListener('click', callback);
        };

        configurarBotao('.separador_automatico .btn-adicionar-times', adicionarTimesAuto);
        configurarBotao('.separador_automatico .btn-adicionar-multi', adicionarJogadoresAuto);
        configurarBotao('#separar-jogadores-btn', separarJogadoresAutomaticamente);

        // Modo Individual
        configurarBotao('.individual .btn-adicionar-multi', adicionarJogadoresIndividual);

        // Atalhos Ctrl+Enter
        const configurarAtalho = (seletor, callback) => {
            const element = document.querySelector(seletor);
            if (element) {
                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault();
                        callback();
                    }
                });
            }
        };

        configurarAtalho('.separador_automatico .multi-time-input', adicionarTimesAuto);
        configurarAtalho('.separador_automatico .multi-jogador-input', adicionarJogadoresAuto);
        configurarAtalho('.individual .multi-jogador-input', adicionarJogadoresIndividual);

        // Botões Gerar Jogo
        const btnGerarJogoManual = elements.separadorManual?.querySelector('.gerar_jogo_btn');
        const btnGerarJogoIndividual = document.querySelector('.individual .gerar_jogo_btn');

        if (btnGerarJogoManual) {
            btnGerarJogoManual.addEventListener('click', () => {
                validarEGerarJogo(
                    'manual',
                    () => {
                        const dadosTimes = coletarDadosTimesManuais();
                        if (dadosTimes.length === 0) {
                            showNotification('Adicione pelo menos um time.', 'error');
                            return false;
                        }
                        for (const time of dadosTimes) {
                            if (time.jogadores.length === 0) {
                                showNotification(`O time "${time.nome}" não tem jogadores.`, 'error');
                                return false;
                            }
                        }
                        return true;
                    },
                    () => ({ modo: "manual", times: coletarDadosTimesManuais() })
                );
            });
        }

        if (btnGerarJogoIndividual) {
            btnGerarJogoIndividual.addEventListener('click', () => {
                validarEGerarJogo(
                    'individual',
                    () => {
                        if (state.jogadoresIndividual.length === 0) {
                            showNotification('Adicione pelo menos um jogador.', 'error');
                            return false;
                        }
                        return true;
                    },
                    coletarDadosIndividual
                );
            });
        }
    }

    // ========== INICIALIZAÇÃO ==========
    function inicializar() {
        // Adicionar animações CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-10px); }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);

        inicializarVisibilidade();
        configurarEventListeners();
    }

    // Iniciar aplicação
    inicializar();
});