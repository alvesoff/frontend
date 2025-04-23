// Script para gerenciar a visualização prévia de imagens
document.addEventListener('DOMContentLoaded', function() {
  const imagensInput = document.getElementById('imagensQuestao');
  const previewImagens = document.getElementById('previewImagens');

  if (imagensInput && previewImagens) {
    // Adicionar evento para mostrar preview quando imagens são selecionadas
    imagensInput.addEventListener('change', function() {
      // Limpar previews anteriores
      previewImagens.innerHTML = '';
      
      // Verificar se há arquivos selecionados
      if (this.files && this.files.length > 0) {
        // Criar preview para cada arquivo
        for (let i = 0; i < this.files.length; i++) {
          const file = this.files[i];
          
          // Verificar se é uma imagem
          if (!file.type.match('image.*')) {
            continue;
          }
          
          // Criar container para a imagem
          const imgContainer = document.createElement('div');
          imgContainer.className = 'preview-item';
          
          // Criar elemento de imagem
          const img = document.createElement('img');
          img.className = 'preview-image';
          
          // Criar botão de remover
          const removeBtn = document.createElement('button');
          removeBtn.className = 'remove-image';
          removeBtn.innerHTML = '&times;';
          removeBtn.title = 'Remover imagem';
          removeBtn.type = 'button';
          
          // Adicionar evento para remover a imagem
          removeBtn.addEventListener('click', function() {
            imgContainer.remove();
            // Nota: Isso não remove o arquivo do input, apenas da visualização
            // Para implementação completa, seria necessário usar FileList API ou recriar o input
          });
          
          // Ler o arquivo como URL de dados
          const reader = new FileReader();
          reader.onload = function(e) {
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
          
          // Adicionar elementos ao container
          imgContainer.appendChild(img);
          imgContainer.appendChild(removeBtn);
          
          // Adicionar container ao preview
          previewImagens.appendChild(imgContainer);
        }
      }
    });
  }
});