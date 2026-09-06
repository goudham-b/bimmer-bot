import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState("");
  const [connected, setConnected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (connected) {
      inputRef.current?.focus();
    }
  }, [connected]);

  const socketRef = useRef(null);
  const responseRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(
      "ws://localhost:8000/chat/message"
    );

    socketRef.current = ws;

    setMessages([
      {
        type: "system",
        content: "Establishing connection"
      }
    ]);

    ws.onopen = () => {
      console.log("WebSocket connected");

      ws.send(
        JSON.stringify({
          type: "handshake"
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connected") {
          console.log("WebSocket handshake successful");

          setConnected(true);

          setMessages([
            {
              type: "system",
              content: "Connection established ;)\n\nSample queries:\n1. \"Explain bmw m series.\"\n2. \"Analyse parts.csv\"\n\n"
            },
            {
              type: "assistant",
              content: `Running on ${typeof data.hardware === "string" ? data.hardware.toUpperCase() : data.hardware}`

            }
          ]);
          inputRef.current?.focus();
          return;
        }

        if (data.type === "token") {
          setProcessing(false);

          setMessages((previous) => {
            const updated = [...previous];
            const lastIndex = updated.length - 1;

            if (
              updated[lastIndex]?.type === "system" &&
              updated[lastIndex]?.content === "Thinking"
            ) {
              updated.pop();
            }

            if (
              updated.length > 0 &&
              updated[updated.length - 1].type === "assistant"
            ) {
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content:
                  updated[updated.length - 1].content +
                  data.content
              };

              return updated;
            }

            updated.push({
              type: "assistant",
              content: data.content
            });

            return updated;
          });

          return;
        }

        if (data.type === "task_result") {
          setProcessing(false);

          setMessages((previous) => {
            const updated = [...previous];

            const lastIndex = updated.length - 1;

            if (
              updated[lastIndex]?.type === "system" &&
              updated[lastIndex]?.content === "Thinking"
            ) {
              updated.pop();
            }

            updated.push({
              type: "assistant",
              content:
                typeof data.content === "string"
                  ? data.content
                  : JSON.stringify(data.content, null, 2)
            });
            return updated;
          });

          return;
        }

        if (data.type === "done") {
          console.log("Response complete");
          setProcessing(false);
          inputRef.current?.focus();
          return;
        }

        if (data.type === "error") {
          console.error("Server error:", data.message);

          setProcessing(false);

          setMessages((previous) => {
            const updated = [...previous];

            if (
              updated.length > 0 &&
              updated[updated.length - 1].type === "system" &&
              updated[updated.length - 1].content ===
              "Thinking"
            ) {
              updated.pop();
            }

            updated.push({
              type: "system",
              content: `Error: ${data.message}`
            });

            return updated;
          });

          return;
        }
      } catch (error) {
        console.error(
          "Invalid WebSocket response:",
          event.data
        );
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);

      setConnected(false);
      setProcessing(false);

      setMessages((previous) => [
        ...previous,
        {
          type: "system",
          content: "Connection failed :/\nPlease refresh the page."
        }
      ]);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");

      setConnected(false);
      setProcessing(false);
    };

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop =
        responseRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = () => {
    const socket = socketRef.current;

    if (
      !connected ||
      !socket ||
      socket.readyState !== WebSocket.OPEN ||
      processing ||
      !query.trim()
    ) {
      return;
    }

    const userQuery = query.trim();

    setMessages((previous) => [
      ...previous,
      {
        type: "user",
        content: userQuery
      },
      {
        type: "system",
        content: "Thinking"
      }
    ]);

    socket.send(
      JSON.stringify({
        type: "message",
        message: userQuery,
        history: []
      })
    );
    setProcessing(true);
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-100 flex-column">
      <div className="chat-container">

        <span className="bimmer-logo-font">
          {"Bi"}

          <span
            className="bimmer-slash"
            style={{ color: "#81C4FF" }}
          >
            /
          </span>

          <span
            className="bimmer-slash"
            style={{ color: "#16588E" }}
          >
            /
          </span>

          <span
            className="bimmer-slash"
            style={{ color: "#E7222E" }}
          >
            /
          </span>

          <span style={{ marginLeft: "20px" }}>
            {"mer"}
          </span>
        </span>

        <div
          ref={responseRef}
          className="response-container"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${message.type}`}
            >
              {message.type === "user" && (
                <>
                  <span className="message-label">
                    {"[user] :"}
                  </span>

                  <span className="message-content">
                    {message.content}
                  </span>
                </>
              )}

              {message.type === "system" && (
                <>
                  {/* <span className="message-label">
                    [system]
                  </span> */}

                  <span className="message-content">
                    {message.content}

                    {(
                      message.content ===
                      "Establishing connection" ||
                      message.content ===
                      "Thinking"
                    ) && (
                        <span className="loading-dots">
                          ...
                        </span>
                      )}
                  </span>
                </>
              )}

              {message.type === "assistant" && (
                <>
                  {/* <span className="message-label">
                    [assistant]
                  </span> */}

                  <span className="message-content">
                    {message.content}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "10px",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: "12px",
            width: "100%",
            marginBottom: "16px"
          }}
        >
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              maxLength={50}
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={
                !connected
                  ? "[ Establishing connection... ]"
                  : processing
                    ? "[ Please wait for my response ]"
                    : "[ Type here ]"
              }
              className="input-field"
              disabled={
                !connected ||
                processing
              }
            />

            <span className="input-helper-text">
              {"Limited to 50 characters"}
            </span>
          </div>

          <button
            className="send-button"
            onClick={handleSubmit}
            disabled={
              !connected ||
              processing ||
              !query.trim()
            }
          >
            {"Send >>>"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;
