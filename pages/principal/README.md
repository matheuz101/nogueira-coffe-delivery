# Página principal / cardápio

Abra `principal.html`. Esta etapa contém HTML e CSS; `principal.js` continua vazio e não é carregado pela página.

## Conteúdo

- Cinco categorias e 34 cards, incluindo o Café Expresso nos destaques e nos cafés.
- Fotos e ícones locais em `../../imgs/`.
- Horário: 08h–17h. Café Expresso: R$ 7,50. Pastéis sortidos: R$ 23,50.
- O card repetido de pastéis foi substituído por Empadas, por R$ 18,00, conforme autorizado.
- As descrições recebidas estão completas nos elementos `data-product-description`. O corte nos cards é apenas visual, por CSS.
- O footer usa as mesmas informações e identidade da home. Redes sociais e contato aguardam seus destinos reais.

## Próxima etapa: JavaScript

Os painéis de usuário e carrinho e o modal de produto são elementos `dialog` dentro desta página, sem novas rotas. Estão fechados por padrão. Os botões ainda não abrem os painéis nem modificam dados.

- `data-open-dialog` e `data-close-dialog`: abrir e fechar painéis, com gerenciamento de foco e bloqueio da rolagem da página ao fundo.
- `data-action="open-product"`: preencher o único `#product-dialog` com nome, foto, preço e descrição completa do card selecionado. Café Mocha é o conteúdo inicial de referência.
- `data-action="add-to-cart"`: adicionar diretamente ao carrinho. O botão “+” e o controle que abre o produto são irmãos; nunca aninhar um dentro do outro nem abrir o modal ao adicionar.
- `data-product-id`: identifica o mesmo produto nos cards, no modal e no carrinho. Os preços numéricos estão em elementos `data`.
- Busca, setas dos destaques, quantidades, remoção, total, finalização, endereço e ações da conta aguardam implementação.
- Login, cadastro, perfil, categorias e home já são links HTML. Delivery/Pick-up usa radios HTML, ainda sem integração com entrega ou retirada.

Os três itens no carrinho são exemplos para revisão visual, não uma sessão de compra. Os preços seguem o cardápio: R$ 18,50 + R$ 23,50 + R$ 14,00 = R$ 56,00. A etapa de JavaScript deverá substituir esses exemplos pelo estado real, começando com um carrinho vazio.

As capturas da página e dos painéis ficam em `../../previews/` com o prefixo `principal-`.
