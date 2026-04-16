const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatContainer = document.querySelector('.chatbot-container');


function toggleChat() {
  chatContainer.classList.toggle('show');
}

//This is differentes response of 
const botResponses = {
  "livraison": "your order is being delivered, in 5 minutes it will be ready!",
  "hello": "Hi there! How can I help you today?",
  "how are you": "I'm just a bot, but I'm functioning as expected!",
  "bye": "Goodbye! Have a great day!",
  "default": "I'm sorry, I didn't understand that. Can you try rephrasing?"
};

function addMessage(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function handleUserInput() {
  const userText = userInput.value.trim();
  if (!userText) return;


  addMessage(userText, 'user');
  userInput.value = '';

  setTimeout(() => {
    const response = botResponses[userText.toLowerCase()] || botResponses['default'];
    addMessage(response, 'bot');
  }, 500);
}


sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleUserInput();
});  