import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth0 } from "@auth0/auth0-react";

const SERVER_URL = process.env.REACT_APP_BACK_APP;
const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);
  const [userList, setUserList] = useState([]);
  const [predictions, setPredictions] = useState([]); // Tracks individual prediction submissions if needed by UI before reveal
  const [finalPredictions, setFinalPredictions] = useState([]); // Stores aggregated/revealed prediction results
  const [comments, setComments] = useState([]);
  const [actions, setActions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roomStatusMessage, setRoomStatusMessage] = useState(null); // Displays messages like 'room closed', 'room expired'

  useEffect(() => {
    if (!isAuthenticated || !user) return; // Socket connection requires authenticated user with details

    const socketInstance = io(SERVER_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      transports: ["websocket"]
    });

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket:", socketInstance.id);
      setIsConnected(true);
      setError(null);
      setRoomStatusMessage(null); // Clear any previous room status messages
      
      // If already in a room (e.g., after a reconnect), rejoin automatically
      if (roomId && inviteCode && user.name && user.email) {
        socketInstance.emit("join_room", { 
          invite_code: inviteCode, 
          name: user.name, 
          email: user.email 
        });
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket:", reason);
      setIsConnected(false);
    });

    socketInstance.on("error", (err) => {
      console.error("Socket error:", err);
      setError(err?.message || "Socket error");
    });

    socketInstance.on("user_list", (users) => {
      console.log("Received user list:", users);
      setUserList(users); // Server provides the authoritative list of users and their submission status
    });

    // Refinement room socket event handlers
    socketInstance.on("prediction_submitted", (data) => {
      console.log("Prediction submitted (event from server):", data);
      // This event signals a prediction was made. The 'user_list' event typically updates UI regarding who submitted.
      // Individual prediction values are usually not shown until 'results_revealed'.
    });

    socketInstance.on("session_reset", () => {
      console.log("Session reset received");
      setPredictions([]); 
      setFinalPredictions([]); 
      // The 'user_list' event from the server will reflect reset submission statuses.
    });
    
    socketInstance.on("results_revealed", (revealedPredictions) => {
      console.log("Results revealed received:", revealedPredictions);
      setFinalPredictions(revealedPredictions); // Update state with the final, aggregated predictions
    });

    // Retro room socket event handlers
    socketInstance.on("initial_comments", (initialComments) => {
      console.log("Initial comments received:", initialComments);
      setComments(initialComments); // Load existing comments when joining a retro room
    });

    socketInstance.on("new_comment", (comment) => {
      console.log("New comment received:", comment);
      setComments(prev => [...prev, comment]);
    });

    socketInstance.on("comment_updated", (updatedComment) => {
      console.log("Comment updated received:", updatedComment);
      setComments(prev => prev.map(c => c.id === updatedComment.id ? updatedComment : c));
    });

    socketInstance.on("comment_deleted", ({ comment_id }) => {
      console.log("Comment deleted received:", comment_id);
      setComments(prev => prev.filter(c => c.id !== comment_id));
    });

    socketInstance.on("action_added", (action) => { 
      console.log("New action received (action_added):", action);
      setActions(prev => [...prev, action]);
    });

    // Handlers for server-initiated room status changes
    socketInstance.on("room_closed", (data) => {
      console.log("Room closed:", data.message);
      setRoomStatusMessage(data.message || "This room has been closed by the host.");
    });

    socketInstance.on("room_expired", (data) => {
      console.log("Room expired:", data.message);
      setRoomStatusMessage(data.message || "This room has expired and been closed.");
    });

    socketInstance.on("server_shutdown", (data) => {
      console.log("Server shutdown:", data.message);
      setRoomStatusMessage(data.message || "Server is shutting down. Please try again later.");
    });
    
    setSocket(socketInstance);

    // Cleanup function: disconnect socket when component unmounts or dependencies change
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, user, roomId, inviteCode]); // Effect dependencies

  // Generic HTTP request utility function
  const request = useCallback(async (url, method, body = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER_URL}${url}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null,
      });
      const data = await res.json();
      if (!res.ok || !data.success) { // Check both HTTP status and application-level success flag
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error (${url}):`, err);
      setError(err.message);
      // If the error message indicates a room status issue, reflect it in roomStatusMessage
      if (err.message.includes("expired") || err.message.includes("finished") || err.message.includes("closed")) {
        setRoomStatusMessage(err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array as SERVER_URL is a constant defined outside this scope

  // Helper function to emit 'join_room' socket event and update local state
  const emitJoinRoom = useCallback((currentInviteCode, currentRoomId) => {
    if (socket && isConnected && user && user.name && user.email && currentInviteCode && currentRoomId) {
      socket.emit("join_room", { 
        invite_code: currentInviteCode, 
        name: user.name, 
        email: user.email,
      });
      setRoomId(currentRoomId);
      setInviteCode(currentInviteCode);
      // Reset data from any previous room
      setPredictions([]);
      setFinalPredictions([]);
      setComments([]);
      setActions([]);
      setUserList([]);
      setRoomStatusMessage(null);
      setError(null);
    }
  }, [socket, isConnected, user]);

  // Function to create a new room via HTTP POST
  const createRoom = useCallback(async (roomType) => {
    if (!user || !user.name || !user.email) {
      setError("User not authenticated or user details missing");
      return null;
    }
    const endpoint = "/create/room"; // Server uses a single endpoint for room creation
    const data = await request(endpoint, "POST", { room_type });

    if (data && data.room_id && data.invite_code) {
      // After successful HTTP creation, join the room via WebSocket
      emitJoinRoom(data.invite_code, data.room_id);
      return data;
    }
    return null;
  }, [user, request, emitJoinRoom]);

  // Specific room creation functions, delegating to the generic createRoom
  const createAndJoinRefinementRoom = useCallback(() => createRoom('refinement'), [createRoom]);
  const createAndJoinRetroRoom = useCallback(() => createRoom('retro'), [createRoom]);

  // Function to join an existing room via HTTP POST
  const joinRoom = useCallback(async (invite_code_to_join) => {
    if (!user || !user.name || !user.email) {
      setError("User not authenticated or user details missing");
      return null;
    }
    const data = await request(`/join/room`, "POST", {
      name: user.name,
      email: user.email,
      invite_code: invite_code_to_join,
    });

    if (data && data.room_id) {
      // After successful HTTP join, confirm join via WebSocket
      emitJoinRoom(invite_code_to_join, data.room_id);
      return data;
    }
    return null;
  }, [user, request, emitJoinRoom]);
  
  // Specific room joining functions, delegating to the generic joinRoom
  const joinRefinementRoom = useCallback((invite_code_to_join) => joinRoom(invite_code_to_join), [joinRoom]);
  const joinRetroRoom = useCallback((invite_code_to_join) => joinRoom(invite_code_to_join), [joinRoom]);

  // Function to leave the current room
  const leaveRoom = useCallback(() => {
    if (!roomId || !socket || !isConnected) return;
    socket.emit("leave_room", { roomId }); // Notify server
    console.log(`Left room: ${roomId}`);
    // Reset local room-specific state
    setRoomId(null);
    setInviteCode(null);
    setPredictions([]);
    setFinalPredictions([]);
    setComments([]);
    setActions([]);
    setUserList([]);
    setRoomStatusMessage(null); 
  }, [roomId, socket, isConnected]);

  // Function to submit a prediction in a refinement room
  const submitPrediction = useCallback(async (role, predictionValue) => {
    if (!roomId || !user || !user.name) { 
      setError("No room ID set or user details missing");
      return null;
    }
    // Persist prediction via HTTP POST
    const data = await request("/refinement/prediction/submit", "POST", { 
      room_id: roomId, 
      name: user.name, 
      role, 
      prediction: predictionValue 
    });

    if (data && socket && isConnected) {
      // Emit socket event to notify other users in real-time (server will broadcast 'prediction_submitted')
      socket.emit("submit_prediction", { 
        room_id: roomId, 
        name: user.name, 
        role, 
        prediction: predictionValue 
      });
      // The server's 'user_list' event will update hasSubmitted status for users.
      return data;
    }
    return null;
  }, [roomId, user, socket, isConnected, request]);

  // Function to fetch final aggregated predictions for a refinement room
  const getPredictions = useCallback(async () => {
    if (!roomId) {
      setError("No room ID set");
      return null;
    }
    const data = await request(`/refinement/get/predictions?room_id=${roomId}`, "GET");
    if (data && data.predictions) { 
      setFinalPredictions(data.predictions); 
      return data.predictions;
    }
    return null;
  }, [roomId, request]);

  // Function to trigger a session reset in a refinement room
  const resetSession = useCallback(() => {
    if (!roomId || !socket || !isConnected) {
      setError("Cannot reset session: not connected to a room");
      return false;
    }
    socket.emit("reset_session", { room_id: roomId });
    // Client-side state (predictions, finalPredictions) is cleared by the 'session_reset' socket event handler.
    return true;
  }, [roomId, socket, isConnected]);
  
  // Function to trigger revealing results in a refinement room
  const revealResults = useCallback((predictionsToReveal) => { 
    if (!roomId || !socket || !isConnected) {
      setError("Cannot reveal results: not connected to a room");
      return false;
    }
    socket.emit("reveal_results", { room_id: roomId, predictions: predictionsToReveal });
    // Client-side state (finalPredictions) is updated by the 'results_revealed' socket event handler.
    return true;
  }, [roomId, socket, isConnected]);

  // Function to add a new comment in a retro room
  const addComment = useCallback(async (commentText) => {
    if (!roomId || !user || !user.name || !user.email) { 
      setError("No room ID set or user details missing");
      return null;
    }
    // HTTP POST handles database save; server then broadcasts "new_comment" event
    const data = await request("/retro/new/comment", "POST", { 
      room_id: roomId, 
      comment: commentText,
      user_name: user.name, 
      email: user.email     
    });
    return data; 
  }, [roomId, user, request]);

  // Function to update an existing comment in a retro room
  const updateComment = useCallback(async (commentId, newCommentText) => {
    if (!roomId || !user || !user.name) {
      setError("Cannot update comment: missing info or not authenticated.");
      return null;
    }
    // HTTP PUT handles update; server then broadcasts "comment_updated" event
    const data = await request("/retro/update/comment", "PUT", {
      comment_id: commentId,
      comment: newCommentText,
      user_name: user.name, 
      room_id: roomId       
    });
    return data;
  }, [roomId, user, request]);

  // Function to delete a comment in a retro room
  const deleteComment = useCallback(async (commentId) => {
    if (!roomId || !user || !user.name) {
      setError("Cannot delete comment: missing info or not authenticated.");
      return null;
    }
    // HTTP DELETE handles deletion; server then broadcasts "comment_deleted" event
    const data = await request("/retro/delete/comment", "DELETE", {
      comment_id: commentId,
      user_name: user.name, 
      room_id: roomId       
    });
    return data;
  }, [roomId, user, request]);

  // Function to create a new action item in a retro room
  const createAction = useCallback(async (description, assignee_name_param) => {
    if (!roomId || !user || !user.name) { 
      setError("No room ID or user details missing");
      return null;
    }
    const assigneeName = assignee_name_param || user.name; // Default assignee to current user if not specified

    // HTTP POST handles database save; server then broadcasts "action_added" event
    const data = await request("/retro/create/action", "POST", { 
      room_id: roomId, 
      user_name: user.name, // Creator of the action
      description,
      assignee_name: assigneeName // User to whom the action is assigned
    });
    return data;
  }, [roomId, user, request]);

  // Function for components to subscribe to arbitrary socket events
  const subscribe = useCallback((event, callback) => {
    if (!socket) return () => {}; // No socket instance to subscribe to
    
    console.log(`Subscribing to ${event}`);
    socket.off(event, callback); // Remove previous listener for this exact callback to avoid duplicates
    socket.on(event, callback);  // Add the new listener
    
    // Return a cleanup function to unsubscribe
    return () => {
      console.log(`Unsubscribing from ${event}`);
      socket.off(event, callback); // Remove the specific listener on cleanup
    };
  }, [socket]);

  // Memoized context value to prevent unnecessary re-renders of consuming components
  const contextValue = useMemo(() => ({
    socket,
    isConnected,
    roomId,
    inviteCode,
    userList,
    error,
    loading,
    predictions, 
    finalPredictions, 
    comments,
    actions,
    roomStatusMessage,
    
    createAndJoinRefinementRoom,
    createAndJoinRetroRoom,
    joinRefinementRoom, 
    joinRetroRoom,   
    leaveRoom,
    
    submitPrediction,
    getPredictions,
    resetSession,
    revealResults,
    
    addComment,
    updateComment, 
    deleteComment, 
    createAction,

    subscribe,
    clearError: () => setError(null),
    clearRoomStatusMessage: () => setRoomStatusMessage(null),

    // Function to reset client-side data stores
    resetData: () => {
      setPredictions([]);
      setFinalPredictions([]);
      setComments([]);
      setActions([]);
    }
  }), [
    socket, isConnected, roomId, inviteCode, userList, 
    error, loading, predictions, finalPredictions, comments, actions, roomStatusMessage,
    createAndJoinRefinementRoom, createAndJoinRetroRoom,
    joinRefinementRoom, joinRetroRoom, leaveRoom,
    submitPrediction, getPredictions, resetSession, revealResults, 
    addComment, updateComment, deleteComment, createAction, subscribe
    // Note: `user` is not directly in contextValue but used by many Callbacks which are in contextValue.
    // Its inclusion in useCallback dependency arrays ensures they get latest `user` details.
  ]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
