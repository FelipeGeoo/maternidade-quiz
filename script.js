// State
const state = {
    produtos_escolhidos: [],
    quantidades: {},
    cor_principal: '',
    cor_detalhe: '',
    estilo_bordado: '',
    nome_bebe: '',
    };

const productPrices = {
    "Mala de Rodinhas": 249.90,
    "Bolsa Grande": 189.90,
    "Bolsa Média": 139.90,
    "Mochila": 209.90,
    "Trocador": 40.00,
    "Trocador (Com Bordado)": 40.00,
    "Necessaire": 69.90,
    "Porta Cartão de Vacinas": 59.90,
    "Saquinhos Organizadores": 35.00
};

function updateTotal() {
    let total = state.produtos_escolhidos.reduce((sum, item) => {
        const qty = state.quantidades[item] || 1;
        return sum + ((productPrices[item] || 0) * qty);
    }, 0);
    
    // Add extra fee for Kit Encanto (third hardware option)
    if (state.cor_detalhe === 'Kit Encanto: Argola Premium + Laço com Acabamento Metálico + Zíper Perfurado') {
        total += 25.00;
    }
    
    const totalElement = document.getElementById('total-price');
    const totalContainer = document.getElementById('total-container');
    
    if (totalElement && totalContainer) {
        totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        if (total > 0) {
            totalContainer.classList.remove('hidden-total');
        } else {
            totalContainer.classList.add('hidden-total');
        }
    }
}

// Map step index to total steps for progress bar logic
const totalStepsForProgress = 6; 
let currentStep = 1;

function getProgressStep(actualStep) {
    // We map the actual steps to a progress fraction.
    // 2=1, 3=2, 4=3, 5=4, 6=5, 7=6, 8=final
    if (actualStep === 1) return 0;
    if (actualStep === 8) return totalStepsForProgress;
    if (actualStep === 7) return 6;
    if (actualStep === 6) return 5;
    if (actualStep === 5) return 4;
    if (actualStep === 4) return 3;
    if (actualStep === 3) return 2;
    if (actualStep === 2) return 1;
    return 0;
}

function toggleSelection(item, element) {
    element.classList.toggle('selected');
    const index = state.produtos_escolhidos.indexOf(item);
    
    if (index === -1) {
        state.produtos_escolhidos.push(item);
        if (item === 'Saquinhos Organizadores') {
            state.quantidades[item] = 1;
            document.getElementById('qty-Saquinhos').innerText = '1';
        }
    } else {
        state.produtos_escolhidos.splice(index, 1);
        if (item === 'Saquinhos Organizadores') {
            state.quantidades[item] = 0;
        }
    }
    
    updateTotal();
    
    // Enable or disable the "Avançar" button based on selections
    const btn = document.getElementById('btn-next-step2');
    if (btn) {
        btn.disabled = state.produtos_escolhidos.length === 0;
    }
}

function changeQuantity(event, item, delta) {
    event.stopPropagation(); // Previne fechar o card
    
    if (!state.produtos_escolhidos.includes(item)) return;
    
    let currentQty = state.quantidades[item] || 1;
    currentQty += delta;
    
    if (currentQty <= 0) {
        const element = event.target.closest('.option-list-item');
        toggleSelection(item, element);
        return;
    }
    
    state.quantidades[item] = currentQty;
    document.getElementById('qty-Saquinhos').innerText = currentQty;
    updateTotal();
}

function updateProgress() {
    const progContainer = document.getElementById('progress-container');
    if (currentStep === 1 || currentStep === 8) {
        progContainer.classList.add('hidden');
    } else {
        progContainer.classList.remove('hidden');
        let progStep = getProgressStep(currentStep);
        const percentage = (progStep / totalStepsForProgress) * 100;
        document.getElementById('progress-fill').style.width = `${Math.min(percentage, 100)}%`;
        document.getElementById('progress-text').innerText = `${progStep}/${totalStepsForProgress}`;
    }
}

function nextStep(step) {
    document.querySelector('.step.active').classList.remove('active');
    document.getElementById(`step-${step}`).classList.add('active');
    currentStep = step;
    updateProgress();
    
    // Rola para o topo da página suavemente ao trocar de etapa
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (step === 8) {
        generateSummary();
    }
}

function selectOption(key, value, nextStepNum) {
    state[key] = value;
    
    // Update preview names in step 7 dynamically
    if (key === 'nome_bebe' || currentStep === 7) {
         const previews = document.querySelectorAll('.preview-name');
         previews.forEach(p => p.innerText = state.nome_bebe || 'Nome');
    }

    // Logic for step 5
    if (key === 'estilo_bordado' && value === 'Sem Bordado (Apenas Lisa)') {
        nextStepNum = 8; // Jump to final step
    }

    nextStep(nextStepNum);
}

