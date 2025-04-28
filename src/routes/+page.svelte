<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { chatHistory, userData, isResponding, chatsActive, clearChats, addUserMessage, addModelMessage, systemInstruction, currentSubject } from '$lib/stores/chatStore';
  import { isLightTheme, toggleTheme } from '$lib/stores/themeStore';
  import { generateResponse } from '$lib/api';
  import { suggestions } from '$lib/suggestions';
  import gemini from '$lib/images/gemini.svg';

  let promptInput: HTMLInputElement;
  let fileInput: HTMLInputElement;
  let filePreview: HTMLImageElement;
  let chatsContainer: HTMLDivElement;
  let controller: AbortController;
  let typingInterval: ReturnType<typeof setInterval>;

  $: fileAttached = !!$userData.file.data;
  $: isImageAttached = $userData.file.isImage;

  function scrollToBottom() {
    if (chatsContainer) {
      chatsContainer.scrollTo({ top: chatsContainer.scrollHeight, behavior: "smooth" });
    }
  }

  function typingEffect(text: string, element: HTMLElement, callback: () => void) {
    let currentText = "";
    const words = text.split(" ");
    let wordIndex = 0;
    
    clearInterval(typingInterval);
    
    typingInterval = setInterval(async () => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
        element.textContent = currentText;
        await tick();
        scrollToBottom();
      } else {
        clearInterval(typingInterval);
        callback();
      }
    }, 40);
  }

  async function handleFormSubmit() {
    const userMessage = promptInput.value.trim();
    if (!userMessage || $isResponding) return;
    
    $userData.message = userMessage;
    promptInput.value = "";
    $chatsActive = true;
    $isResponding = true;
    
    // Add user message to chat history
    addUserMessage(userMessage, $userData.file);
    
    const bodyContainerElement = document.getElementById("body");
    bodyContainerElement?.classList.add("chats-active", "bot-responding");
    
    // Create a placeholder for bot response
    const botMessageElement = document.createElement('div');
    botMessageElement.classList.add('message', 'bot-message', 'loading');
    botMessageElement.innerHTML = `<img class="avatar" src="${gemini}" /> <p class="message-text">Just a sec...</p>`;
    chatsContainer.appendChild(botMessageElement);
    scrollToBottom();
    
    const textElement = botMessageElement.querySelector('.message-text') as HTMLElement;
    
    try {
      controller = new AbortController();
      const responseText = await generateResponse($chatHistory, controller.signal, $systemInstruction);
      
      typingEffect(responseText, textElement, () => {
        botMessageElement.classList.remove('loading');
        botMessageElement.remove();
        addModelMessage(responseText);
      });
    } catch (error: any) {
      textElement.textContent = error.name === "AbortError" 
        ? "Response generation stopped." 
        : error.message;
      textElement.style.color = "#d62939";
      botMessageElement.classList.remove('loading');
    } finally {
      $isResponding = false;
      $userData.file = {};
    }
  }

  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64String = result.split(',')[1];
      
      if (filePreview) {
        filePreview.src = result;
      }
      
      $userData.file = { 
        fileName: file.name, 
        data: base64String, 
        mime_type: file.type, 
        isImage 
      };
      
      input.value = '';
    };
    
    reader.readAsDataURL(file);
  }

  function cancelFileUpload() {
    $userData.file = {};
  }

  function stopResponse() {
    if (controller) {
      controller.abort();
      clearInterval(typingInterval);
      
      const loadingMessage = chatsContainer.querySelector('.bot-message.loading');
      if (loadingMessage) {
        loadingMessage.classList.remove('loading');
      }
      
      $isResponding = false;
      $userData.file = {};

      const bodyContainerElement = document.getElementById("body");
      bodyContainerElement?.classList.remove("bot-responding");
    }
  }


  function useSuggestion(subjectSystemInstruction: string, text: string =  "what is your role explain") {
    $systemInstruction = subjectSystemInstruction;
    // promptInput.value = text;
    // handleFormSubmit();
  }

    // Reactive statement that runs whenever `currentSubject` changes
  $: {
    const subject = $chatHistory;
  }



  onMount(() => {
    document.body.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const promptWrapper = document.querySelector('.prompt-wrapper') as HTMLElement;
      if (!promptWrapper) return;
      
      const shouldHide = 
        target.classList.contains('prompt-input') || 
        (promptWrapper.classList.contains('hide-controls') && 
          (target.id === 'add-file-btn' || target.id === 'stop-response-btn'));
      
      if (shouldHide) {
        promptWrapper.classList.add('hide-controls');
      } else {
        promptWrapper.classList.remove('hide-controls');
      }
    });
  });

  const colorMap: { [key: string]: string } = {
    "CHEMISTRY": "#1d7efd",
    "BIOLOGY": "#28a745",
    "PHYSICS": "#ffc107",
    "MATHEMATICS": "#6f42c1",
    // add more titles
  };

  $: subjectColor = colorMap[$currentSubject.title] || "#1d7efd"; // fallback color

