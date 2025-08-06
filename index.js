// Objeto para armazenar o carrinho
let cart = {};
let totalItems = 0;
let cartTotal = 0;

// Função para alternar a aba do carrinho
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
    
    if (sidebar.classList.contains('open')) {
        renderCartItems();
    }
}

// Função para renderizar itens do carrinho na aba
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = '';
    
    if (Object.keys(cart).length === 0) {
        cartItemsContainer.innerHTML = '<p style="color: rgba(255, 255, 255, 0.7); text-align: center; padding: 40px; font-family: \'Darker Grotesque\', sans-serif;">Seu carrinho está vazio</p>';
        return;
    }
    
    for (const productId in cart) {
        const product = cart[productId];
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <img src="imagens/3ebb2451-eeb7-4e2b-b179-fab64c649c7d.jpg" alt="${product.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${product.name}</h4>
                <p class="cart-item-price">${product.price}</p>
            </div>
            <div class="cart-item-controls">
                <div class="cart-quantity-controls">
                    <button class="cart-quantity-btn" onclick="changeCartQuantity('${productId}', -1)">-</button>
                    <span class="cart-quantity-display">${product.quantity}</span>
                    <button class="cart-quantity-btn" onclick="changeCartQuantity('${productId}', 1)">+</button>
                </div>
                <button class="cart-remove-btn" onclick="removeFromCart('${productId}')">×</button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    }
    
    updateCartTotal();
}

