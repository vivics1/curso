const saldoInicial = 3000;
let saldo = saldoInicial;

const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(valor).replace(/\u00A0/g, ' ');
};

const aplicarTransacao = (saldoAtual: number, tipoTransacao: string, valor: number): number => {
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

const formatarDataParaListagem = (dataString: string): string => {
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

const atualizarSaldoNaTela = (): void => {
    const elementoSaldo = document.querySelector('.saldo-valor .valor');

    if (elementoSaldo) {
        elementoSaldo.textContent = formatarMoeda(saldo);
    }
};

const adicionarTransacaoAoExtrato = (tipoTransacao: string, valor: number, data: string): void => {
    const containerExtrato = document.querySelector('.registro-transacoes');

    if (!containerExtrato) {
        return;
    }

    const item = document.createElement('div');
    item.className = 'transacao-item';

    const valorPositivo = tipoTransacao === 'Depósito';
    const valorFormatado = valorPositivo ? `+${formatarMoeda(valor)}` : `-${formatarMoeda(valor)}`;

    item.innerHTML = `
        <div class="transacao-info">
            <span class="tipo">${tipoTransacao}</span>
            <strong class="valor">${valorFormatado}</strong>
        </div>
        <time class="data">${formatarDataParaListagem(data)}</time>
    `;

    containerExtrato.prepend(item);
};

const inicializarAplicacao = (): void => {
    const elementoFormulario = document.querySelector('.block-nova-transacao form');

    if (!elementoFormulario) {
        return;
    }

    atualizarSaldoNaTela();

    elementoFormulario.addEventListener('submit', (event: Event) => {
        event.preventDefault();

        if (!elementoFormulario.checkValidity()) {
            alert('Por favor, preencha todos os campos da transação!');
            return;
        }

        const inputTipoTransacao = elementoFormulario.querySelector('#tipoTransacao') as HTMLSelectElement | null;
        const inputValor = elementoFormulario.querySelector('#valor') as HTMLInputElement | null;
        const inputData = elementoFormulario.querySelector('#data') as HTMLInputElement | null;

        if (!inputTipoTransacao || !inputValor || !inputData) {
            return;
        }

        const tipoTransacao = inputTipoTransacao.value;
        const valor = Number(inputValor.value);
        const data = inputData.value;

        if (!tipoTransacao || !data || Number.isNaN(valor) || valor <= 0) {
            alert('Verifique os dados da transação.');
            return;
        }

        try {
            saldo = aplicarTransacao(saldo, tipoTransacao, valor);
            adicionarTransacaoAoExtrato(tipoTransacao, valor, data);
            atualizarSaldoNaTela();
            elementoFormulario.reset();
        } catch (erro) {
            if (erro instanceof Error) {
                alert(erro.message);
            }
        }
    });
};

if (typeof document !== 'undefined') {
    inicializarAplicacao();
}

export { aplicarTransacao, formatarMoeda };