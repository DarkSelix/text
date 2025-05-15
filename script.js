// --- Global DOM Element References ---
const chatBody = document.getElementById("chat-body");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const menuButton = document.getElementById("menu-button");
const sidebar = document.getElementById("sidebar");
const sidebarClose = document.getElementById("sidebar-close");
const sidebarTabs = document.querySelectorAll(".sidebar-tab");
const historyTab = document.getElementById("history-tab");
const settingsTab = document.getElementById("settings-tab");
const apiKeyInput = document.getElementById("api-key-input");
const modelSelect = document.getElementById("model-select");
const aiPersonaInput = document.getElementById("ai-persona-input");
const userPersonaInput = document.getElementById("user-persona-input");
const saveSettings = document.getElementById("save-settings");
const historyList = document.getElementById("history-list");
const newChatButton = document.getElementById("new-chat-button");
const typingIndicatorArea = document.getElementById("typing-indicator-area");
const viewContextButton = document.getElementById("view-context-button");
const contextModal = document.getElementById("context-modal");
const contextModalBody = document.getElementById("context-modal-body");
const modalCloseButton = document.getElementById("modal-close-button");
const chatHeaderTitle = document.getElementById("chat-header-title");


// --- Configuration & State ---
const API_URL = "https://llm.chutes.ai/v1/chat/completions";
let chutesApiKey = "";
let currentModel = "deepseek-ai/DeepSeek-V3-0324";
const DEFAULT_SYSTEM_MESSAGE_CONTENT = `Hello! I'm Velly, your helpful AI assistant. I'm here to chat and assist you with your tasks.
I have special text formatting abilities:
- *text like this* means I'm thinking or emphasizing something softly (italic).
- # TEXT LIKE THIS means I'm very enthusiastic or shouting (uppercase, bold, specific color).
- (red)text for highlighting important warnings or errors.
- (purple)text for when I'm expressing positive sentiment or creative ideas.
- (black)text for very serious or formal statements.
- (white)text is my normal way of speaking.
I'll try my best to use these to make our chats more expressive and clear! If you edit my messages, I'll adapt to the changes. Let's begin!`;
const HISTORY_HANDLING_INSTRUCTION = "\n\n**Important Note on Conversation History & Edits:** The user interface allows the user to *edit your previous responses*. The message history you are about to receive reflects the *current state* of the conversation, including any such user edits to messages that were originally yours. When you form your next response, treat the content of each message in the history (regardless of original authorship if it was an 'assistant' role that got edited) as the ground truth for continuing the dialogue. Your goal is to maintain a coherent and engaging conversation based on this *presented history*, even if an 'assistant' message in the history was modified by the user from what you might have said originally. Adapt naturally to the flow of this (potentially edited) history while staying true to your core persona described above (if one is set).";
let messages = [];
let isLoading = false;
let currentChat = { id: generateId(), title: "New Chat", messages: [] };
let chats = [];
let editingMessage = null;
let customAiPersona = "";
let currentUserPersona = "";
const icons = {
    copy: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    delete: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
    edit: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    regenerate: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    ellipsis: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
    historyEdit: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    historyDelete: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>'
};

function updateChatHeaderTitle(title) {
    if (chatHeaderTitle) {
        chatHeaderTitle.textContent = title || "Chat";
    }
}

function init() {
    loadSettings();
    loadChatHistory();
    if (messages.length === 0 && currentChat.messages.length === 0) {
        addWelcomeMessage();
    }
    updateChatHeaderTitle(currentChat.title);
    adjustInputHeight();
    setupEventListeners();
    renderMessages(); 
}

function loadSettings() {
    try {
        const settings = localStorage.getItem("vellyAI_settings_v3"); 
        if (settings) {
            const parsedSettings = JSON.parse(settings);
            currentModel = parsedSettings.model || "deepseek-ai/DeepSeek-V3-0324";
            customAiPersona = parsedSettings.aiPersona || "";
            currentUserPersona = parsedSettings.userPersona || "";
            chutesApiKey = parsedSettings.apiKey || "";

            modelSelect.value = currentModel;
            aiPersonaInput.value = customAiPersona;
            userPersonaInput.value = currentUserPersona;
            apiKeyInput.value = chutesApiKey;
        }
    } catch (error) {
        console.error("Error loading settings:", error);
    }
}

