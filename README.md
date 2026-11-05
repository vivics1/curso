# ERP para Revenda de Veículos

Sistema de linha de comando em C para gerenciar clientes, estoque de veículos e vendas de uma revenda.

## Funcionalidades

- Cadastro, consulta e exclusão lógica de clientes.
- Cadastro e pesquisa de veículos, controle de estoque e atualização de preços.
- Registro de vendas com forma de pagamento, desconto, entrada e cálculo de lucro.
- Relatório resumido de estoque, faturamento e resultados.
- Persistência local em arquivos `.dat` no diretório de execução.

## Requisitos

- Compilador C compatível com C99 (por exemplo, GCC).
- GNU Make para usar os comandos abaixo.

## Compilar e executar

```sh
make
./erp
```

No Windows, execute `erp.exe` após compilar. Para remover os arquivos gerados:

```sh
make clean
```

## Organização do código

- `main.c`: menus e fluxo da aplicação.
- `cliente.c` / `cliente.h`: TAD de clientes.
- `veiculo.c` / `veiculo.h`: TAD de veículos.
- `venda.c` / `venda.h`: TAD de vendas.
- `colecao.c` / `colecao.h`: TAD centralizado para armazenamento dinâmico e persistência das coleções.
- `util.c` / `util.h`: leitura e validação de entradas do terminal.
