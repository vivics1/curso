const saldoInicial = 3000;
let saldo = saldoInicial;
let saldoVisivel = true;

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor).replace(/\u00A0/g, ' ');
};

const aplicarTransacao = (saldoAtual, tipoTransacao, valor) => {
  const valorNumerico = Number(valor);

  if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
    throw new Error('O valor da transação deve ser maior que zero.');
  }

  if (tipoTransacao === 'Depósito') {
    return saldoAtual + valorNumerico;
  }

  if (tipoTransacao === 'Transferência' || tipoTransacao === 'Pagamento de Boleto') {
    return saldoAtual - valorNumerico;
  }

  throw new Error('Tipo de transação inválida.');
};

const formatarDataParaListagem = (dataString) => {
  if (!dataString) {
    return '—';
  }

  const data = new Date(`${dataString}T00:00:00`);

  if (Number.isNaN(data.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(data);
};

const formatarDataParaInput = (data = new Date()) => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

const atualizarSaldoNaTela = () => {
  const elementoSaldo = document.querySelector('.saldo-valor .valor');
  const botaoToggle = document.querySelector('#toggle-saldo');

  if (elementoSaldo) {
    elementoSaldo.textContent = saldoVisivel ? formatarMoeda(saldo) : 'R$ ••••••';
  }

  if (botaoToggle) {
    const status = saldoVisivel ? 'Ocultar saldo' : 'Mostrar saldo';
    botaoToggle.setAttribute('aria-label', status);
    botaoToggle.title = status;
  }
};

const atualizarDataAtual = () => {
  const elementoData = document.querySelector('#data-atual');

  if (!elementoData) {
    return;
  }

  const hoje = new Date();
  elementoData.textContent = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(hoje);
};

const mostrarMensagem = (tipo, texto) => {
  const elementoMensagem = document.querySelector('#mensagem-feedback');

  if (!elementoMensagem) {
    return;
  }

  elementoMensagem.classList.remove('sucesso', 'erro');
  elementoMensagem.classList.add(tipo);
  elementoMensagem.textContent = texto;
  elementoMensagem.hidden = false;

  window.clearTimeout(elementoMensagem.timeoutId);
  elementoMensagem.timeoutId = window.setTimeout(() => {
    elementoMensagem.hidden = true;
    elementoMensagem.textContent = '';
  }, 2800);
};

const formatarMesParaGrupo = (dataString) => {
  if (!dataString) {
    return '—';
  }

  const data = new Date(`${dataString}T00:00:00`);

  if (Number.isNaN(data.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(data).replace(/^./, (letra) => letra.toLocaleUpperCase('pt-BR'));
};

const adicionarTransacaoAoExtrato = (tipoTransacao, valor, data) => {
  const containerExtrato = document.querySelector('.registro-transacoes');

  if (!containerExtrato) {
    return;
  }

  const grupoMes = formatarMesParaGrupo(data);
  let grupo = containerExtrato.querySelector(`.transacoes-group[data-mes="${grupoMes}"]`);

  if (!grupo) {
    grupo = document.createElement('div');
    grupo.className = 'transacoes-group';
    grupo.dataset.mes = grupoMes;

    const cabecalho = document.createElement('strong');
    cabecalho.className = 'mes-group';
    cabecalho.textContent = grupoMes;

    grupo.appendChild(cabecalho);
    containerExtrato.prepend(grupo);
  }

  const item = document.createElement('div');
  item.className = 'transacao-item';

  const icone = document.createElement('span');
  icone.className = `transaction-icon ${tipoTransacao === 'Depósito' ? 'deposit-icon' : 'transfer-icon'}`;
  icone.setAttribute('aria-hidden', 'true');
  icone.textContent = tipoTransacao === 'Depósito' ? '+' : '↗';

  const informacoes = document.createElement('div');
  informacoes.className = 'transacao-info';

  const tipo = document.createElement('span');
  tipo.className = 'tipo';
  tipo.textContent = tipoTransacao;

  const dataFormatada = document.createElement('time');
  dataFormatada.className = 'data';
  dataFormatada.dateTime = data;
  dataFormatada.textContent = formatarDataParaListagem(data);

  const valorPositivo = tipoTransacao === 'Depósito';
  const valorFormatado = valorPositivo ? `+${formatarMoeda(valor)}` : `-${formatarMoeda(valor)}`;
  const valorElemento = document.createElement('strong');
  valorElemento.className = `valor ${valorPositivo ? 'positive-value' : 'negative'}`;
  valorElemento.textContent = valorFormatado;

  informacoes.append(tipo, dataFormatada);
  item.append(icone, informacoes, valorElemento);

  grupo.prepend(item);
};

const configurarSeletorTransacao = (elementoFormulario) => {
  const seletor = elementoFormulario.querySelector('.transaction-type-select');
  const inputTipo = elementoFormulario.querySelector('#tipoTransacao');

  if (!seletor || !inputTipo) {
    return;
  }

  const botao = seletor.querySelector('.type-select-trigger');
  const lista = seletor.querySelector('[role="listbox"]');
  const opcoes = Array.from(seletor.querySelectorAll('[role="option"]'));
  const textoSelecionado = seletor.querySelector('.type-select-copy');

  if (!botao || !lista || !textoSelecionado || opcoes.length === 0) {
    return;
  }

  const fecharLista = (devolverFoco = false) => {
    lista.hidden = true;
    botao.setAttribute('aria-expanded', 'false');

    if (devolverFoco) {
      botao.focus();
    }
  };

  const abrirLista = (opcaoInicial = null) => {
    lista.hidden = false;
    botao.setAttribute('aria-expanded', 'true');
    const indiceSelecionado = opcoes.findIndex((opcao) => opcao.dataset.value === inputTipo.value);
    const indiceFoco = opcaoInicial ?? (indiceSelecionado >= 0 ? indiceSelecionado : 0);
    opcoes[indiceFoco].focus();
  };

  const atualizarSelecao = () => {
    const opcaoAtual = opcoes.find((opcao) => opcao.dataset.value === inputTipo.value);
    textoSelecionado.textContent = opcaoAtual
      ? opcaoAtual.querySelector('.option-copy strong').textContent
      : 'Selecione uma opção';
    botao.classList.toggle('has-selection', Boolean(opcaoAtual));

    opcoes.forEach((opcao) => {
      opcao.setAttribute('aria-selected', String(opcao === opcaoAtual));
    });
  };

  botao.addEventListener('click', () => {
    if (lista.hidden) {
      abrirLista();
    } else {
      fecharLista();
    }
  });

  botao.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      abrirLista(event.key === 'ArrowUp' ? opcoes.length - 1 : 0);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      abrirLista();
    }
  });

  opcoes.forEach((opcao, indice) => {
    opcao.addEventListener('click', () => {
      inputTipo.value = opcao.dataset.value;
      inputTipo.dispatchEvent(new Event('change', { bubbles: true }));
      atualizarSelecao();
      fecharLista(true);
    });

    opcao.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const direcao = event.key === 'ArrowDown' ? 1 : -1;
        opcoes[(indice + direcao + opcoes.length) % opcoes.length].focus();
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        opcoes[event.key === 'Home' ? 0 : opcoes.length - 1].focus();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        fecharLista(true);
      }
    });
  });

  inputTipo.addEventListener('change', atualizarSelecao);
  seletor.addEventListener('focusout', () => {
    window.setTimeout(() => {
      if (!seletor.contains(document.activeElement)) {
        fecharLista();
      }
    }, 0);
  });

  document.addEventListener('click', (event) => {
    if (!seletor.contains(event.target)) {
      fecharLista();
    }
  });

  atualizarSelecao();
};