function saveSettingsToStorage() {
    try {
        localStorage.setItem("vellyAI_settings_v3", JSON.stringify({ 
            model: currentModel,
            aiPersona: customAiPersona,
            userPersona: currentUserPersona,
            apiKey: chutesApiKey
        }));
    } catch (error) {
        console.error("Error saving settings:", error);
    }
}

function loadChatHistory() {
    try {
        const storedChats = localStorage.getItem("vellyAI_chats_v2"); 
        if (storedChats) {
            chats = JSON.parse(storedChats);
            if (chats.length === 0) chats = [createNewChat()];
            const lastActiveChatId = localStorage.getItem("vellyAI_lastActiveChatId_v2"); 
            currentChat = chats.find(chat => chat.id === lastActiveChatId) || chats[0] || createNewChat();
            if (chats.length === 0 && currentChat.id === null ) chats = [currentChat]; 
        } else {
            currentChat = createNewChat();
            chats = [currentChat];
        }
        messages = [...currentChat.messages];
    } catch (error) {
        console.error("Error loading chat history:", error);
        currentChat = createNewChat();
        chats = [currentChat];
        messages = [];
    }
    renderChatHistoryList();
}

function saveChatHistory() {
    try {
        currentChat.messages = [...messages];
        let chatIndex = chats.findIndex(chat => chat.id === currentChat.id);

        if (chatIndex !== -1) {
            if ((chats[chatIndex].title === "New Chat" || !chats[chatIndex].title) && messages.length > 0) {
                const firstUserMessage = messages.find(m => m.role === 'user');
                if (firstUserMessage) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = firstUserMessage.content;
                    const plainText = (tempDiv.textContent || tempDiv.innerText || "").trim();
                    const title = plainText.substring(0, 35) + (plainText.length > 35 ? "..." : "");
                    chats[chatIndex].title = title || "Chat";
                    currentChat.title = title || "Chat";
                } else if (messages.length > 0 && messages[0].role === 'assistant' && messages[0].isWelcome) {
                     chats[chatIndex].title = "Welcome Chat"; 
                     currentChat.title = "Welcome Chat";
                }
            } else if (messages.length === 0 && chats[chatIndex].title !== "New Chat") {
                if (chats[chatIndex].title !== "Welcome Chat") { 
                    chats[chatIndex].title = "New Chat";
                    currentChat.title = "New Chat";
                }
            } else {
                chats[chatIndex].title = currentChat.title;
            }
            chats[chatIndex] = {...currentChat}; 
        } else {
            chats.unshift({...currentChat});
            chatIndex = 0; 
        }
        
        updateChatHeaderTitle(currentChat.title);
        localStorage.setItem("vellyAI_chats_v2", JSON.stringify(chats)); 
        localStorage.setItem("vellyAI_lastActiveChatId_v2", currentChat.id); 
        renderChatHistoryList();
    } catch (error) {
        console.error("Error saving chat history:", error);
    }
}

function createNewChat() {
    return { id: generateId(), title: "New Chat", messages: [] };
}

function renderChatHistoryList() {
    if (!historyList) return;
    historyList.innerHTML = '';
    chats.forEach(chat => {
        const item = document.createElement('li');
        item.className = 'history-item';
        item.dataset.id = chat.id;
        if (chat.id === currentChat.id) {
            item.classList.add('active-chat');
        }

        const titleSpan = document.createElement('span');
        titleSpan.className = 'history-item-title';
        titleSpan.textContent = chat.title || 'Chat';
        titleSpan.title = chat.title || 'Chat';
        titleSpan.addEventListener('click', () => {
            loadChat(chat.id);
            closeSidebarAndCleanup();
        });

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'history-item-actions';

        const renameButton = document.createElement('button');
        renameButton.className = 'history-action-btn rename-chat-btn';
        renameButton.title = 'Rename Chat';
        renameButton.innerHTML = icons.historyEdit;
        renameButton.onclick = (e) => { e.stopPropagation(); renameChatInHistory(chat.id); };
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'history-action-btn delete-chat-btn';
        deleteButton.title = 'Delete Chat';
        deleteButton.innerHTML = icons.historyDelete;
        deleteButton.onclick = (e) => { e.stopPropagation(); deleteChatFromHistory(chat.id); };

        actionsDiv.appendChild(renameButton);
        actionsDiv.appendChild(deleteButton);
        
        item.appendChild(titleSpan);
        item.appendChild(actionsDiv);
        historyList.appendChild(item);
    });
}