</script>

<!-- App Header -->
<header class="app-header">
  <h1 class="heading">Doubt LLM</h1>
  <h4 class="sub-heading">Instant answers. Clear concepts. Learn confidently.</h4>
</header>

<!-- Suggestions List -->
<ul class="suggestions">
  {#each suggestions as suggestion}
    <li class="suggestions-item" on:click={() => setTimeout(() => {currentSubject.set(suggestion); useSuggestion(suggestion.systemInstruction);}, 0)}>
      <p class="text">{suggestion.text}</p>
      <div class="suggestions-footer">
        <span class="suggestions-title">{suggestion.title}</span>
        <span class="icon material-symbols-rounded">{suggestion.icon}</span>
      </div>
    </li>
  {/each}
</ul>

{#if $currentSubject.title !== ""}
<div class="subject">
  <div class="subject-item">
    <div class="subject-footer">
      <span class="icon material-symbols-rounded" style="color: {subjectColor}">{$currentSubject.icon}</span>
      <span class="subject-title" style="color: {subjectColor}">{$currentSubject.title}</span>
    </div>
  </div>
</div>
{/if}

<!-- Chats -->
<div class="chats-container" bind:this={chatsContainer}>
  {#each $chatHistory as message, i}
    <div class="message {message.role === 'user' ? 'user-message' : 'bot-message'}">
      {#if message.role === 'model'}
        <img class="avatar" src={gemini} alt="Gemini avatar" />
      {/if}
      
      <p class="message-text">{message.parts[0].text}</p>
      
      {#if message.role === 'user' && message.parts.length > 1 && message.parts[1].inline_data}
        {#if $userData.file.isImage}
          <img src="data:{message.parts[1].inline_data.mime_type};base64,{message.parts[1].inline_data.data}" class="img-attachment" alt="Uploaded image" />
        {:else}
          <p class="file-attachment">
            <span class="material-symbols-rounded">description</span>
            {$userData.file.fileName}
          </p>
        {/if}
      {/if}
    </div>
  {/each}
</div>

<!-- Prompt Input -->
{#if $systemInstruction}
<div class="prompt-container">
  <div class="prompt-wrapper">
    <form  class="prompt-form" on:submit|preventDefault={handleFormSubmit}>
      <input 
        type="text" 
        placeholder="Powered by Gemini" 
        class="prompt-input" 
        required 
        bind:this={promptInput}
      />
      <div class="prompt-actions">
        <!-- File Upload Wrapper -->
        <div class="file-upload-wrapper" class:file-attached={fileAttached && !isImageAttached} class:img-attached={fileAttached && isImageAttached} class:active={fileAttached}>
          <img src="" alt="" bind:this={filePreview} class="file-preview" />
          <input 
            id="file-input" 
            type="file" 
            accept="image/*, .pdf, .txt, .csv" 
            hidden 
            bind:this={fileInput}
            on:change={handleFileUpload}
          />
          <button type="button" class="file-icon material-symbols-rounded">description</button>
          <button id="cancel-file-btn" type="button" class="material-symbols-rounded" on:click={cancelFileUpload}>close</button>
          <button id="add-file-btn" type="button" class="material-symbols-rounded" on:click={() => fileInput.click()}>attach_file</button>
        </div>
        <!-- Send Prompt and Stop Response Buttons -->
        <button 
          id="stop-response-btn" 
          type="button" 
          class="material-symbols-rounded"
          on:click={stopResponse}
        >
          stop_circle
        </button>
        <button id="send-prompt-btn" class="material-symbols-rounded">arrow_upward</button>
      </div>
    </form>
    <!-- Theme and Delete Chats Buttons -->
    <button id="theme-toggle-btn" class="material-symbols-rounded" on:click={toggleTheme}>
      {$isLightTheme ? 'dark_mode' : 'light_mode'}
    </button>
    <button id="delete-chats-btn" class="material-symbols-rounded" on:click={clearChats}>delete</button>
  </div>
  <p class="disclaimer-text">Gemini can make mistakes, so double-check it.</p>
</div>
{:else}
<div class="prompt-container">
  <div class="prompt-wrapper">
  </div>
  <p class="disclaimer-text">Gemini can make mistakes, so double-check it.</p>
</div>
{/if}