function selectHardwareOption(element, value) {
    // Remove selected class from all hardware options
    const options = document.querySelectorAll('#hardware-options .option-text');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Add selected class to the clicked one
    element.classList.add('selected');
    
    // Save to state
    state.cor_detalhe = value;
    
    // Update dynamic image
    const detailImg = document.getElementById('hardware-detail-img');
    if (detailImg) {
        if (value === 'Kit Essencial: Argola + Laço com acabamento costurado + Zíper com banho dourado') {
            detailImg.src = "media__1781370902653.png";
            detailImg.style.objectFit = "cover";
            detailImg.style.objectPosition = "center";
            detailImg.style.transform = "none"; 
        } else if (value === 'Kit Elegância: Feixe + Laço com acabamento costurado + Zíper com Banho Dourado') {
            detailImg.src = "media__1781371061362.png";
            detailImg.style.objectFit = "cover";
            detailImg.style.objectPosition = "center";
            detailImg.style.transform = "none";
        } else if (value === 'Kit Encanto: Argola Premium + Laço com Acabamento Metálico + Zíper Perfurado') {
            detailImg.src = "media__1781371551871.png";
            detailImg.style.objectFit = "cover";
            detailImg.style.objectPosition = "center";
            detailImg.style.transform = "none";
        } else {
            // Fallback default
            detailImg.src = "media__1781025903501.jpg";
            detailImg.style.objectFit = "cover";
            detailImg.style.objectPosition = "center";
            detailImg.style.transform = "none";
        }
    }
    
    // Enable the next button
    const btn = document.getElementById('btn-next-step4');
    if(btn) btn.disabled = false;
    
    // Update the total price to reflect the possible addition of the hardware kit
    updateTotal();
}

function advanceFromStep4() {
    if(state.cor_detalhe) {
        nextStep(6);
    }
}

function toggleNoName() {
    const opt = document.getElementById('opt-no-name');
    const input = document.getElementById('nome_bebe');
    
    opt.classList.toggle('selected');
    
    if (opt.classList.contains('selected')) {
        input.value = '';
        input.disabled = true;
    } else {
        input.disabled = false;
    }
    checkInput();
}

function checkInput() {
    const input = document.getElementById('nome_bebe');
    const btn = document.getElementById('btn-next-name');
    const opt = document.getElementById('opt-no-name');
    const noNameSelected = opt && opt.classList.contains('selected');
    
    btn.disabled = (input.value.trim() === '' && !noNameSelected);
}

function saveNameAndNext() {
    const input = document.getElementById('nome_bebe');
    const opt = document.getElementById('opt-no-name');
    const noNameSelected = opt && opt.classList.contains('selected');

    if (noNameSelected) {
        state.nome_bebe = 'Apenas desenho ou sem nome para bordar';
        nextStep(8); // Go to summary
    } else {
        const name = input.value.trim();
        if (name) {
            state.nome_bebe = name;
            const previews = document.querySelectorAll('.preview-name');
            previews.forEach(p => p.innerText = name);
            nextStep(8);
        }
    }
}

function generateSummary() {
    const summaryEl = document.getElementById('summary-text');
    
    const produtosTextArray = state.produtos_escolhidos.map(item => {
        if (state.quantidades[item] && state.quantidades[item] > 1) {
            return `${state.quantidades[item]}x ${item}`;
        }
        return item;
    });
    const produtosText = produtosTextArray.join(', ');
    
    let text = `Que escolha impecável! ✨<br><br>As suas peças (<strong>${produtosText}</strong>) serão produzidas em <strong>${state.cor_principal}</strong>, com detalhes requintados em <strong>${state.cor_detalhe}</strong> e pequenos detalhes secundários em <strong>${state.cor_secundaria || 'Padrão'}</strong>.`;
    
    if (state.estilo_bordado !== 'Sem Bordado (Apenas Lisa)') {
        if (state.nome_bebe === 'Apenas desenho ou sem nome para bordar') {
            text += ` A arte escolhida foi <strong>${state.estilo_bordado}</strong> (sem nome bordado).`;
        } else {
            text += ` A arte escolhida foi <strong>${state.estilo_bordado}</strong> e a personalização será com o nome <strong>${state.nome_bebe}</strong>.`;
        }
    } else {
        text += ` Você optou por peças elegantes <strong>Sem Bordado (Apenas Lisa)</strong>.`;
    }
    
    const total = state.produtos_escolhidos.reduce((sum, item) => sum + ((productPrices[item] || 0) * (state.quantidades[item] || 1)), 0);
    text += `<br><br><strong>Valor Total do Kit:</strong> R$ ${total.toFixed(2).replace('.', ',')}`;
    
    summaryEl.innerHTML = text;
}