function renameChatInHistory(chatId) {
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) return;

    const currentTitle = chats[chatIndex].title;
    const newTitle = prompt("Enter new chat title:", currentTitle === "New Chat" ? "" : currentTitle);

    if (newTitle !== null && newTitle.trim() !== "") {
        chats[chatIndex].title = newTitle.trim();
        if (currentChat.id === chatId) {
            currentChat.title = newTitle.trim();
            updateChatHeaderTitle(currentChat.title);
        }
        saveChatHistory(); 
    }
}

function deleteChatFromHistory(chatId) {
    if (!confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
        return;
    }

    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex === -1) return;

    chats.splice(chatIndex, 1);

    if (currentChat.id === chatId) { 
        if (chats.length > 0) {
            loadChat(chats[0].id); 
        } else {
            startNewChat(); 
        }
    } else {
        saveChatHistory();
    }
}


function startNewChat() {
    currentChat = createNewChat();
    chats.unshift(currentChat); 
    messages = [];
    addWelcomeMessage();
    saveChatHistory(); 
    renderMessages();
    updateChatHeaderTitle(currentChat.title);
    messageInput.focus();
}

function loadChat(id) {
    const chatToLoad = chats.find(chat => chat.id === id);
    if (chatToLoad) {
        currentChat = chatToLoad;
        messages = [...chatToLoad.messages];
        localStorage.setItem("vellyAI_lastActiveChatId_v2", currentChat.id); 
        renderMessages();
        renderChatHistoryList(); 
        updateChatHeaderTitle(currentChat.title);
        if (messages.length === 0) {
            addWelcomeMessage();
        }
    }
}

function addWelcomeMessage() {
     if (messages.length === 0) {
        const welcomeMsg = {
            role: "assistant",
            content: processText("Hello! (purple)I'm Velly.(white) How can I help you today?").text,
            timestamp: new Date().toISOString(),
            isWelcome: true 
        };
        messages.push(welcomeMsg);
        saveChatHistory(); 
        renderMessages();
    }
}
function generateId() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 7); }

