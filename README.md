# Pizzaria Express - Sistema de Gestão de Pedidos

Uma aplicação Full Stack desenvolvida para o gerenciamento de pedidos de uma pizzaria. O projeto conta com uma interface dinâmica no Front-end e uma API RESTful no Back-end, destacando-se pela implementação de um sistema de fila inteligente para o controle da cozinha.

Projeto desenvolvido como trabalho final da disciplina de Programação Para a Internet I.

## Tecnologias Utilizadas
- **Front-end:** HTML5, CSS3, JavaScript (Vanilla DOM)
- **Back-end:** Node.js, Express.js
- **Banco de Dados:** PostgreSQL (via Neon)
- **Hospedagem:** Vercel (Serverless)

## Principais Funcionalidades
- **Fila Automatizada:** Regra de negócio no servidor que gerencia os status (`Preparando`, `Em espera`, `Saiu para entrega`, `Entregue`) de forma autônoma, otimizando o fluxo da cozinha.
- **Integração de API:** Utilização dos métodos HTTP (`GET`, `POST`, `PATCH`, `DELETE`) para o ciclo de vida completo do pedido.
- **Ordenação no Servidor:** Filtragem de pedidos por preço ou ordem cronológica processada diretamente no banco de dados.
- **Validação de Dados:** Prevenção de envios incorretos com validações aplicadas tanto no lado do cliente quanto no servidor.
- **Tema Dinâmico:** Utilização da API de Local Storage do navegador para salvar a preferência de interface do usuário (Light/Dark Mode).
