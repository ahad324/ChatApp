import React, { useState, useEffect } from "react";
import "../styles/Heart.css";
import { useAuth } from "../utils/AuthContext";
import client, {
  databases,
  DATABASE_ID,
  COLLECTION_ID_USER_LIKES,
  COLLECTION_ID_LIKES,
} from "../appwriteConfig";
import { ID, Query } from "appwrite";

const Heart = () => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [documentIDforLikesCount, setDocumentIDforLikesCount] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [allLikedByUsers, setAllLikedByUsers] = useState([]);
  const [displayedLikedByUsers, setDisplayedLikedByUsers] = useState([]);
  const [showMoreButton, setShowMoreButton] = useState(false);

  useEffect(() => {
    fetchUserLikeStatus();
    fetchLikesCount();
    fetchLikedBy();
  }, []);

  useEffect(() => {
    const likesCountUnsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID_LIKES}.documents`,
      (response) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.update"
          )
        ) {
          setLikesCount(response.payload.LikesCount);
        }
      }
    );

    const likedByUnsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID_USER_LIKES}.documents`,
      (response) => {
        fetchLikedBy();
      }
    );

    return () => {
      likesCountUnsubscribe();
      likedByUnsubscribe();
    };
  }, []);

  const fetchUserLikeStatus = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_USER_LIKES,
        [Query.equal("user_id", user.$id)]
      );
      if (response.total > 0) {
        setLiked(true);
      } else {
        setLiked(false);
      }
    } catch (error) {
      console.error("Error fetching user like status:", error);
    }
  };

  const handleHeartClicked = async () => {
    if (updating) return;
    setUpdating(true);

    try {
      if (!liked) {
        await addLike();
      } else {
        await removeLike();
      }
    } catch (error) {
      console.error("Error handling heart click:", error);
    } finally {
      setUpdating(false);
    }
  };

  const addLike = async () => {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID_USER_LIKES,
        ID.unique(),
        { user_id: user.$id, liked: true, username: user.name }
      );
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID_LIKES,
        documentIDforLikesCount,
        { LikesCount: likesCount + 1 }
      );

      setLiked(true);
      setLikesCount((prevLikes) => prevLikes + 1);
    } catch (error) {
      console.error("Error adding like:", error);
    }
  };

  const removeLike = async () => {
    try {
      const userLikeResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_USER_LIKES,
        [Query.equal("user_id", user.$id)]
      );

      if (userLikeResponse.total > 0) {
        const userLikeDocumentId = userLikeResponse.documents[0].$id;

        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_ID_USER_LIKES,
          userLikeDocumentId
        );
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID_LIKES,
          documentIDforLikesCount,
          { LikesCount: Math.max(0, likesCount - 1) }
        );

        setLiked(false);
        setLikesCount((prevLikes) => Math.max(0, prevLikes - 1));
      } else {
        console.error("User like document not found for deletion");
      }
    } catch (error) {
      console.error("Error removing like:", error);
    }
  };

  const fetchLikesCount = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_LIKES,
        []
      );
      if (response.total > 0) {
        setLikesCount(response.documents[0].LikesCount);
        setDocumentIDforLikesCount(response.documents[0].$id);
      } else {
        console.error("Failed to fetch likes count. Response:", response);
      }
    } catch (error) {
      console.error("Error fetching likes count:", error);
    }
  };

  const fetchLikedBy = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_USER_LIKES,
        []
      );

      const likedUsers = response.documents.map((doc) => doc.username);
      setAllLikedByUsers(likedUsers);

      if (likedUsers.length > 3) {
        setDisplayedLikedByUsers(likedUsers.slice(0, 3));
        setShowMoreButton(true);
      } else {
        setDisplayedLikedByUsers(likedUsers);
        setShowMoreButton(false);
      }
    } catch (error) {
      console.error("Error fetching liked by users:", error);
    }
  };

  const handleShowAllLikedBy = () => {
    setDisplayedLikedByUsers(allLikedByUsers);
    setShowMoreButton(false);
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
        <div className="Heart--Counter">
          <p>{likesCount}</p>
        </div>
        <div className="LikedBY">
          <p>Liked By</p>
          <ul>
            {displayedLikedByUsers.map((username, index) => (
              <li key={index}>{username}</li>
            ))}
          </ul>
          {showMoreButton && (
            <button className="Show--More--Btn" onClick={handleShowAllLikedBy}>
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Heart;