function processText(rawText) {
    let text = rawText;
    let color = null;
    if (text.startsWith("-B ")) { text = text.substring(3); color = "black"; }
    else if (text.startsWith("-P ")) { text = text.substring(3); color = "purple"; }
    else if (text.startsWith("-R ")) { text = text.substring(3); color = "red"; }

    text = text.replace(/\*(.*?)\*/g, '<em class="thinking">$1</em>');
    text = text.replace(/^#\s?(.*)/gm, '<strong class="scream">$1</strong>');
    
    marked.setOptions({
        highlight: function (code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language, ignoreIllegals: true }).value;
        },
        gfm: true,
        breaks: true,
        sanitize: false 
    });
    text = marked.parse(text);

    text = text.replace(/\(red\)([\s\S]*?)(?=\s|$|\(|$|<)/g, '<span class="text-red">$1</span>')
               .replace(/\(purple\)([\s\S]*?)(?=\s|$|\(|$|<)/g, '<span class="text-purple">$1</span>')
               .replace(/\(black\)([\s\S]*?)(?=\s|$|\(|$|<)/g, '<span class="text-black">$1</span>')
               .replace(/\(white\)([\s\S]*?)(?=\s|$|\(|$|<)/g, '<span class="text-white">$1</span>');
    text = text.replace(/<p>\s*<\/p>/gi, ''); 
    return { text: text, color: color };
}

function renderMessages() {
    if (!chatBody) return;
    chatBody.innerHTML = '';
    messages.forEach((msg, index) => {
        chatBody.appendChild(createMessageElement(msg, index));
    });
    scrollToBottom();
    if (typeof hljs !== 'undefined') {
        initCodeBlocksInChat();
    }
}

function createMessageElement(msg, index) {
    const isUser = msg.role === 'user';
    const timestamp = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.dataset.index = index;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = `avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`;
    avatarDiv.innerHTML = isUser ?
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` :
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`;
    messageDiv.appendChild(avatarDiv);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = `message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`;
    if (msg.color && isUser) { 
        bubbleDiv.classList.add(`text-${msg.color}`);
    }
    bubbleDiv.innerHTML = msg.content;

    const msgInfoDiv = document.createElement('div');
    msgInfoDiv.className = 'message-info';
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = timestamp;
    msgInfoDiv.appendChild(timeDiv);
    
    contentDiv.appendChild(bubbleDiv);
    contentDiv.appendChild(msgInfoDiv);

    const actionsTrigger = document.createElement('button');
    actionsTrigger.className = 'message-actions-trigger';
    actionsTrigger.innerHTML = icons.ellipsis;
    actionsTrigger.setAttribute('aria-label', 'Message actions');
    actionsTrigger.onclick = (e) => { e.stopPropagation(); toggleActionsMenu(index); };

    const actionsMenu = document.createElement('div');
    actionsMenu.className = 'message-actions-menu';
    actionsMenu.id = `actions-menu-${index}`;
    
    actionsMenu.appendChild(createActionButton(icons.edit + ' Edit', () => editMessage(index)));
    actionsMenu.appendChild(createActionButton(icons.copy + ' Copy Text', () => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = msg.content;
        let textToCopy = (tempDiv.textContent || tempDiv.innerText || "")
            .replace(/\*(.*?)\*/g, '$1') 
            .replace(/^#\s?(.*)/gm, '$1'); 
        copyToClipboard(textToCopy, actionsMenu.querySelector('.action-button:nth-child(2)')); 
    }));
    if (!isUser) {
        actionsMenu.appendChild(createActionButton(icons.regenerate + ' Regenerate', () => regenerateResponse(index)));
    }
    actionsMenu.appendChild(createActionButton(icons.delete + ' Delete', () => deleteMessage(index), 'delete'));

    contentDiv.appendChild(actionsTrigger);
    contentDiv.appendChild(actionsMenu);
    messageDiv.appendChild(contentDiv);
    return messageDiv;
}

function createActionButton(innerHTML, onClick, additionalClass = '') {
    const button = document.createElement('button');
    button.className = 'action-button';
    if (additionalClass) button.classList.add(additionalClass);
    button.innerHTML = innerHTML;
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
        closeAllActionMenus();
    });
    return button;
}

function toggleActionsMenu(index) {
    const menu = document.getElementById(`actions-menu-${index}`);
    const isActive = menu.classList.contains('active');
    closeAllActionMenus(); 
    if (!isActive) {
        menu.classList.add('active');
    }
}

function closeAllActionMenus() {
    document.querySelectorAll('.message-actions-menu.active').forEach(m => m.classList.remove('active'));
}
document.addEventListener('click', (e) => {
    if (!e.target.closest('.message-actions-trigger') && !e.target.closest('.message-actions-menu')) {
        closeAllActionMenus();
    }
});


function getRawTextFromHtml(htmlContent) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    tempDiv.querySelectorAll('em.thinking').forEach(el => el.replaceWith(`*${el.textContent}*`));
    tempDiv.querySelectorAll('strong.scream').forEach(el => el.replaceWith(`# ${el.textContent}`));
    tempDiv.querySelectorAll('span.text-red').forEach(el => el.replaceWith(`(red)${el.innerHTML}`)); 
    tempDiv.querySelectorAll('span.text-purple').forEach(el => el.replaceWith(`(purple)${el.innerHTML}`));
    tempDiv.querySelectorAll('span.text-black').forEach(el => el.replaceWith(`(black)${el.innerHTML}`));
    tempDiv.querySelectorAll('span.text-white').forEach(el => el.replaceWith(`(white)${el.innerHTML}`));

    tempDiv.querySelectorAll('.code-block pre code').forEach(codeElement => {
        const langClass = Array.from(codeElement.classList).find(cls => cls.startsWith('language-'));
        const lang = langClass ? langClass.split('-')[1] : '';
        // Replace the entire .code-block structure
        codeElement.closest('.code-block').replaceWith("```" + lang + "\n" + codeElement.textContent + "\n```");
    });
    // Fallback for pre code not in .code-block (should ideally not happen if initCodeBlocksInChat is robust)
     tempDiv.querySelectorAll('pre > code:not([data-highlighted])').forEach(codeElement => { 
        const langClass = Array.from(codeElement.classList).find(cls => cls.startsWith('language-'));
        const lang = langClass ? langClass.split('-')[1] : (codeElement.className || '');
        codeElement.parentElement.replaceWith("```" + lang + "\n" + codeElement.textContent + "\n```");
    });
    
    return (tempDiv.textContent || tempDiv.innerText || "").trim();
}

