import React, { useState, useEffect } from "react";
import "../styles/Heart.css";
import { useAuth } from "../utils/AuthContext";
import client, {
  databases,
  DATABASE_ID,
  COLLECTION_ID_MESSAGE,
  COLLECTION_ID_LIKES,
} from "../appwriteConfig";
import { Query } from "appwrite";

const Heart = () => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [documentIDforLikesCount, setdocumentIDforLikesCount] = useState(null);
  useEffect(() => {
    fetchUserAttributes();
    fetchLikesCount();

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID_LIKES}.documents`,
      (response) => {
        // console.log(response.payload.LikesCount);
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.update"
          )
        ) {
          // console.log("ITEM Updated");
          setLikesCount(response.payload.LikesCount);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Heart Like / Dislike Logic/Code
  const fetchUserAttributes = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_MESSAGE,
        [Query.equal("user_id", user.$id)]
      );

      if (response.documents.length > 0) {
        const userDoc = response.documents[0];
        setLiked(userDoc.like);
      } else {
        console.error("Failed to fetch Like Status. Response:", response);
      }
    } catch (error) {
      console.error("Error checking if liked:", error);
    }
  };
  const handleHeartClicked = async () => {
    const newLikedStatus = !liked;
    setLiked(newLikedStatus);
    if (newLikedStatus) {
      setLikesCount(likesCount + 1);
      await addLike();
    } else {
      setLikesCount(likesCount - 1);
      await removeLike();
    }
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID_MESSAGE,
      [Query.equal("user_id", user.$id)]
    );

    if (response.documents.length > 0) {
      const userDoc = response.documents[0];
      setLiked(newLikedStatus);
      updateLikedStatusInDatabase(userDoc.$id, newLikedStatus);
    }
  };

  const updateLikedStatusInDatabase = async (documentId, newLikedStatus) => {
    try {
      const updatedDocument = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID_MESSAGE,
        documentId,
        { like: newLikedStatus }
      );
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  // Likes Counter Logic/Code
  const fetchLikesCount = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_LIKES,
        []
      );
      if (response.documents.length > 0) {
        setLikesCount(response.documents[0].LikesCount);
        setdocumentIDforLikesCount(response.documents[0].$id);
      }
    } catch (error) {
      console.error("Error fetching likes count:", error);
    }
  };
  const addLike = async () => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID_LIKES,
        documentIDforLikesCount,
        {
          LikesCount: likesCount + 1,
        }
      );
    } catch (error) {
      console.error("Error adding like:", error);
    }
  };
  const removeLike = async () => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID_LIKES,
        documentIDforLikesCount,
        {
          LikesCount: likesCount - 1,
        }
      );
    } catch (error) {
      console.error("Error removing like:", error);
    }
  };
  return (
    <div className="Heart--Container">
      <p>Love it?</p>
      <div className="Heart--Counter--Container">
        <div className="con-like">
          <input
            className="like"
            type="checkbox"
            title="like"
            name="like"
            checked={liked}
            onClick={handleHeartClicked}
            readOnly
          />
          <div className="checkmark">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="outline"
              viewBox="0 0 24 24"
            >
              <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"></path>
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="filled"
              viewBox="0 0 24 24"
            >
              <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"></path>
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="100"
              width="100"
              className="celebrate"
            >
              <polygon className="poly" points="10,10 20,20"></polygon>
              <polygon className="poly" points="10,50 20,50"></polygon>
              <polygon className="poly" points="20,80 30,70"></polygon>
              <polygon className="poly" points="90,10 80,20"></polygon>
              <polygon className="poly" points="90,50 80,50"></polygon>
              <polygon className="poly" points="80,80 70,70"></polygon>
            </svg>
          </div>
        </div>
        <strong>{likesCount}</strong>
      </div>
    </div>
  );
};

export default Heart;
