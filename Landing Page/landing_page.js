const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatContainer = document.querySelector('.chatbot-container');


function toggleChat() {
  chatContainer.classList.toggle('show');
}

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

  fetch("http://127.0.0.1:5000/chatbot", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ message: userText })
  })
  .then(res => res.json())
  .then(data => {
    addMessage(data.reply, "bot");
  })
  .catch(err => {
    addMessage("Erreur serveur", "bot");
  });
  }


sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleUserInput();
});  