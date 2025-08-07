// Configuração Google Sheets
const SHEET_ID = '170M0mklac1n3G3fDnKwttzUrAyyQpY7y4H3IChK-5mg';
const API_KEY = 'AIzaSyDYPdEwbUPqRUu_1hhwnQLXoEOVqdSIWBU';
const RANGE = 'Página1!A1:H20';

// Variáveis globais
let cart = {};
let totalItems = 0;
let cartTotal = 0;
let allProducts = [];
let isLoadingProducts = false;
let productsLoaded = false;

// Função para carregar produtos do Google Sheets
async function loadProductsFromSheets() {
    if (productsLoaded || isLoadingProducts) return;
    
    isLoadingProducts = true;
    productsLoaded = true;
    
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        
        const data = await response.json();
        
        if (!data.values || data.values.length <= 1) {
            showFallbackProducts();
            return;
        }
        
        const [headers, ...rows] = data.values;
        
        allProducts = rows
            .filter(row => row.length > 1 && row[0] && row[1])
            .slice(0, 50)
            .map((row, index) => {
                let imagemUrl = row[7] || 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22 style=%22background:%23C4A484%22%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22 font-size=%2218%22%3EProduto Rústico%3C/text%3E%3C/svg%3E';
                
                if (imagemUrl && imagemUrl.includes('drive.google.com')) {
                    let fileId = null;
                    let fileIdMatch = imagemUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
                    if (fileIdMatch) {
                        fileId = fileIdMatch[1];
                    } else if (imagemUrl.includes('open?id=')) {
                        fileIdMatch = imagemUrl.match(/open\?id=([a-zA-Z0-9-_]+)/);
                        if (fileIdMatch) fileId = fileIdMatch[1];
                    } else if (imagemUrl.includes('?id=')) {
                        fileIdMatch = imagemUrl.match(/\?id=([a-zA-Z0-9-_]+)/);
                        if (fileIdMatch) fileId = fileIdMatch[1];
                    }
                    
                    if (fileId) {
                        imagemUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
                    }
                }
                
                return {
                    id: row[0] || (index + 1),
                    nome: row[1] || 'Produto sem nome',
                    preco: row[2] || 'Consulte',
                    medidas: row[3] || 'Consulte',
                    material: row[4] || 'Madeira Rústica',
                    descricao: row[5] || 'Produto artesanal de alta qualidade.',
                    quantidade: parseInt(row[6]) || 1,
                    imagem: imagemUrl
                };
            });
        
        renderProducts(allProducts);
        
    } catch (error) {
        allProducts = [
            {
                id: 1,
                nome: 'Tábua Rústica',
                preco: 'R$ 80,00',
                medidas: '30 x 60 cm',
                material: 'Pinheiro',
                descricao: 'Tábua rústica de madeira de pinheiro, tratada com óleo mineral.',
                imagem: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22 style=%22background:%238B4513%22%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22%3ETábua Rústica%3C/text%3E%3C/svg%3E'
            },
            {
                id: 2,
                nome: 'Lareira Ecológica',
                preco: 'R$ 300,00',
                medidas: '20 x 60 x 50 cm',
                material: 'Carvalho',
                descricao: 'Aquecedor rústico ecológico com pés em ferro e tronco de árvore.',
                imagem: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22 style=%22background:%238B4513%22%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22%3ELareira%3C/text%3E%3C/svg%3E'
            }
        ];
        renderProducts(allProducts);
    } finally {
        isLoadingProducts = false;
    }
}

// Função para renderizar produtos na página
function renderProducts(products) {
    const section = document.querySelector('#produtos');
    if (!section) return;
    
    const existingCards = section.querySelectorAll('.product-card');
    existingCards.forEach(card => card.remove());
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        section.appendChild(productCard);
    });
}