const configurarSeletorData = (elementoFormulario) => {
  const seletor = elementoFormulario.querySelector('.date-picker');
  const inputData = elementoFormulario.querySelector('#data');

  if (!seletor || !inputData) {
    return;
  }

  const botao = seletor.querySelector('.date-picker-trigger');
  const calendario = seletor.querySelector('.date-picker-popover');
  const tituloMes = seletor.querySelector('#calendarMonth');
  const diasCalendario = seletor.querySelector('#calendarDays');
  const textoData = seletor.querySelector('.date-picker-copy');
  const textoSelecionada = seletor.querySelector('#calendarSelectedLabel');
  const botaoHoje = seletor.querySelector('#calendarTodayButton');

  if (!botao || !calendario || !tituloMes || !diasCalendario || !textoData || !textoSelecionada || !botaoHoje) {
    return;
  }

  const hoje = new Date();
  const hojeISO = formatarDataParaInput(hoje);
  let mesVisivel = inputData.value
    ? new Date(`${inputData.value.slice(0, 7)}-01T00:00:00`)
    : new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const converterData = (dataString) => {
    if (!dataString || !/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
      return null;
    }

    const [ano, mes, dia] = dataString.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia
      ? data
      : null;
  };

  const formatarDataCompleta = (data) => new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(data);

  const atualizarDataExibida = () => {
    const dataSelecionada = converterData(inputData.value);
    textoData.textContent = dataSelecionada ? formatarDataCompleta(dataSelecionada) : 'Selecione uma data';
    textoSelecionada.textContent = dataSelecionada
      ? `Selecionada: ${formatarDataCompleta(dataSelecionada)}`
      : 'Nenhuma data selecionada';
    botao.classList.toggle('has-selection', Boolean(dataSelecionada));
  };

  const renderizarCalendario = (dataComFoco = null) => {
    tituloMes.textContent = new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(mesVisivel);
    diasCalendario.replaceChildren();

    const primeiroDia = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth(), 1);
    const deslocamento = (primeiroDia.getDay() + 6) % 7;
    const inicio = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth(), 1 - deslocamento);
    const dataSelecionada = inputData.value;

    for (let indice = 0; indice < 42; indice += 1) {
      const diaAtual = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + indice);
      const dataISO = formatarDataParaInput(diaAtual);
      const botaoDia = document.createElement('button');
      botaoDia.type = 'button';
      botaoDia.className = 'calendar-day';
      botaoDia.textContent = String(diaAtual.getDate());
      botaoDia.dataset.date = dataISO;
      botaoDia.setAttribute('role', 'gridcell');
      botaoDia.setAttribute('aria-label', formatarDataCompleta(diaAtual));
      botaoDia.setAttribute('aria-pressed', String(dataISO === dataSelecionada));

      if (diaAtual.getMonth() !== mesVisivel.getMonth()) {
        botaoDia.classList.add('outside-month');
      }
      if (dataISO === hojeISO) {
        botaoDia.classList.add('is-today');
      }
      if (dataISO === dataSelecionada) {
        botaoDia.classList.add('is-selected');
      }

      botaoDia.addEventListener('click', () => {
        inputData.value = dataISO;
        inputData.dispatchEvent(new Event('change', { bubbles: true }));
        atualizarDataExibida();
        fecharCalendario(true);
      });

      botaoDia.addEventListener('keydown', (event) => {
        let deslocamentoDias = 0;
        if (event.key === 'ArrowLeft') deslocamentoDias = -1;
        else if (event.key === 'ArrowRight') deslocamentoDias = 1;
        else if (event.key === 'ArrowUp') deslocamentoDias = -7;
        else if (event.key === 'ArrowDown') deslocamentoDias = 7;
        else if (event.key === 'Home') deslocamentoDias = -((diaAtual.getDay() + 6) % 7);
        else if (event.key === 'End') deslocamentoDias = 6 - ((diaAtual.getDay() + 6) % 7);

        if (deslocamentoDias) {
          event.preventDefault();
          const dataFocada = new Date(diaAtual.getFullYear(), diaAtual.getMonth(), diaAtual.getDate() + deslocamentoDias);
          mesVisivel = new Date(dataFocada.getFullYear(), dataFocada.getMonth(), 1);
          renderizarCalendario(formatarDataParaInput(dataFocada));
        } else if (event.key === 'Escape') {
          event.preventDefault();
          fecharCalendario(true);
        } else if (event.key === 'PageUp' || event.key === 'PageDown') {
          event.preventDefault();
          const movimentoMes = event.key === 'PageUp' ? -1 : 1;
          mesVisivel = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + movimentoMes, 1);
          renderizarCalendario(dataISO);
        }
      });

      diasCalendario.appendChild(botaoDia);
    }

    if (dataComFoco) {
      diasCalendario.querySelector(`[data-date="${dataComFoco}"]`)?.focus();
    }
  };

  const fecharCalendario = (devolverFoco = false) => {
    calendario.hidden = true;
    botao.setAttribute('aria-expanded', 'false');
    if (devolverFoco) {
      botao.focus();
    }
  };

  const abrirCalendario = () => {
    const selecionada = converterData(inputData.value);
    mesVisivel = selecionada
      ? new Date(selecionada.getFullYear(), selecionada.getMonth(), 1)
      : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const dataComFoco = inputData.value || hojeISO;
    renderizarCalendario();
    calendario.hidden = false;
    botao.setAttribute('aria-expanded', 'true');
    diasCalendario.querySelector(`[data-date="${dataComFoco}"]`)?.focus();
  };

  botao.addEventListener('click', () => {
    if (calendario.hidden) {
      abrirCalendario();
    } else {
      fecharCalendario();
    }
  });

  botao.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      abrirCalendario();
    }
  });

  seletor.querySelectorAll('[data-calendar-move]').forEach((botaoMes) => {
    botaoMes.addEventListener('click', () => {
      mesVisivel = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + Number(botaoMes.dataset.calendarMove), 1);
      renderizarCalendario();
    });
  });

  botaoHoje.addEventListener('click', () => {
    inputData.value = hojeISO;
    inputData.dispatchEvent(new Event('change', { bubbles: true }));
    atualizarDataExibida();
    fecharCalendario(true);
  });

  inputData.addEventListener('change', atualizarDataExibida);
  calendario.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      fecharCalendario(true);
    }
  });
  seletor.addEventListener('focusout', () => {
    window.setTimeout(() => {
      if (!seletor.contains(document.activeElement)) {
        fecharCalendario();
      }
    }, 0);
  });
  document.addEventListener('click', (event) => {
    if (!seletor.contains(event.target)) {
      fecharCalendario();
    }
  });

  renderizarCalendario(inputData.value || hojeISO);
  atualizarDataExibida();
};

