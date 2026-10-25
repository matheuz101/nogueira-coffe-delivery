# Página principal — cardápio

Abra `principal.html` no navegador ou acesse pelo botão de cardápio da home.

Os painéis de usuário, carrinho e detalhes do produto usam `dialog` nativo. Fecham pelo botão, pela tecla Escape e pelo clique no fundo. O foco retorna ao controle de origem e a página mantém sua posição de rolagem. A navegação por categorias continua usando âncoras HTML.

O carrinho permite adicionar produtos pelos cards ou pelos detalhes, alterar quantidades e remover itens. Calcula os valores em centavos, reúne produtos repetidos no cardápio e persiste apenas IDs e quantidades em `localStorage`. Continua funcionando sem persistência quando o armazenamento está bloqueado. O limite é de 99 unidades por produto.

A finalização do pedido está desabilitada e identificada como futura integração. Endereço, favoritos, notificações, saída da conta e áreas administrativa e de entregador continuam com os marcadores `data-action` existentes, aguardando suas respectivas funcionalidades. Gerenciar conta mantém o link para a página de perfil.

Validação no Chrome: telas de 1440, 390 e 320 pixels, abertura e troca de painéis, Escape, navegação pelo teclado, retorno do foco, clique no fundo, preservação da rolagem, detalhes de produtos, totais e remoção do carrinho, persistência após recarregar e ausência de transbordamento horizontal. Também verificar movimento reduzido, armazenamento inválido e armazenamento bloqueado. As capturas visuais ficam em `../../previews/principal-*.png`.