// Função para criar card do produto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <img src="${product.imagem}" alt="${product.nome}" class="product-image"
             onerror="this.onerror=null; this.src='data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22 style=%22background:%23C4A484%22%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22 font-size=%2218%22%3E${product.nome}%3C/text%3E%3C/svg%3E'">
        <div class="product-info">
            <h3 class="product-title">${product.nome}</h3>
            <p class="product-size">${product.medidas}</p>
            <p class="product-material">Material: ${product.material}</p>
            <p class="product-description">${product.descricao}</p>
        </div>
        <div class="product-footer">
            <span class="product-price">${product.preco}</span>
            <button class="add-to-cart" data-product-id="${product.id}">
                <span class="material-symbols-outlined">shopping_cart</span>
            </button>
        </div>
    `;
    
    const addButton = card.querySelector('.add-to-cart');
    addButton.addEventListener('click', () => {
        addToCart(product.id, product.nome, product.preco);
    });
    
    return card;
}

// Função para mostrar produtos estáticos como fallback
function showFallbackProducts() {
    const fallbackProducts = [
        {
            id: 'fallback-1',
            nome: 'Tábua Rústica',
            preco: 'R$ 80,00',
            medidas: '30 x 60 cm',
            descricao: 'Tábua rústica de madeira artesanal, perfeita para servir.',
            'link imagem': 'imagens/3ebb2451-eeb7-4e2b-b179-fab64c649c7d.jpg'
        },
        {
            id: 'fallback-2', 
            nome: 'Lareira Ecológica',
            preco: 'R$ 300,00',
            medidas: '60 x 60 x 100 cm',
            descricao: 'Lareira ecológica artesanal com design rústico.',
            'link imagem': 'imagens/3ebb2451-eeb7-4e2b-b179-fab64c649c7d.jpg'
        }
    ];
    
    allProducts = fallbackProducts;
    renderProducts(fallbackProducts);
}

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
            <img src="${product.image}" alt="${product.name}" class="cart-item-image"
                 onerror="this.onerror=null; this.src='data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%2280%22 style=%22background:%23C4A484%22%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22 font-size=%2212%22%3E${product.name}%3C/text%3E%3C/svg%3E'">
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
        const newQuantity = cart[productId].quantity + change;
        const maxQuantity = cart[productId].maxQuantity;
        
        if (change > 0 && newQuantity > maxQuantity) {
            alert(`Quantidade máxima disponível: ${maxQuantity} unidades`);
            return;
        }
        
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        
        cart[productId].quantity = newQuantity;
        totalItems += change;
        
        const productCard = document.querySelector(`[onclick*="${productId}"]`)?.closest('.product-card');
        if (productCard && productCard.querySelector('.quantity-display')) {
            productCard.querySelector('.quantity-display').textContent = cart[productId].quantity;
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
        
        const productCard = document.querySelector(`[data-product-id="${productId}"]`)?.closest('.product-card');
        if (productCard) {
            const productName = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            const productFooter = productCard.querySelector('.product-footer');
            
            productFooter.innerHTML = `
                <span class="product-price">${productPrice}</span>
                <button class="add-to-cart" data-product-id="${productId}">
                    <span class="material-symbols-outlined">shopping_cart</span>
                </button>
            `;
            
            const addButton = productFooter.querySelector('.add-to-cart');
            addButton.addEventListener('click', () => {
                addToCart(productId, productName, productPrice);
            });
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

// Função para adicionar produto ao carrinho
function addToCart(productId, productName, productPrice) {
    const productData = allProducts.find(p => p.id == productId);
    const maxQuantity = productData ? productData.quantidade : 1;
    
    const addButton = document.querySelector(`[data-product-id="${productId}"]`);
    if (!addButton) return;
    
    const productFooter = addButton.parentElement;
    
    if (!cart[productId]) {
        cart[productId] = {
            name: productName,
            price: productPrice,
            quantity: 1,
            maxQuantity: maxQuantity,
            image: productData ? productData.imagem : 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22 style=%22background:%23C4A484%22%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22 font-size=%2218%22%3E' + productName + '%3C/text%3E%3C/svg%3E'
        };
        totalItems++;
    } else {
        if (cart[productId].quantity < maxQuantity) {
            cart[productId].quantity++;
            totalItems++;
        } else {
            alert(`Quantidade máxima disponível: ${maxQuantity} unidades`);
            return;
        }
    }
    
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
    const maxQuantity = cart[productId].maxQuantity;
    
    if (cart[productId].quantity < maxQuantity) {
        cart[productId].quantity++;
        totalItems++;
        
        const productFooter = document.querySelector(`[data-product-id="${productId}"]`).closest('.product-footer');
        const quantityDisplay = productFooter.querySelector('.quantity-display');
        quantityDisplay.textContent = cart[productId].quantity;
        
        updateCartCounter();
        updateCartTotal();
    } else {
        alert(`Quantidade máxima disponível: ${maxQuantity} unidades`);
    }
}

// Função para diminuir quantidade
function decreaseQuantity(productId, productPrice) {
    if (cart[productId].quantity > 1) {
        cart[productId].quantity--;
        totalItems--;
        
        const productFooter = document.querySelector(`[data-product-id="${productId}"]`).closest('.product-footer');
        const quantityDisplay = productFooter.querySelector('.quantity-display');
        quantityDisplay.textContent = cart[productId].quantity;
    } else {
        const productName = cart[productId].name;
        
        delete cart[productId];
        totalItems--;
        
        const productFooter = document.querySelector(`[data-product-id="${productId}"]`).closest('.product-footer');
        productFooter.innerHTML = `
            <span class="product-price">${productPrice}</span>
            <button class="add-to-cart" data-product-id="${productId}">
                <span class="material-symbols-outlined">shopping_cart</span>
            </button>
        `;
        
        const addButton = productFooter.querySelector('.add-to-cart');
        addButton.addEventListener('click', () => {
            addToCart(productId, productName, productPrice);
        });
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

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (!productsLoaded) {
        loadProductsFromSheets();
    }
    
    const searchInput = document.querySelector('.input-busca');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    
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
            
            const message = generateWhatsAppMessage(nomeCliente, telefoneCliente);
            const whatsappNumber = '5551984436030';
            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            
            window.open(whatsappURL, '_blank');
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
    
    if (allProducts.length > 0) {
        const filteredProducts = allProducts.filter(product => {
            const productName = removeAccents(product.nome.toLowerCase());
            return productName.includes(searchTerm) || searchTerm === '';
        });
        renderProducts(filteredProducts);
    } else {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(function(card) {
            const productTitle = card.querySelector('.product-title');
            
            if (productTitle) {
                const titleText = removeAccents(productTitle.textContent.toLowerCase());
                
                if (titleText.includes(searchTerm) || searchTerm === '') {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            }
        });
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

// Função para abrir WhatsApp com mensagem de contato personalizada
function openWhatsAppContact() {
    const message = "Olá, gostaria de informações e solicitar um produto da Russo Rústicos personalizado!";
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '5551984436030';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
}