function editMessage(index) {
    if (editingMessage && editingMessage.index === index) return; 
    if (editingMessage) cancelEdit(); 

    const messageData = messages[index];
    const messageElement = document.querySelector(`.message[data-index="${index}"]`);
    if (!messageData || !messageElement) return;

    const bubbleElement = messageElement.querySelector('.message-bubble');
    const rawContentForEditing = getRawTextFromHtml(messageData.content);

    editingMessage = { index, originalBubbleHTML: bubbleElement.innerHTML };
    
    bubbleElement.style.display = 'none'; 

    const editTextArea = document.createElement('textarea');
    editTextArea.className = 'edit-area';
    editTextArea.value = rawContentForEditing;

    const editControls = document.createElement('div');
    editControls.className = 'edit-controls';

    const saveButton = document.createElement('button');
    saveButton.className = 'edit-button';
    saveButton.textContent = 'Save';
    saveButton.onclick = () => saveEditedMessage(index, editTextArea.value);

    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => cancelEdit();

    editControls.appendChild(cancelButton);
    editControls.appendChild(saveButton);

    bubbleElement.insertAdjacentElement('afterend', editControls);
    bubbleElement.insertAdjacentElement('afterend', editTextArea);
    
    editTextArea.focus();
    editTextArea.style.height = 'auto';
    editTextArea.style.height = (editTextArea.scrollHeight) + 'px';
    editTextArea.addEventListener('input', () => {
        editTextArea.style.height = 'auto';
        editTextArea.style.height = (editTextArea.scrollHeight) + 'px';
    });
}

function saveEditedMessage(index, newRawContent) {
    if (index < 0 || index >= messages.length) return;
    const originalMessage = messages[index];
    const { text: processedContent, color: detectedColor } = processText(newRawContent);

    messages[index] = {
        ...originalMessage,
        content: processedContent,
        raw: newRawContent, 
        color: detectedColor || originalMessage.color, 
        timestamp: new Date().toISOString(),
        edited: true
    };
    
    cancelEditCleanup(); 
    editingMessage = null;
    saveChatHistory();
    renderMessages();
}

function cancelEdit() {
    if (!editingMessage) return;
    const messageElement = document.querySelector(`.message[data-index="${editingMessage.index}"]`);
    if (messageElement) {
        const bubbleElement = messageElement.querySelector('.message-bubble');
        if (bubbleElement) {
            bubbleElement.innerHTML = editingMessage.originalBubbleHTML; 
            bubbleElement.style.display = ''; 
        }
        const editArea = messageElement.querySelector('.edit-area');
        if (editArea) editArea.remove();
        const editControls = messageElement.querySelector('.edit-controls');
        if (editControls) editControls.remove();
    }
    editingMessage = null;
}
function cancelEditCleanup() { 
    if (!editingMessage) return;
    const messageElement = document.querySelector(`.message[data-index="${editingMessage.index}"]`);
    if (messageElement) {
        const editArea = messageElement.querySelector('.edit-area');
        if (editArea) editArea.remove();
        const editControls = messageElement.querySelector('.edit-controls');
        if (editControls) editControls.remove();
        const bubbleElement = messageElement.querySelector('.message-bubble');
        if(bubbleElement) bubbleElement.style.display = ''; 
    }
}


function deleteMessage(index) {
    if (index < 0 || index >= messages.length) return;
    const messageElement = document.querySelector(`.message[data-index="${index}"]`);
    if (messageElement) {
        messageElement.classList.add('delete-animation');
        setTimeout(() => {
            messages.splice(index, 1);
            saveChatHistory();
            renderMessages(); 
        }, 300); 
    } else {
        messages.splice(index, 1);
        saveChatHistory();
        renderMessages();
    }
}

function regenerateResponse(botMessageIndex) {
    if (isLoading || botMessageIndex <= 0 || botMessageIndex >= messages.length || messages[botMessageIndex].role !== 'assistant') {
        return;
    }
    const userMessageIndex = botMessageIndex - 1;
    if (userMessageIndex < 0 || messages[userMessageIndex].role !== 'user') {
        console.warn("Cannot regenerate: No preceding user message found for bot message at index", botMessageIndex);
        return;
    }

    messages.splice(botMessageIndex, 1);
    saveChatHistory(); 
    renderMessages(); 

    const userMessageForApi = messages[userMessageIndex];
    const rawUserContent = userMessageForApi.raw || getRawTextFromHtml(userMessageForApi.content);

    sendMessage(rawUserContent, userMessageForApi.color, false);
}

