function saveCredentials() {
    const token = document.getElementById("token").value;
    const hash = document.getElementById("hash").value;
    localStorage.setItem("token", token);
    localStorage.setItem("hash", hash);
    alert("Credentials saved successfully!");
  }

  const socket = io();

  socket.on("connect", () => {
    console.log("Connected to server");
    authenticateUser();
  });

  socket.on("socketError", (error) => {
    console.error("Socket error:", error.message);
  });

  socket.on("messageError", (error) => {
    console.error("Message error:", error.message);
  });

  socket.on("newMessage", (data) => {
    console.log("New message:", data);

    if (
      data.senderHash === urlparams.get("hash") &&
      data.receiverHash === localStorage.getItem("hash")
    ) {
      const message = document.createElement("li");
      message.className =
        data.senderHash === localStorage.getItem("hash")
          ? "message sender"
          : "message receiver";
      message.textContent = data.message;
      chatMessages.appendChild(message);
    } else if (
      data.receiverHash === urlparams.get("hash") &&
      data.senderHash === localStorage.getItem("hash")
    ) {
      const message = document.createElement("li");
      message.className =
        data.senderHash === localStorage.getItem("hash")
          ? "message sender"
          : "message receiver";
      message.textContent = data.message;
      chatMessages.appendChild(message);
    }
  });

  socket.on("typing", (data) => {
    if (
      data.senderHash === urlparams.get("hash") &&
      data.receiverHash === localStorage.getItem("hash")
    ) {
      if (!document.getElementById("typingC")) {
        const message = document.createElement("li");
        message.className = "message receiver";
        message.id = "typingC";
        message.textContent = "Typing...";
        chatMessages.appendChild(message);
      } else {
        document.getElementById("typingC").textContent =
          "Typing: " + data.message;
      }
    }
  });

  socket.on("stoppedTyping", (data) => {
    if (
      data.senderHash === urlparams.get("hash") &&
      data.receiverHash === localStorage.getItem("hash")
    ) {
      if (document.getElementById("typingC")) {
        document.getElementById("typingC").remove();
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });

  // Check if the user is typing a message in the input field

  let typingTimer;
  const doneTypingInterval = 500;

  messageInput.addEventListener("input", () => {
    const data = {
      senderHash: localStorage.getItem("hash"), // Replace with actual sender hash
      receiverHash: urlparams.get("hash"), // Replace with actual receiver hash
      chatId: urlparams.get("id"),
      message: messageInput.value,
    };
    socket.emit("typing", data);

    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
      socket.emit("stoppedTyping", data);
    }, doneTypingInterval);
  });

  messageInput.addEventListener("change", () => {
    clearInterval(typingTimer);
  });

  function authenticateUser() {
    socket.emit("authenticateUser", localStorage.getItem("token"));
  }

  function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== "") {
      const chatMessages = document.getElementById("chat-messages");
      const messageC = document.createElement("li");
      messageC.className = "message sender";
      messageC.textContent = message;
      chatMessages.appendChild(messageC);
      const data = {
        senderHash: localStorage.getItem("hash"), // Replace with actual sender hash
        receiverHash: urlparams.get("hash"), // Replace with actual receiver hash
        message: message,
      };
      socket.emit("newMessage", data);
      messageInput.value = "";
    }
  }