const inicializarAplicacao = () => {
  const elementoFormulario = document.querySelector('.transaction-panel form, .block-nova-transacao form');

  if (!elementoFormulario) {
    return;
  }

  const inputData = elementoFormulario.querySelector('#data');

  if (inputData && !inputData.value) {
    inputData.value = formatarDataParaInput();
  }

  configurarSeletorTransacao(elementoFormulario);
  configurarSeletorData(elementoFormulario);

  const botaoToggle = document.querySelector('#toggle-saldo');

  if (botaoToggle) {
    botaoToggle.addEventListener('click', () => {
      saldoVisivel = !saldoVisivel;
      atualizarSaldoNaTela();
    });
  }

  atualizarDataAtual();
  atualizarSaldoNaTela();

  elementoFormulario.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!elementoFormulario.checkValidity()) {
      mostrarMensagem('erro', 'Preencha todos os campos da transação para continuar.');
      return;
    }

    const inputTipoTransacao = elementoFormulario.querySelector('#tipoTransacao');
    const inputValor = elementoFormulario.querySelector('#valor');
    const inputData = elementoFormulario.querySelector('#data');

    if (!inputTipoTransacao || !inputValor || !inputData) {
      return;
    }

    const tipoTransacao = inputTipoTransacao.value;
    const valor = Number(inputValor.value);
    const data = inputData.value;

    if (!tipoTransacao || !data || Number.isNaN(valor) || valor <= 0) {
      mostrarMensagem('erro', 'Verifique os dados da transação antes de enviar.');
      return;
    }

    try {
      saldo = aplicarTransacao(saldo, tipoTransacao, valor);
      adicionarTransacaoAoExtrato(tipoTransacao, valor, data);
      atualizarSaldoNaTela();
      elementoFormulario.reset();
      elementoFormulario.querySelector('#tipoTransacao')?.dispatchEvent(new Event('change', { bubbles: true }));
      inputData.value = formatarDataParaInput();
      inputData.dispatchEvent(new Event('change', { bubbles: true }));
      mostrarMensagem('sucesso', 'Transação concluída com sucesso!');
    } catch (erro) {
      mostrarMensagem('erro', erro.message);
    }
  });
};

if (typeof document !== 'undefined') {
  inicializarAplicacao();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { aplicarTransacao, formatarMoeda };
}
