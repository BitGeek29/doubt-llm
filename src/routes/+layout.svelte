<script lang="ts">
  import '../app.css';
  import '$lib/css/subject.css';
  import { isLightTheme } from '$lib/stores/themeStore';
  import { chatsActive, isResponding } from '$lib/stores/chatStore';
</script>

<svelte:head>
  <title>Gemini Chatbot | SvelteKit</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@32,400,0,0" />
</svelte:head>

<div id="body" class:chats-active={$chatsActive} class:light-theme={$isLightTheme} class:bot-responding={$isResponding}>
	<div class="container">
	  <slot />
	</div>
</div>