function sendToWhatsapp() {
    const phoneNumber = "5500000000000"; // Replace with user's number
    
    let message = `Olá! Acabei de personalizar minhas peças no Ateliê dos Sonhos! ✨\n\n`;
    
    const produtosTextArray = state.produtos_escolhidos.map(item => {
        if (state.quantidades[item] && state.quantidades[item] > 1) {
            return `${state.quantidades[item]}x ${item}`;
        }
        return item;
    });
    
    message += `*Peças Selecionadas:* ${produtosTextArray.join(', ')}\n`;
    const total = state.produtos_escolhidos.reduce((sum, item) => sum + ((productPrices[item] || 0) * (state.quantidades[item] || 1)), 0);
    message += `*Valor Total:* R$ ${total.toFixed(2).replace('.', ',')}\n\n`;
    message += `*Cor Principal:* ${state.cor_principal}\n`;
    message += `*Detalhes:* ${state.cor_detalhe}\n`;
    if(state.cor_secundaria) message += `*Detalhes Secundários:* ${state.cor_secundaria}\n`;
    message += `*Bordado:* ${state.estilo_bordado}\n`;
    
    if (state.estilo_bordado !== 'Sem Bordado (Apenas Lisa)') {
        if (state.nome_bebe === 'Apenas desenho ou sem nome para bordar') {
            message += `*Nome:* Sem nome (apenas desenho)\n`;
        } else {
            message += `*Nome:* ${state.nome_bebe}\n`;
        }
    }
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function restartQuiz() {
    // Reset state
    state.produtos_escolhidos = [];
    state.quantidades = {};
    state.cor_principal = '';
    state.cor_detalhe = '';
    state.estilo_bordado = '';
    state.nome_bebe = '';
    state.cor_secundaria = '';
    state.estilo_fonte = '';
    
    updateTotal();
    
    // Uncheck items
    document.querySelectorAll('.option-list-item.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('btn-next-step2').disabled = true;
    
    document.getElementById('nome_bebe').value = '';
    document.getElementById('btn-next-name').disabled = true;
    nextStep(1);
}

// Carousel Logic for Tela 3
let currentColorSlideIndex = 0;
const colorsList = [
    { name: "Off-White", subtitle: "Couro Sintético Premium" },
    { name: "Bege Escuro", subtitle: "Couro Sintético Premium" },
    { name: "Caramelo Clássico", subtitle: "Couro Sintético Premium" },
    { name: "Marinho", subtitle: "Couro Sintético Premium" },
    { name: "Linho Bege", subtitle: "Linho sintético Premium" },
    { name: "Linho Marinho", subtitle: "Linho sintético Premium" },
    { name: "Linho Cinza Claro", subtitle: "Linho sintético Premium" },
    { name: "Preto", subtitle: "Courino Sintético Premium" },
    { name: "Rosa Brilhante", subtitle: "Courino Sintético Premium" },
    { name: "Verde", subtitle: "Courino Sintético Premium" },
    { name: "Linho Cinza", subtitle: "Linho Sintético Premium" }
];

function initCarousel() {
    const container = document.getElementById('color-carousel');
    if(!container) return;
    
    container.addEventListener('scroll', () => {
        const slideWidth = container.offsetWidth;
        const scrollPosition = container.scrollLeft;
        if(slideWidth === 0) return;
        
        const newIndex = Math.round(scrollPosition / slideWidth);
        
        if(newIndex !== currentColorSlideIndex && newIndex >= 0 && newIndex < colorsList.length) {
            currentColorSlideIndex = newIndex;
            updateCarouselUI();
        }
    });
    
    updateCarouselUI();
}

function updateCarouselUI() {
    document.querySelectorAll('#color-indicators .dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentColorSlideIndex);
    });
    
    const colorObj = colorsList[currentColorSlideIndex];
    const slideTitle = document.getElementById('slide-title');
    const slideSubtitle = document.getElementById('slide-subtitle');
    
    if (slideTitle) slideTitle.innerText = colorObj.name;
    if (slideSubtitle) slideSubtitle.innerText = colorObj.subtitle;
    
    const prevNum = document.getElementById('side-num-left');
    const nextNum = document.getElementById('side-num-right');
    
    if (prevNum && nextNum) {
        prevNum.innerText = currentColorSlideIndex > 0 ? `0${currentColorSlideIndex}` : '';
        nextNum.innerText = currentColorSlideIndex < colorsList.length - 1 ? `0${currentColorSlideIndex + 2}` : '';
    }
}

function selectColorAndAdvance() {
    const colorName = colorsList[currentColorSlideIndex].name;
    state.cor_principal = colorName;
    nextStep(4);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
});