// Função para alterar quantidade no carrinho lateral
function changeCartQuantity(productId, change) {
    if (cart[productId]) {
        cart[productId].quantity += change;
        totalItems += change;
        
        if (cart[productId].quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        
        // Atualizar display do produto no card se existir
        const productFooter = document.querySelector(`[onclick*="${productId}"]`)?.closest('.product-footer');
        if (productFooter && productFooter.querySelector('.quantity-display')) {
            productFooter.querySelector('.quantity-display').textContent = cart[productId].quantity;
        }
        
        renderCartItems();
        updateCartCounter();
    }
}

// Função para remover produto do carrinho
function removeFromCart(productId) {
    if (cart[productId]) {
        totalItems -= cart[productId].quantity;
        delete cart[productId];
        
        // Voltar botão do card para estado original se existir
        const productFooter = document.querySelector(`[onclick*="${productId}"]`)?.closest('.product-footer');
        if (productFooter) {
            const product = productFooter.closest('.product-card');
            const productName = product.querySelector('.product-title').textContent;
            const productPrice = product.querySelector('.product-price').textContent;
            
            productFooter.innerHTML = `
                <span class="product-price">${productPrice}</span>
                <button class="add-to-cart" data-product-id="${productId}" onclick="addToCart('${productId}', '${productName}', '${productPrice}')">
                    <span class="material-symbols-outlined">shopping_cart</span>
                </button>
            `;
        }
        
        renderCartItems();
        updateCartCounter();
    }
}

// Função para calcular e atualizar total do carrinho
function updateCartTotal() {
    cartTotal = 0;
    
    for (const productId in cart) {
        const product = cart[productId];
        const priceValue = parseFloat(product.price.replace('R$ ', '').replace(',', '.'));
        cartTotal += priceValue * product.quantity;
    }
    
    document.getElementById('cartTotal').textContent = `R$ ${cartTotal.toFixed(2).replace('.', ',')}`;
}

// Função para alternar descrição dos produtos
function toggleDescription(descId, button) {
    const description = document.getElementById(descId);
    const isCollapsed = description.classList.contains('collapsed');
    
    if (isCollapsed) {
        description.classList.remove('collapsed');
        button.textContent = 'Ler menos';
    } else {
        description.classList.add('collapsed');
        button.textContent = 'Ler mais';
    }
}

// Função para adicionar produto ao carrinho
function addToCart(productId, productName, productPrice) {
    const addButton = document.querySelector(`[data-product-id="${productId}"]`);
    const productFooter = addButton.parentElement;
    
    if (!cart[productId]) {
        cart[productId] = {
            name: productName,
            price: productPrice,
            quantity: 1
        };
        totalItems++;
    } else {
        cart[productId].quantity++;
        totalItems++;
    }
    
    // Substituir botão por controles de quantidade
    productFooter.innerHTML = `
        <span class="product-price">${productPrice}</span>
        <div class="quantity-controls">
            <button class="quantity-btn minus" onclick="decreaseQuantity('${productId}', '${productPrice}')">-</button>
            <span class="quantity-display">${cart[productId].quantity}</span>
            <button class="quantity-btn plus" onclick="increaseQuantity('${productId}', '${productPrice}')">+</button>
        </div>
    `;
    
    updateCartCounter();
    updateCartTotal();
}

// Função para aumentar quantidade
function increaseQuantity(productId, productPrice) {
    cart[productId].quantity++;
    totalItems++;
    
    // Encontrar o elemento correto
    const productFooter = document.querySelector(`button[onclick*="${productId}"]`).closest('.product-footer');
    const quantityDisplay = productFooter.querySelector('.quantity-display');
    quantityDisplay.textContent = cart[productId].quantity;
    
    updateCartCounter();
    updateCartTotal();
}

// Função para diminuir quantidade
function decreaseQuantity(productId, productPrice) {
    if (cart[productId].quantity > 1) {
        cart[productId].quantity--;
        totalItems--;
        
        // Encontrar o elemento correto
        const productFooter = document.querySelector(`button[onclick*="${productId}"]`).closest('.product-footer');
        const quantityDisplay = productFooter.querySelector('.quantity-display');
        quantityDisplay.textContent = cart[productId].quantity;
    } else {
        // Salvar nome do produto antes de remover
        const productName = cart[productId].name;
        
        // Remover do carrinho e voltar ao botão original
        delete cart[productId];
        totalItems--;
        
        // Encontrar o elemento correto
        const productFooter = document.querySelector(`button[onclick*="${productId}"]`).closest('.product-footer');
        productFooter.innerHTML = `
            <span class="product-price">${productPrice}</span>
            <button class="add-to-cart" data-product-id="${productId}" onclick="addToCart('${productId}', '${productName}', '${productPrice}')">
                <span class="material-symbols-outlined">shopping_cart</span>
            </button>
        `;
    }
    
    updateCartCounter();
    updateCartTotal();
}

// Função para atualizar contador do carrinho
function updateCartCounter() {
    const cartIcon = document.querySelector('.cart-icon-search');
    
    if (totalItems > 0) {
        if (!cartIcon.querySelector('.cart-counter')) {
            const counter = document.createElement('div');
            counter.className = 'cart-counter';
            counter.textContent = totalItems;
            cartIcon.appendChild(counter);
        } else {
            cartIcon.querySelector('.cart-counter').textContent = totalItems;
        }
    } else {
        const counter = cartIcon.querySelector('.cart-counter');
        if (counter) {
            counter.remove();
        }
    }
}

// Verificar se as descrições precisam do botão "Ler mais"
document.addEventListener('DOMContentLoaded', function() {
    const descriptions = document.querySelectorAll('.product-description');
    
    descriptions.forEach(function(desc, index) {
        const button = desc.nextElementSibling;
        
        // Verificar se o texto ultrapassa a altura limite
        const tempDiv = desc.cloneNode(true);
        tempDiv.classList.remove('collapsed');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.height = 'auto';
        document.body.appendChild(tempDiv);
        
        if (tempDiv.scrollHeight > 60) {
            button.style.display = 'block';
        }
        
        document.body.removeChild(tempDiv);
    });
    
    // Adicionar evento de busca ao input
    const searchInput = document.querySelector('.input-busca');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    
    // Adicionar evento de filtro por categoria
    const categorySelect = document.querySelector('.select-categoria');
    if (categorySelect) {
        categorySelect.addEventListener('change', filterByCategory);
    }
    
    // Adicionar event listener para o formulário de finalização
    const finalizarForm = document.getElementById('finalizarForm');
    if (finalizarForm) {
        finalizarForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nomeCliente = document.getElementById('nomeCliente').value.trim();
            const telefoneCliente = document.getElementById('telefoneCliente').value.trim();
            
            if (!nomeCliente || !telefoneCliente) {
                alert('Por favor, preencha todos os campos!');
                return;
            }
            
            // Gerar mensagem
            const message = generateWhatsAppMessage(nomeCliente, telefoneCliente);
            
            // Criar link do WhatsApp
            const whatsappNumber = '5551984436030';
            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            
            // Abrir WhatsApp
            window.open(whatsappURL, '_blank');
            
            // Fechar modal
            closeModal();
        });
    }
});