function initCodeBlocksInChat() {
    if (typeof hljs === 'undefined') {
        console.warn("highlight.js is not available. Code blocks will be plain text.");
        return;
    }
    document.querySelectorAll('.message-bubble > pre > code').forEach((codeElement) => {
        const preElement = codeElement.parentElement;
        if (preElement.parentElement.classList.contains('code-block')) {
            return; 
        }

        const languageMatch = Array.from(codeElement.classList).find(c => c.startsWith('language-'));
        const language = languageMatch ? languageMatch.substring(9) : 'plaintext';
        const code = codeElement.textContent || '';

        const codeBlockDiv = document.createElement('div');
        codeBlockDiv.className = 'code-block';

        const codeHeader = document.createElement('div');
        codeHeader.className = 'code-header';
        
        const langSpan = document.createElement('span');
        langSpan.className = 'code-language';
        langSpan.textContent = language;
        
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy';
        copyButton.innerHTML = icons.copy + ' Copy';
        copyButton.onclick = () => copyCode(code, copyButton);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'code-actions';
        actionsDiv.appendChild(copyButton);

        codeHeader.appendChild(langSpan);
        codeHeader.appendChild(actionsDiv);

        codeBlockDiv.appendChild(codeHeader);
        
        preElement.parentNode.insertBefore(codeBlockDiv, preElement);
        codeBlockDiv.appendChild(preElement); 
        
        if (!codeElement.dataset.highlighted) {
             try {
                hljs.highlightElement(codeElement);
                codeElement.dataset.highlighted = "true";
            } catch(error) {
                console.error("highlight.js highlighting failed for language:", language, error);
            }
        }
    });
}


function copyCode(code, buttonElement) {
    navigator.clipboard.writeText(code).then(() => {
        const originalHtml = buttonElement.innerHTML;
        buttonElement.innerHTML = icons.check + ' Copied!';
        buttonElement.classList.add('code-copy-success');
        setTimeout(() => {
            buttonElement.innerHTML = originalHtml;
            buttonElement.classList.remove('code-copy-success');
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy code: ', err);
        buttonElement.textContent = 'Error';
        setTimeout(() => { buttonElement.innerHTML = icons.copy + ' Copy'; }, 1500);
    });
}

function adjustInputHeight() {
    messageInput.style.height = 'auto'; 
    let scrollHeight = messageInput.scrollHeight;
    const maxHeight = parseInt(window.getComputedStyle(messageInput).maxHeight, 10) || 200;

    if (scrollHeight > maxHeight) {
        messageInput.style.height = maxHeight + 'px';
        messageInput.style.overflowY = 'auto';
    } else {
        messageInput.style.height = scrollHeight + 'px';
        messageInput.style.overflowY = 'hidden';
    }
    sendButton.disabled = messageInput.value.trim() === '' || isLoading;
}

function showTypingIndicator() {
    hideTypingIndicator(); 
    const indicatorHtml = `
        <div class="message bot-message typing-indicator" id="bot-typing-indicator">
            <div class="avatar bot-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            </div>
            <div class="message-content">
                <div class="message-bubble bot-bubble typing-text">
                    Velly is typing<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
                </div>
            </div>
        </div>`;
    typingIndicatorArea.innerHTML = indicatorHtml;
    scrollToBottom();
}
function hideTypingIndicator() {
    typingIndicatorArea.innerHTML = '';
}

function scrollToBottom() {
    setTimeout(() => { 
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 50);
}

function copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        if (buttonElement) {
            const originalHtml = buttonElement.innerHTML;
            buttonElement.innerHTML = icons.check + ' Copied!';
            setTimeout(() => {
                buttonElement.innerHTML = originalHtml; 
            }, 1500);
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        if (buttonElement) {
             const originalHtml = buttonElement.innerHTML;
             buttonElement.innerHTML = 'Error'; 
             setTimeout(() => { buttonElement.innerHTML = originalHtml; }, 1500);
        }
    });
}

function showContextModal() {
    let systemMessageForDisplay;
    if (customAiPersona && customAiPersona.trim() !== "") {
        systemMessageForDisplay = customAiPersona;
    } else {
        systemMessageForDisplay = DEFAULT_SYSTEM_MESSAGE_CONTENT + HISTORY_HANDLING_INSTRUCTION;
    }

    let apiMessagesForDisplay = [{ role: "system", content: systemMessageForDisplay }];

    const contextWindow = messages.slice(-15); 
    contextWindow.forEach(msg => {
        let displayContent = msg.raw || getRawTextFromHtml(msg.content); 
        if (msg.role === 'user' && currentUserPersona && (msg.raw || getRawTextFromHtml(msg.content))) { 
             displayContent = `[User Persona: ${currentUserPersona}]\n\n${msg.raw || getRawTextFromHtml(msg.content)}`;
        }
        apiMessagesForDisplay.push({ role: msg.role, content: displayContent.trim() });
    });

    contextModalBody.innerHTML = '';
    apiMessagesForDisplay.forEach(msg => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'context-entry';
        const roleDiv = document.createElement('div');
        roleDiv.className = 'context-role';
        roleDiv.textContent = msg.role;
        const textDiv = document.createElement('div');
        textDiv.className = 'context-text';
        textDiv.textContent = msg.content; 
        entryDiv.appendChild(roleDiv);
        entryDiv.appendChild(textDiv);
        contextModalBody.appendChild(entryDiv);
    });
    contextModal.classList.add('active');
}


