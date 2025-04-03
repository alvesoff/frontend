// ===========================
// SELECIONAR ELEMENTOS
// ===========================
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalOverlay = document.getElementById('modalOverlay');

const btnContinue1 = document.getElementById('btnContinue1');
const nomeProvaInput = document.getElementById('nomeProva');

// Modal 2
const modalOverlayStep2 = document.getElementById('modalOverlayStep2');
const closeModalBtnStep2 = document.getElementById('closeModalBtnStep2');
const btnCreate = document.getElementById('btnCreate');

// Seções do 2º modal
const sectionFundamental = document.querySelector('.section-fundamental');
const sectionMedio = document.querySelector('.section-medio');
// (Extras sempre exibido, mas se quiser condicionar, selecione .section-extras)

// ===========================
// ABRIR/FECHAR MODAL 1
// ===========================
openModalBtn.addEventListener('click', () => {
  modalOverlay.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
});

// Fecha o modal se clicar fora do conteúdo
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.style.display = 'none';
  }
});

// ===========================
// CONTINUAR (VALIDAR) MODAL 1
// ===========================
btnContinue1.addEventListener('click', () => {
  const nomeProva = nomeProvaInput.value.trim();

  // Checkboxes de Fundamental
  const fundCheckboxes = document.querySelectorAll('input[name="escolaridadeFundamental"]:checked');
  // Checkboxes de Médio
  const medioCheckboxes = document.querySelectorAll('input[name="escolaridadeMedio"]:checked');

  // Validação: nome preenchido
  if (!nomeProva) {
    alert('Por favor, informe o nome da prova.');
    return;
  }
  // Validação: ao menos um checkbox marcado
  if (fundCheckboxes.length === 0 && medioCheckboxes.length === 0) {
    alert('Selecione pelo menos uma escolaridade (Fundamental ou Médio).');
    return;
  }

  // Se passou na validação, fecha modal 1...
  modalOverlay.style.display = 'none';

  // ...e abre modal 2
  modalOverlayStep2.style.display = 'flex';

  // Mostrar/ocultar seções do 2º modal
  if (fundCheckboxes.length > 0) {
    sectionFundamental.style.display = 'block';
  } else {
    sectionFundamental.style.display = 'none';
  }

  if (medioCheckboxes.length > 0) {
    sectionMedio.style.display = 'block';
  } else {
    sectionMedio.style.display = 'none';
  }
});

// ===========================
// ABRIR/FECHAR MODAL 2
// ===========================
closeModalBtnStep2.addEventListener('click', () => {
  modalOverlayStep2.style.display = 'none';
});

modalOverlayStep2.addEventListener('click', (e) => {
  if (e.target === modalOverlayStep2) {
    modalOverlayStep2.style.display = 'none';
  }
});

// ===========================
// BOTÃO "CRIAR" NO 2º MODAL
// ===========================
btnCreate.addEventListener('click', () => {
  // Captura o nome da prova do Modal 1
  const nomeProva = nomeProvaInput.value.trim();

  // Captura as escolaridades selecionadas no Modal 1
  const fundCheckboxes = document.querySelectorAll('input[name="escolaridadeFundamental"]:checked');
  const medioCheckboxes = document.querySelectorAll('input[name="escolaridadeMedio"]:checked');
  const selectedFund = Array.from(fundCheckboxes).map(el => el.value);
  const selectedMedio = Array.from(medioCheckboxes).map(el => el.value);

  // Captura os componentes curriculares selecionados no Modal 2
  const compFundCheckboxes = document.querySelectorAll('input[name="componentesFundamental"]:checked');
  const compMedioCheckboxes = document.querySelectorAll('input[name="componentesMedio"]:checked');
  const componentesFundamental = Array.from(compFundCheckboxes).map(el => el.value);
  const componentesMedio = Array.from(compMedioCheckboxes).map(el => el.value);

  // Captura os extras selecionados
  const extrasCheckboxes = document.querySelectorAll('input[name="extras"]:checked');
  const extras = Array.from(extrasCheckboxes).map(el => el.value);

  // Salva os dados no localStorage
  localStorage.setItem('nomeProva', nomeProva);
  localStorage.setItem('selectedFund', JSON.stringify(selectedFund));
  localStorage.setItem('selectedMedio', JSON.stringify(selectedMedio));
  localStorage.setItem('componentesFundamental', JSON.stringify(componentesFundamental));
  localStorage.setItem('componentesMedio', JSON.stringify(componentesMedio));
  localStorage.setItem('extras', JSON.stringify(extras));

  // Exibe uma mensagem de sucesso (opcional)
  alert('Prova criada com sucesso!');

  // Fecha o Modal 2
  modalOverlayStep2.style.display = 'none';

  // Redireciona para a página de finalização da prova
  window.location.href = 'finalizar-prova.html';
});
