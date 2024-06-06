import React, { useState, useEffect } from "react";
import { ID, Query, Role, Permission } from "appwrite";
import { Trash2, Edit } from "react-feather";
import Header from "../components/Header";
import Heart from "../components/Heart";
import client, {
  databases,
  DATABASE_ID,
  COLLECTION_ID_MESSAGE,
} from "../appwriteConfig";
import { useAuth } from "../utils/AuthContext";

function Room() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageBody, setmessageBody] = useState("");

  useEffect(() => {
    getMessages();

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGE}.documents`,
      (response) => {
        // console.log(response);
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          // console.log("ITEM CREATED");
          setMessages((prevState) => [response.payload, ...prevState]);
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
              // If not found, return the previous state as is
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = {
      user_id: user.$id,
      username: user.name,
      body: messageBody,
      like: false,
    };
    let permissions = [Permission.write(Role.user(user.$id))];
    let response = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID_MESSAGE,
      ID.unique(),
      payload,
      permissions
    );

    setmessageBody("");
  };

  const getMessages = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_MESSAGE,
        [Query.orderDesc("$createdAt")]
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
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTION_ID_MESSAGE,
      message_id
    );
  };
  const editMessage = async (message_id, editedMessage) => {
    try {
      const UpdatedMessage = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID_MESSAGE,
        message_id,
        { body: editedMessage }
      );
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  return (
    <main className="container">
      <Header />
      <div className="room--container">
        <form onSubmit={handleSubmit} id="message--form">
          <div>
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
          </div>
          <div className="send-btn--wrapper">
            <input className="btn btn--secondary" type="submit" value="Send" />
          </div>
        </form>

        <div className="messages--container">
          {messages.map((message) => (
            <div key={message.$id} className="message--wrapper">
              <div className="message--header">
                <p>
                  {message?.username ? (
                    <span>{message.username}</span>
                  ) : (
                    <span>Anonymouse User</span>
                  )}
                  <small className="message-timestamp">
                    {new Date(message.$createdAt).toLocaleString()}
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
                    `delete(\"user:${user.$id}\")`
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
            </div>
          ))}
        </div>
      </div>
      <Heart />
    </main>
  );
}

export default Room;
