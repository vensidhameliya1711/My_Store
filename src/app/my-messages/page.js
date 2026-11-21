"use client";

import { useEffect, useState } from "react";

export default function MyMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data) => setMessages(data.data));
  }, []);

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg._id}>
          <p>{msg.message}</p>

          {msg.reply ? (
            <div>
              Admin Reply: {msg.reply}
            </div>
          ) : (
            <p>Waiting for admin reply...</p>
          )}
        </div>
      ))}

    </div>
  );
}