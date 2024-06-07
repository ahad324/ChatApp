import React, { useState, useEffect, useRef } from "react";
import { ID, Query, Role, Permission } from "appwrite";
import { Trash2, Edit } from "react-feather";
import { format, isToday, isYesterday } from "date-fns";
import Header from "../components/Header";
import Heart from "../components/Heart";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import client, {
  databases,
  DATABASE_ID,
  COLLECTION_ID_MESSAGE,
} from "../appwriteConfig";
import { useAuth } from "../utils/AuthContext";
import messageSound from "../sounds/notification.mp3";

const messageAudio = new Audio(messageSound);

// Function to play the message sound
const playMessageSound = () => {
  messageAudio.currentTime = 0;
  messageAudio.play();
};
function Room() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageBody, setmessageBody] = useState("");
  const messagesEndRef = useRef(null);
  const [sendingMessage, setsendingMessage] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchingAllMessage = getMessages();
    toast.promise(fetchingAllMessage, {
      pending: "Loading Messages ...",
      error: "Failed to Load Messages ☹",
    });

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGE}.documents`,
      (response) => {
        // console.log(response);
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          const newMessage = response.payload;
          // Checking if the new message is from a different user
          setMessages((prevState) => [...prevState, newMessage]);
          if (newMessage.user_id !== user.$id) {
            playMessageSound();
          }
        }
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.delete"
          )
        ) {
          // console.log("ITEM DELETED!!!");
          setMessages((prevState) =>
            prevState.filter((message) => message.$id !== response.payload.$id)
          );
        }
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.update"
          )
        ) {
          setMessages((prevState) => {
            // Find the index of the message to update
            const index = prevState.findIndex(
              (message) => message.$id === response.payload.$id
            );
            if (index !== -1) {
              // If found, update the message at that index
              prevState[index] = response.payload;
              return [...prevState];
            } else {
              // If not found, returning the previous state
              return prevState;
            }
          });
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setsendingMessage(true);
    let payload = {
      user_id: user.$id,
      username: user.name,
      body: messageBody,
    };
    let permissions = [Permission.write(Role.user(user.$id))];
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID_MESSAGE,
      ID.unique(),
      payload,
      permissions
    );
    setsendingMessage(false);
    setmessageBody("");
  };

  const getMessages = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_MESSAGE,
        [Query.orderAsc("$createdAt")]
      );
      if (response.documents) {
        setMessages(response.documents);
      } else {
        console.error("Failed to fetch documents. Response:", response);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const deleteMessage = async (message_id) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID_MESSAGE,
        message_id
      );
      toast.success("Message deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete message ☹");
      console.error("Error deleting message:", error);
    }
  };
  const editMessage = async (message_id, editedMessage) => {
    try {
      const UpdatedMessage = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID_MESSAGE,
        message_id,
        { body: editedMessage }
      );
      toast.success("Message edited successfully!");
    } catch (error) {
      toast.error("Failed to edit message ☹");
      console.error("Error updating message:", error);
    }
  };

  const renderMessagesByCategory = (categoryMessages, category) => {
    if (categoryMessages.length > 0) {
      return (
        <>
          <span className="Category--Messages--Text--Span">
            <p>{category}</p>
          </span>
          <div className="messages--container">
            {categoryMessages.map((message) => (
              <div key={message.$id} className="message--wrapper">
                <div className="message--header">
                  <p>
                    {message?.username ? (
                      <span>{message.username}</span>
                    ) : (
                      <span>Anonymous User</span>
                    )}
                    <small className="message-timestamp">
                      {new Date(message.$createdAt).toLocaleTimeString()}
                    </small>
                  </p>
                  <span className="Edit--Delete--Icons--Span">
                    {message.$permissions.includes(
                      `delete(\"user:${user.$id}\")`
                    ) && (
                      <Trash2
                        className="delete--btn"
                        onClick={() => {
                          deleteMessage(message.$id);
                        }}
                      />
                    )}
                    {message.$permissions.includes(
                      `update(\"user:${user.$id}\")`
                    ) && (
                      <Edit
                        className="edit--btn"
                        onClick={() => {
                          const editedMessage = prompt(
                            "Enter your edited message:"
                          );
                          if (editedMessage !== null) {
                            editMessage(message.$id, editedMessage);
                          }
                        }}
                      />
                    )}
                  </span>
                </div>
                <div className="message--body">{message.body}</div>
                <div ref={messagesEndRef} />
              </div>
            ))}
          </div>
        </>
      );
    }
    return null;
  };

  const todayMessages = messages.filter((message) =>
    isToday(new Date(message.$createdAt))
  );
  const yesterdayMessages = messages.filter((message) =>
    isYesterday(new Date(message.$createdAt))
  );
  const olderMessages = messages.filter(
    (message) =>
      !isToday(new Date(message.$createdAt)) &&
      !isYesterday(new Date(message.$createdAt))
  );

  return (
    <main className="container">
      <Header />

      <div className="room--container">
        {renderMessagesByCategory(olderMessages, "Previous")}
        {renderMessagesByCategory(yesterdayMessages, "Yesterday")}
        {renderMessagesByCategory(todayMessages, "Today")}
        <form onSubmit={handleSubmit} id="message--form">
          <div className="Message--Send--Container">
            <textarea
              required
              maxLength="1000"
              placeholder="Say Something...."
              onChange={(e) => {
                setmessageBody(e.target.value);
              }}
              value={messageBody}
              id="textarea"
            ></textarea>
            <div className="send-btn--wrapper">
              <button
                className={`btn btn--secondary ${
                  sendingMessage ? "sendingMessage" : ""
                }`}
                type="submit"
              >
                <div className="svg-wrapper-1">
                  <div className="svg-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                    >
                      <path fill="none" d="M0 0h24v24H0z"></path>
                      <path
                        fill="currentColor"
                        d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <span>Send</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <Heart />
      <ToastContainer />
    </main>
  );
}

export default Room;