// Função para remover acentos de uma string
function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Função para filtrar produtos pela busca
function filterProducts() {
    const searchTerm = removeAccents(document.querySelector('.input-busca').value.toLowerCase());
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(function(card) {
        const productTitle = card.querySelector('.product-title');
        
        if (productTitle) {
            const titleText = removeAccents(productTitle.textContent.toLowerCase());
            
            if (titleText.startsWith(searchTerm) || searchTerm === '') {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// Função para filtrar por categoria
function filterByCategory() {
    const selectedCategory = document.querySelector('.select-categoria').value;
    
    // Encontrar todas as seções de produtos
    const tabusSection = document.querySelector('section > div:nth-child(2)');
    const mesasSection = document.querySelector('section > div:nth-child(3)');
    const lareirasSection = document.querySelector('section > div:nth-child(4)');
    const luminariasSection = document.querySelector('section > div:nth-child(5)');
    
    // Resetar - mostrar todas as seções
    if (tabusSection) tabusSection.style.display = 'block';
    if (mesasSection) mesasSection.style.display = 'block';
    if (lareirasSection) lareirasSection.style.display = 'block';
    if (luminariasSection) luminariasSection.style.display = 'block';
    
    // Filtrar baseado na categoria selecionada
    if (selectedCategory === 'tabuas') {
        if (mesasSection) mesasSection.style.display = 'none';
        if (lareirasSection) lareirasSection.style.display = 'none';
        if (luminariasSection) luminariasSection.style.display = 'none';
    } else if (selectedCategory === 'mesas') {
        if (tabusSection) tabusSection.style.display = 'none';
        if (lareirasSection) lareirasSection.style.display = 'none';
        if (luminariasSection) luminariasSection.style.display = 'none';
    } else if (selectedCategory === 'decoracao') {
        if (tabusSection) tabusSection.style.display = 'none';
        if (mesasSection) mesasSection.style.display = 'none';
        if (luminariasSection) luminariasSection.style.display = 'none';
    } else if (selectedCategory === 'iluminacao') {
        if (tabusSection) tabusSection.style.display = 'none';
        if (mesasSection) mesasSection.style.display = 'none';
        if (lareirasSection) lareirasSection.style.display = 'none';
    }
}

// Funções do Modal de Finalização
function openModal() {
    if (Object.keys(cart).length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    const modal = document.getElementById('finalizarModal');
    const overlay = document.getElementById('modalOverlay');
    
    modal.classList.add('show');
    overlay.classList.add('show');
    
    // Focar no primeiro input
    setTimeout(() => {
        document.getElementById('nomeCliente').focus();
    }, 300);
}

function closeModal() {
    const modal = document.getElementById('finalizarModal');
    const overlay = document.getElementById('modalOverlay');
    
    modal.classList.remove('show');
    overlay.classList.remove('show');
    
    // Limpar formulário
    document.getElementById('finalizarForm').reset();
}

// Função para gerar mensagem do WhatsApp
function generateWhatsAppMessage(nomeCliente, telefoneCliente) {
    let message = `Olá, estou finalizando meu pedido pelo site!\n\n`;
    message += `${nomeCliente}\n`;
    message += `${telefoneCliente}\n\n`;
    
    // Adicionar produtos do carrinho
    for (const productId in cart) {
        const product = cart[productId];
        
        try {
            // Buscar detalhes do produto no DOM
            let productCard = document.querySelector(`[data-product-id="${productId}"]`);
            
            // Se não encontrar pelo data-product-id, tentar buscar o botão que pode ter mudado
            if (!productCard) {
                const buttons = document.querySelectorAll('button[onclick*="' + productId + '"]');
                if (buttons.length > 0) {
                    productCard = buttons[0].closest('.product-card');
                }
            } else {
                productCard = productCard.closest('.product-card');
            }
            
            let size = '';
            let material = '';
            let description = '';
            
            if (productCard) {
                const sizeElement = productCard.querySelector('.product-size');
                const materialElement = productCard.querySelector('.product-material');
                const descElement = productCard.querySelector('.product-description');
                
                size = sizeElement ? sizeElement.textContent.trim() : '';
                material = materialElement ? materialElement.textContent.trim() : '';
                description = descElement ? descElement.textContent.trim() : '';
            }
            
            message += `*${product.name}*\n`;
            message += `*Tamanho:* ${size}\n`;
            message += `*Material:* ${material}\n`;
            message += `*Descrição:* ${description}\n`;
            message += `*Valor do item:* ${product.price}\n`;
            message += `*Quantidade:* ${product.quantity}\n\n`;
            
        } catch (error) {
            // Fallback simples
            message += `*${product.name}*\n`;
            message += `*Tamanho:* \n`;
            message += `*Material:* \n`;
            message += `*Descrição:* \n`;
            message += `*Valor do item:* ${product.price}\n`;
            message += `*Quantidade:* ${product.quantity}\n\n`;
        }
    }
    
    // Calcular e adicionar total
    let total = 0;
    for (const productId in cart) {
        const product = cart[productId];
        const priceValue = parseFloat(product.price.replace('R$', '').replace(' ', '').replace(',', '.'));
        total += priceValue * product.quantity;
    }
    
    message += `*Total da compra:* R$ ${total.toFixed(2).replace('.', ',')}`;
    
    return message;
}
