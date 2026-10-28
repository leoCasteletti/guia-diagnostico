const estado = { itens: [], familia: '', busca: '' };

const $ = (seletor) => document.querySelector(seletor);

const normalizar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const lerAnotacao = (id) => {
    try {
        return localStorage.getItem(`anotacao:${id}`) || '';
    } catch {
        return '';
    }
};

const salvarAnotacao = (id, texto) => {
    try {
        localStorage.setItem(`anotacao:${id}`, texto);
    } catch {
    }
};

function textoDeBusca(item) {
    return normalizar([item.titulo, item.familia, ...item.sintomas, ...item.causas, ...item.passos].join(' '));
}

function filtrados() {
    const termos = normalizar(estado.busca).split(/\s+/).filter(Boolean);
    return estado.itens.filter((item) =>
        (!estado.familia || item.familia === estado.familia) &&
        termos.every((t) => item.indice.includes(t))
    );
}

function desenharFamilias() {
    const familias = [...new Set(estado.itens.map((i) => i.familia))].sort();
    const caixa = $('#familias');
    caixa.replaceChildren(...['', ...familias].map((f) => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'btn btn-sm' + (f === estado.familia ? ' ativo' : '');
        botao.textContent = f || 'Todos';
        botao.addEventListener('click', () => {
            estado.familia = f;
            desenharFamilias();
            desenharLista();
        });
        return botao;
    }));
}

function desenharLista() {
    const itens = filtrados();
    const atual = location.hash.slice(1);
    $('#contador').textContent = `${itens.length} de ${estado.itens.length} problemas`;
    $('#lista').replaceChildren(...itens.map((item) => {
        const link = document.createElement('a');
        link.href = `#${item.id}`;
        link.className = 'list-group-item list-group-item-action' + (item.id === atual ? ' active' : '');
        const familia = document.createElement('small');
        familia.textContent = item.familia;
        const titulo = document.createElement('span');
        titulo.textContent = item.titulo;
        link.append(familia, titulo);
        return link;
    }));
}

function preencherLista(lista, textos) {
    lista.replaceChildren(...textos.map((t) => {
        const li = document.createElement('li');
        li.textContent = t;
        return li;
    }));
}

function desenharDetalhe() {
    const item = estado.itens.find((i) => i.id === location.hash.slice(1));
    const detalhe = $('#detalhe');
    if (!item) {
        return;
    }

    const conteudo = $('#modelo-detalhe').content.cloneNode(true);
    conteudo.querySelector('.familia-badge').textContent = item.familia;
    conteudo.querySelector('.titulo').textContent = item.titulo;
    preencherLista(conteudo.querySelector('.sintomas'), item.sintomas);
    preencherLista(conteudo.querySelector('.causas'), item.causas);
    preencherLista(conteudo.querySelector('.passos'), item.passos);
    conteudo.querySelector('.escalar').textContent = `Quando escalar: ${item.escalar}`;

    const anotacao = conteudo.querySelector('#anotacao');
    anotacao.value = lerAnotacao(item.id);
    anotacao.addEventListener('input', () => salvarAnotacao(item.id, anotacao.value));

    detalhe.replaceChildren(conteudo);
    if (window.innerWidth < 992) {
        detalhe.scrollIntoView({ behavior: 'smooth' });
    }
}

async function iniciar() {
    const resposta = await fetch('dados/diagnosticos.json');
    estado.itens = (await resposta.json()).map((i) => ({ ...i, indice: textoDeBusca(i) }));

    $('#busca').addEventListener('input', (e) => {
        estado.busca = e.target.value;
        desenharLista();
    });
    window.addEventListener('hashchange', () => {
        desenharLista();
        desenharDetalhe();
    });

    desenharFamilias();
    desenharLista();
    desenharDetalhe();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
    }
}

iniciar();