// --- Sidebar Open/Close Helper ---
function openSidebar() {
    if (sidebar && !sidebar.classList.contains('open')) {
        sidebar.classList.add('open');
        if (window.innerWidth <= 768) {
            document.body.style.overflow = 'hidden';
        }
        setTimeout(() => { document.addEventListener('click', handleClickOutsideSidebar, true); }, 0);
    }
}
function closeSidebarAndCleanup() {
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (window.innerWidth <= 768) {
            document.body.style.overflow = '';
        }
        document.removeEventListener('click', handleClickOutsideSidebar, true);
    }
}
function handleClickOutsideSidebar(event) {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(event.target) &&
        event.target !== menuButton && !menuButton.contains(event.target) 
        ) {
        closeSidebarAndCleanup();
    }
}

async function sendMessage(userRawInput, userBubbleColor, addUserMessageToList = true) {
    const trimmedInput = userRawInput.trim();
    if (!trimmedInput && addUserMessageToList) return; 
    if (isLoading) return;

    if (!chutesApiKey || chutesApiKey.trim() === '') {
        alert("Please enter your Chutes.AI API Key in Settings.");
        openSidebar();
        sidebarTabs.forEach(t => t.classList.remove('active'));
        document.querySelector('.sidebar-tab[data-tab="settings"]').classList.add('active');
        historyTab.style.display = 'none';
        settingsTab.style.display = 'block';
        apiKeyInput.focus();
        return;
    }

    isLoading = true;
    sendButton.disabled = true;
    messageInput.disabled = true;

    let currentUserTurnContentForApi = trimmedInput;
    if (currentUserPersona && trimmedInput) { 
        currentUserTurnContentForApi = `[User Persona: ${currentUserPersona}]\n\n${trimmedInput}`;
    }

    if (addUserMessageToList) {
        const { text: processedInputHtml, color: detectedUserMsgColor } = processText(trimmedInput);
        const userMessage = {
            role: "user",
            content: processedInputHtml,
            raw: trimmedInput, 
            timestamp: new Date().toISOString(),
            color: userBubbleColor || detectedUserMsgColor 
        };
        messages.push(userMessage);
        renderMessages(); 
    }
    
    showTypingIndicator();
    saveChatHistory(); 

    let systemMessageForApi;
    if (customAiPersona && customAiPersona.trim() !== "") {
        systemMessageForApi = customAiPersona;
    } else {
        systemMessageForApi = DEFAULT_SYSTEM_MESSAGE_CONTENT + HISTORY_HANDLING_INSTRUCTION;
    }
    
    const apiMessagePayload = [{ role: "system", content: systemMessageForApi }];

    let historyForApi = messages.slice(-105); 
    if (addUserMessageToList && historyForApi.length > 0) {
        historyForApi = historyForApi.slice(0, -1); 
    }
    
    historyForApi.forEach(msg => {
        if (msg.role === "user") {
            let userContentForApi = msg.raw || getRawTextFromHtml(msg.content);
             apiMessagePayload.push({ role: "user", content: (currentUserPersona && userContentForApi) ? `[User Persona: ${currentUserPersona}]\n\n${userContentForApi}` : userContentForApi.trim() });
        } else if (msg.role === "assistant") {
            apiMessagePayload.push({ role: "assistant", content: (msg.raw || getRawTextFromHtml(msg.content)).trim() });
        }
    });

    if (trimmedInput) { 
        apiMessagePayload.push({ role: "user", content: currentUserTurnContentForApi.trim() });
    }

    // console.log("API Key:", chutesApiKey ? "Exists" : "MISSING!"); // For debugging
    // console.log("Final API Messages to be sent:", JSON.parse(JSON.stringify(apiMessagePayload))); // For debugging

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${chutesApiKey}` },
            body: JSON.stringify({
                model: currentModel,
                messages: apiMessagePayload,
                stream: false, 
                max_tokens: 1500, 
                temperature: 0.75 
            })
        });
        hideTypingIndicator();
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.detail || errorData.error?.message || `API Error (${response.status})`);
        }
        const data = await response.json();
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error("Invalid API response structure.");
        }
        const botRawResponse = data.choices[0].message.content;
        const { text: processedBotResponseHtml } = processText(botRawResponse);
        const botMessage = {
            role: "assistant",
            content: processedBotResponseHtml,
            raw: botRawResponse, 
            timestamp: new Date().toISOString()
        };
        messages.push(botMessage);
        saveChatHistory(); 

    } catch (error) {
        console.error("Error fetching/processing API response:", error);
        hideTypingIndicator();
        const { text: processedError } = processText(`(red)Oh noes! Something went wrong: ${error.message}`);
        const errorMessage = { role: "assistant", content: processedError, timestamp: new Date().toISOString(), color: "red" };
        messages.push(errorMessage);
        saveChatHistory(); 
    } finally {
        isLoading = false;
        renderMessages(); 
        if (addUserMessageToList) { 
            messageInput.value = '';
        }
        adjustInputHeight();
        messageInput.disabled = false;
        sendButton.disabled = messageInput.value.trim() === '';
        messageInput.focus();
    }
}


function setupEventListeners() {
    messageInput.addEventListener('input', adjustInputHeight);
    sendButton.addEventListener('click', () => {
        if (!sendButton.disabled) {
            const { color: detectedColor } = processText(messageInput.value); 
            sendMessage(messageInput.value, detectedColor);
        }
    });
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey && !sendButton.disabled) {
            event.preventDefault();
            const { color: detectedColor } = processText(messageInput.value);
            sendMessage(messageInput.value, detectedColor);
        }
    });

    if (menuButton) {
        menuButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            if (sidebar.classList.contains('open')) {
                closeSidebarAndCleanup();
            } else {
                openSidebar();
            }
        });
    }
    if (sidebarClose) { sidebarClose.addEventListener('click', () => { closeSidebarAndCleanup(); }); }
    if (newChatButton) {
        newChatButton.addEventListener('click', () => {
            startNewChat();
            closeSidebarAndCleanup();
        });
    }

    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            sidebarTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            historyTab.style.display = tab.dataset.tab === 'history' ? 'block' : 'none';
            settingsTab.style.display = tab.dataset.tab === 'settings' ? 'block' : 'none';
        });
    });

    if (saveSettings) {
        saveSettings.addEventListener('click', () => {
            currentModel = modelSelect.value;
            customAiPersona = aiPersonaInput.value.trim();
            currentUserPersona = userPersonaInput.value.trim();
            chutesApiKey = apiKeyInput.value.trim();
            saveSettingsToStorage();
            alert('Settings saved!');
            closeSidebarAndCleanup();
        });
    }
    if (viewContextButton) viewContextButton.addEventListener('click', showContextModal);
    if (modalCloseButton) modalCloseButton.addEventListener('click', () => contextModal.classList.remove('active'));
    if (contextModal) contextModal.addEventListener('click', (event) => {
        if (event.target === contextModal) { 
            contextModal.classList.remove('active');
        }
    });
}

// --- Run Initialization ---
document.addEventListener('DOMContentLoaded', init);
