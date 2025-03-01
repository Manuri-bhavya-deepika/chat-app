// import React, { useState, useRef, useEffect} from 'react'; 
// import Navbar from '../components/Navbar';
// import {FaSearch,FaThumbtack,FaArrowLeft} from 'react-icons/fa'; 
// import { Check, CheckCheck } from "lucide-react";


// type MessageStatus = "sent" | "delivered" | "read"; 

// interface Message 
// { 
//   sender: string; 
//   content: string; 
//   timestamp: string; 
//   pinned?: boolean;
//   status?: MessageStatus;
//   replyTo?: {
//     sender: string;
//     content: string;
//   } | null;
// } 

// interface RepliedMessage 
// {
//   sender: string;
//   content: string;
// }

// const Messaging: React.FC=() =>{
//   const [showChat] = useState(true);
//   const [activeUser, setActiveUser] = useState<string>(''); 
//   const [messages, setMessages] = useState<{ [key: string]: Message[] }>({}); 
//   const [messageInput, setMessageInput] = useState<string>(''); 
//   const [activePage] = useState<'chat' | 'users' | 'phone' | 'settings'>('chat'); 
//   const [searchTerm, setSearchTerm] = useState<string>(''); 
//   // const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false); 
//   const [hoveredMessage, setHoveredMessage] = useState<number | null>(null); 
//   const [messageOptions, setMessageOptions] = useState<number | null>(null);
//   const [repliedMessage, setRepliedMessage] = useState<RepliedMessage | null>(null);;
//   const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
//   const [forwardingUsers, setForwardingUsers] = useState<string[]>([]);
//   const [pinOptions, setPinOptions] = useState<{ index: number; show: boolean }>({ index: -1, show: false });
//   const [pinDuration, setPinDuration] = useState<number>(24 * 60 * 60 * 1000);
//   const chatEndRef = useRef<HTMLDivElement | null>(null); 
//   const actionMenuRef = useRef<HTMLDivElement | null>(null);
//   // const attachMenuRef = useRef<HTMLDivElement | null>(null); 
//   const users= ['User1', 'User2', 'User3']; 


// //PIN 
// const handlePinMessage = (index: number, isPinned: boolean) => {
// if (isPinned) 
// {
//   setMessages((prevMessages) => {
//     const userMessages: Message[] = prevMessages[activeUser] || [];
//     const updatedMessages = userMessages.map((msg, i) =>i === index ? { ...msg, pinned: false, pinnedUntil: null } : msg);
//     return {
//       ...prevMessages,
//       [activeUser]: updatedMessages,
//     };
//   });
// } 
// else 
// {
//   setPinOptions({ index, show: true });
// }
// };
// const confirmPinMessage = () => {
//   const expiration = pinDuration ? Date.now() + pinDuration : null;
//   setMessages((prevMessages) => {
//     const userMessages: Message[] = prevMessages[activeUser] || [];
//     const updatedMessages = userMessages.map((msg, i) =>
//       i === pinOptions.index ? { ...msg, pinned: true, pinnedUntil: expiration }: msg
//   );
//   return {
//     ...prevMessages,
//     [activeUser]: updatedMessages,
//   };
// });
// setPinOptions({ index: -1, show: false });
// };
  
  

// //FORWARD
// const handleForwardMessage = (message: Message) => {
//   setForwardingMessage(message);
//   setForwardingUsers([]);
// };
// const toggleUserSelection = (user: string) => {
//   setForwardingUsers((prevUsers) =>
//     prevUsers.includes(user)
//   ? prevUsers.filter((u) => u !== user)
//   : [...prevUsers, user]
//   );
// };
// const sendForwardedMessage = () => {
//   if (!forwardingMessage || forwardingUsers.length === 0) return;
//   const newMessage: Message = {
//     ...forwardingMessage,
//     sender: 'You',
//     timestamp: formatTime(new Date()),
//   };
//   setMessages((prevMessages) => {
//     const updatedMessages = { ...prevMessages };
//     forwardingUsers.forEach((user) => {
//       updatedMessages[user] = [...(prevMessages[user] || []), newMessage];
//     });
//     return updatedMessages;
//   });
//   setForwardingMessage(null);
//   setForwardingUsers([]);
// };


// // COPY
// const handleCopyMessage = (messageContent: string) => {
//   navigator.clipboard.writeText(messageContent).then(() => {
//     // alert('Message copied to clipboard!');
//   }).catch((err) => {
//     console.error('Error copying text: ', err);
//   });
//   setMessageOptions(null); 
// };



// // REPLY
// const handleReplyMessage = (message: Message) => {
//   setRepliedMessage(message); 
//   setMessageOptions(null);
// };
// const formatTime = (date: Date) => { 
//   return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
// };
// const startChat = (user: string) => { 
//   setActiveUser(user); 
//   if (!messages[user]) 
//     { 
//       setMessages((prevMessages) => ({ ...prevMessages, [user]: [] })); 
//     } 
// }; 
  

// // USER SENDING MESSAGE IN CHAT
// const sendMessage = () => { 
//   if (messageInput.trim()=== ''|| !activeUser) return; 
//   const newMessage: Message = {
//     sender: 'You',
//     content: messageInput,
//     timestamp: formatTime(new Date()),
//     pinned: false,
//     replyTo: repliedMessage ? { sender: repliedMessage.sender, content: repliedMessage.content } : null, // Include reply details
//   };

//   setMessages((prevMessages) => { 
//     const userMessages = prevMessages[activeUser] || []; 
//     return { 
//       ...prevMessages, 
//       [activeUser]: [...userMessages, newMessage], 
//     }; 
//   }); 
 
  
// //AUTO-REPLY 
// setTimeout(() => { 
//   const receivedMessage = { 
//     sender: activeUser, 
//     content: 'This is an auto-reply.', 
//     timestamp: formatTime(new Date()), 
//   }; 
// setMessages((prevMessages) => { 
//   const userMessages = prevMessages[activeUser] || []; 
//   return { 
//     ...prevMessages, 
//     [activeUser]: [...userMessages, receivedMessage], 
//   }; 
// }); 
// }, 500); 
// setMessageInput(''); 
// setRepliedMessage(null);
// }; 


// //MESSAGE SHOULD ENTER TO CHAT WHEN  CLICKED ON "ENTER" 
// const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => { 
//   if (event.key === 'Enter') 
//     { 
//       sendMessage(); 
//     } 
//   }; 

// // Close the action menu when clicking outside of it 
// useEffect(() => { 
//   const handleClickOutside = (event: MouseEvent) => { 
//     if ( 
//       actionMenuRef.current && 
//       !actionMenuRef.current.contains(event.target as Node) 
//     ) { 
//       setMessageOptions(null);  
//       } 
//     }; 
//     document.addEventListener('mousedown', handleClickOutside); 
//     return () => { 
//       document.removeEventListener('mousedown', handleClickOutside); 
//     }; 
//   }, []); 
//   useEffect(() => { 
//     if (chatEndRef.current) { 
//       chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
//     } 
//   }, [messages, activeUser]); 



// // Filter users based on the search term 
// const filteredUsers = users.filter((user) => 
//     user.toLowerCase().includes(searchTerm.toLowerCase()) 
// ); 



// // user chatting hover options message FaInfo,pin,star,delete
// const handleDeleteMessage = (index: number) => {
//   setMessages((prevMessages) => {
//     let userMessages = prevMessages[activeUser] || [];
//     userMessages = userMessages.filter((_, i) => i !== index);
//     return { ...prevMessages, [activeUser]: userMessages };
//   });
//   setMessageOptions(null);
// };


// return ( 
// <div className="flex min-h-screen overflow-hidden">
//   <div className={`md:block ${activeUser ? "hidden" : "block"}`}>
//     <Navbar />
//   </div>
  
// {showChat  && ( 
//   <div
//     className={`bg-gray-100 fixed top-0 left-0 h-screen transition-all duration-300 
//     ${activeUser ? "hidden md:block" : "block"} w-full md:w-[350px] lg:w-[450px] p-4 shadow-md overflow-y-auto z-40`}>
//     <div className="flex items-center justify-between mb-4"> 
//       <h1 className="text-3xl font-bold mt-16 sm:mt-20">Chats</h1> 
//       <div className="flex items-center space-x-4"> 
//       </div> 
//     </div> 
//   <div className="mb-4"> 
//     <div className="flex items-center border border-gray-300 rounded-full px-3 py-2"> 
//       <FaSearch size={20} className="text-gray-600" /> 
//       <input 
//       type="text" 
//       placeholder="Search" className="ml-6 w-full outline-none bg-transparent text-gray-700 text-lg" 
//       value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> 
//     </div> 
// </div> 


// {/* directing to respective chat */}
// <div className="space-y-4"> 
//   {filteredUsers.map((user) => ( 
//     <div 
//     key={user} 
//     className={`cursor-pointer p-2 rounded-md hover:bg-slate-400 ${activeUser === user ? 'bg-slate-400 text-white' : ''}`} 
//     onClick={() => startChat(user)} > 
//     {user} 
//     </div> 
//   ))} 
//   </div> 
// </div> 
// )}


// {/* Main Chat Area */}
// <div className={`h-full w-full transition-all duration-300
//   ${activeUser ? "block" : "hidden"} md:ml-[350px] lg:ml-[450px] pt-[4rem] relative`}>
//     {activePage === 'chat' && activeUser ? ( 
//       <> 
//       {/* here change */}
//       <div className="absolute top-0 left-0 w-full bg-slate-500 flex items-center text-white p-3 mt-0 md:mt-14 shadow-md">
//         <div className="flex items-center"> 
//           <button onClick={() => setActiveUser('')} className="mr-4 block sm:hidden"> 
//             <FaArrowLeft size={20} className="text-white" />
//           </button>
//           <div className="w-11 h-12 bg-blue-200 rounded-full flex justify-center items-center text-white"> 
//             {activeUser.charAt(0)} 
//           </div> 
//           <h1 className="ml-4 text-lg">{activeUser}</h1> 
//         </div> 
//       </div> 


// {/* Chat Messages */}
// <div className="bg-gray-400 w-auto p-4 overflow-y-auto h-[80vh] sm:pt-0 md:pt-[5rem]">
//   {messages[activeUser]?.filter(msg => msg.pinned).map((msg, index) => 
//   (<div key={`pinned-${index}`} 
//   className={`flex flex-col mb-3 w-full`}>
//     <div className={`flex-1 p-3 rounded-lg relative bg-gray-200 text-black text-left`}>
//       <div className="flex items-center space-x-2">
//         <FaThumbtack className="text-black text-md" /> 
//         <div className="flex-1">{msg.content}</div>
//       </div>
//     </div>
//   </div>
// ))}


// {messages[activeUser]?.map((msg, index) => ( 
//   <div key={index} className={`flex flex-col relative ${msg.sender === 'You' ? 'items-end' : 'items-start'} mb-3 `}
//   onMouseEnter={() => setHoveredMessage(index)} 
//   onMouseLeave={() => setHoveredMessage(null)}>
//     <div className={`max-w-lg p-3 rounded-lg relative ${msg.sender === 'You' ? 'bg-gray-300 text-black' : 'bg-gray-300'}`}>
//       <div className="flex items-center space-x-2">
//         <div className="flex-1">
//         {msg.replyTo && (
//         <div className="bg-blue-200 p-2 rounded-md mb-1 text-gray-800 text-sm border-l-4 border-blue-500 pl-3 w-full">
//           <p className="font-semibold text-blue-800">{msg.replyTo.sender}</p>
//           <p className="whitespace-pre-line">{msg.replyTo.content}</p>
//         </div>
//       )}
//       <div className="flex justify-between items-center w-full">
//         <p className="whitespace-pre-line">{msg.content}</p>
//       </div>
//       {msg.sender === "You" && (
//         <div className="flex text-right justify-end mt-1">
//           <span className="text-xs text-gray-600 ml-2">{msg.timestamp}</span>
//           {msg.status === "sent" ? (
//             <Check size={15} />
//           ) : (
//             <CheckCheck size={15} className="text-blue-500" />
//           )}
//         </div>
//       )}
//     </div>
//   </div>
// </div>


    
// {/* Show the arrow when hovered */}
// {hoveredMessage === index && ( 
//   <button className="absolute top-2 transform -translate-y-1/2  text-black hover:text-black" 
//   onClick={() => setMessageOptions(index)}> 
//   ˅ 
//   </button> 
// )}


// {/* Show the message options menu */}
// {messageOptions === index && (
//   <div ref={actionMenuRef} className="absolute top-6 right-0 bg-white border rounded-lg shadow-lg text-lg p-2 z-10 w-75" > 
//   <button className="block w-full text-left text-gray-700 hover:bg-gray-200 p-2" onClick={() => handleReplyMessage(msg)}>Reply</button> 
//   <button className="block w-full text-left text-gray-700 hover:bg-gray-200 p-2" onClick={() => handleCopyMessage(msg.content)}>Copy</button>
//   <button className="block w-full text-left text-gray-700 hover:bg-gray-200 p-2" onClick={() => handleForwardMessage(msg)}>Forward</button>
//   <button className="block w-full text-left text-gray-700 hover:bg-gray-200 p-2" onClick={() => handlePinMessage(index, msg?.pinned ?? false)}
//   >
//   {msg.pinned ? "Unpin" : "Pin"}
// </button>


// {pinOptions.show && (
//   <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
//     <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] text-center">
//       <h2 className="text-lg font-semibold mb-2">Choose how long your pin lasts</h2>
//       <p className="text-sm text-gray-600 mb-4">You can unpin at any time.</p>
//       <div className="space-y-2">
//         <label className="flex items-center justify-between p-2 border rounded">
//           <input type="radio" name="pinDuration" value={24 * 60 * 60 * 1000} 
//             onChange={(e) => setPinDuration(Number(e.target.value))} defaultChecked /> 
//           <span>24 Hours</span>
//         </label>
//         <label className="flex items-center justify-between p-2 border rounded">
//           <input type="radio" name="pinDuration" value={7 * 24 * 60 * 60 * 1000} 
//             onChange={(e) => setPinDuration(Number(e.target.value))} /> 
//           <span>7 Days</span>
//         </label>
//         <label className="flex items-center justify-between p-2 border rounded">
//           <input type="radio" name="pinDuration" value={30 * 24 * 60 * 60 * 1000} 
//             onChange={(e) => setPinDuration(Number(e.target.value))} /> 
//           <span>30 Days</span>
//         </label>
//       </div>
//       <div className="mt-4 flex justify-end space-x-2">
//         <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setPinOptions({ index: -1, show: false })}>Cancel</button>
//         <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={confirmPinMessage}>Pin</button>
//       </div>
//     </div>
//   </div>
// )}
// <button className="block w-full text-left text-gray-600 hover:bg-gray-200 p-2" onClick={() => handleDeleteMessage(index)}>Delete</button> 
// </div> 
// )}
// </div> 
// ))}
// <div ref={chatEndRef} /> 
// </div> 


// {/* forwarding message */}
// {forwardingMessage && (
//   <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-md shadow-lg w-64 h-72 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">
//     <h2 className="text-lg font-bold mb-2">Forward Message</h2>
//     <p className="mb-2">{forwardingMessage.content}</p>
//     <div className="space-y-2">
//       {users.map((user) => (
//         <div key={user} className="flex items-center space-x-2">
//           <input
//             type="checkbox"
//             id={user}
//             className="h-4 w-4"
//             checked={forwardingUsers.includes(user)}
//             onChange={() => toggleUserSelection(user)}
//           />
//           <label htmlFor={user} className="text-sm">{user}</label>
//         </div>
//       ))}
//     </div>
//     <div className="flex justify-between mt-4">
//       <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={sendForwardedMessage}>
//         Send
//       </button>
//       <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setForwardingMessage(null)}>
//         Cancel
//       </button>
//     </div>
//   </div>
// )}



// {/* replying to message */}
// <div className="relative w-full">  
// {repliedMessage && (
//   <div className="absolute bottom-[60px] left-0 w-full bg-gray-200 rounded-lg p-2 flex justify-between items-center shadow-md">
//   <div className="flex-1 text-left">
//     <p className="font-semibold">{repliedMessage.sender}</p>
//     <p className="truncate max-w-xs">{repliedMessage.content}</p>
//   </div>
//   <button className="text-gray-500 text-xl" onClick={() => setRepliedMessage(null)} title="Close Reply">
//     &#10005;
//   </button>
// </div>
// )}


// {/* Message Input */}
// <div className={` flex items-center space-x-2  rounded-full p-2 shadow-sm transition-all duration-200 ${repliedMessage ? 'pb-3' : 'pb-2'}`}>
// <input
// type="text"
// placeholder="Type a message..."
// className="w-full outline-none text-black text-lg"
// value={messageInput}
// onChange={(e) => setMessageInput(e.target.value)}
// onKeyDown={handleKeyPress}
// />
// <button onClick={sendMessage} className="ml-2  text-black px-4 py-2">Send</button>
// </div>
//   </div>
// </> 
// ) : activePage === 'chat' && !activeUser ? (
// <div className="flex flex-1 items-center justify-center h-screen"> 
//   <h1 className="text-3xl text-gray-400">Select a user to start chatting</h1> 
// </div> 
// ) : null} 
// </div> 
// </div> 
// ); 
// }; 
// export default Messaging;















import React, { useState, useRef, useEffect} from 'react'; 
import Navbar from '../components/Navbar';
import {FaSearch,FaThumbtack,FaArrowLeft} from 'react-icons/fa'; 
import { Check, CheckCheck } from "lucide-react";


type MessageStatus = "sent" | "delivered" | "read"; 

interface Message 
{ 
  sender: string; 
  content: string; 
  timestamp: string; 
  pinned?: boolean;
  status?: MessageStatus;
  replyTo?: {
    sender: string;
    content: string;
  } | null;
} 

interface RepliedMessage 
{
  sender: string;
  content: string;
}

const Messaging: React.FC=() =>{
  const [showChat] = useState(true);
  const [activeUser, setActiveUser] = useState<string>(''); 
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({}); 
  const [messageInput, setMessageInput] = useState<string>(''); 
  const [activePage] = useState<'chat' | 'users' | 'phone' | 'settings'>('chat'); 
  const [searchTerm, setSearchTerm] = useState<string>(''); 
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null); 
  const [messageOptions, setMessageOptions] = useState<number | null>(null);
  const [repliedMessage, setRepliedMessage] = useState<RepliedMessage | null>(null);;
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [forwardingUsers, setForwardingUsers] = useState<string[]>([]);
  const [pinOptions, setPinOptions] = useState<{ index: number; show: boolean }>({ index: -1, show: false });
  const [pinDuration, setPinDuration] = useState<number>(24 * 60 * 60 * 1000);
  const chatEndRef = useRef<HTMLDivElement | null>(null); 
  const actionMenuRef = useRef<HTMLDivElement | null>(null); 
  const users= ['User1', 'User2', 'User3']; 


//PIN 
const handlePinMessage = (index: number, isPinned: boolean) => {
if (isPinned) 
{
  setMessages((prevMessages) => {
    const userMessages: Message[] = prevMessages[activeUser] || [];
    const updatedMessages = userMessages.map((msg, i) =>i === index ? { ...msg, pinned: false, pinnedUntil: null } : msg);
    return {
      ...prevMessages,
      [activeUser]: updatedMessages,
    };
  });
} 
else 
{
  setPinOptions({ index, show: true });
}
};
const confirmPinMessage = () => {
  const expiration = pinDuration ? Date.now() + pinDuration : null;
  setMessages((prevMessages) => {
    const userMessages: Message[] = prevMessages[activeUser] || [];
    const updatedMessages = userMessages.map((msg, i) =>
      i === pinOptions.index ? { ...msg, pinned: true, pinnedUntil: expiration }: msg
  );
  return {
    ...prevMessages,
    [activeUser]: updatedMessages,
  };
});
setPinOptions({ index: -1, show: false });
};
  
  

//FORWARD
const handleForwardMessage = (message: Message) => {
  setForwardingMessage(message);
  setForwardingUsers([]);
};
const toggleUserSelection = (user: string) => {
  setForwardingUsers((prevUsers) =>
    prevUsers.includes(user)
  ? prevUsers.filter((u) => u !== user)
  : [...prevUsers, user]
  );
};
const sendForwardedMessage = () => {
  if (!forwardingMessage || forwardingUsers.length === 0) return;
  const newMessage: Message = {
    ...forwardingMessage,
    sender: 'You',
    timestamp: formatTime(new Date()),
  };
  setMessages((prevMessages) => {
    const updatedMessages = { ...prevMessages };
    forwardingUsers.forEach((user) => {
      updatedMessages[user] = [...(prevMessages[user] || []), newMessage];
    });
    return updatedMessages;
  });
  setForwardingMessage(null);
  setForwardingUsers([]);
};


// COPY
const handleCopyMessage = (messageContent: string) => {
  navigator.clipboard.writeText(messageContent).then(() => {
    // alert('Message copied to clipboard!');
  }).catch((err) => {
    console.error('Error copying text: ', err);
  });
  setMessageOptions(null); 
};



// REPLY
const handleReplyMessage = (message: Message) => {
  setRepliedMessage(message); 
  setMessageOptions(null);
};
const formatTime = (date: Date) => { 
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
};
const startChat = (user: string) => { 
  setActiveUser(user); 
  if (!messages[user]) 
    { 
      setMessages((prevMessages) => ({ ...prevMessages, [user]: [] })); 
    } 
}; 
  

// USER SENDING MESSAGE IN CHAT
const sendMessage = () => { 
  if (messageInput.trim()=== ''|| !activeUser) return; 
  const newMessage: Message = {
    sender: 'You',
    content: messageInput,
    timestamp: formatTime(new Date()),
    pinned: false,
    replyTo: repliedMessage ? { sender: repliedMessage.sender, content: repliedMessage.content } : null, // Include reply details
  };

  setMessages((prevMessages) => { 
    const userMessages = prevMessages[activeUser] || []; 
    return { 
      ...prevMessages, 
      [activeUser]: [...userMessages, newMessage], 
    }; 
  }); 
 
  
//AUTO-REPLY 
setTimeout(() => { 
  const receivedMessage = { 
    sender: activeUser, 
    content: 'This is an auto-reply.', 
    timestamp: formatTime(new Date()), 
  }; 
setMessages((prevMessages) => { 
  const userMessages = prevMessages[activeUser] || []; 
  return { 
    ...prevMessages, 
    [activeUser]: [...userMessages, receivedMessage], 
  }; 
}); 
}, 500); 
setMessageInput(''); 
setRepliedMessage(null);
}; 


//MESSAGE SHOULD ENTER TO CHAT WHEN  CLICKED ON "ENTER" 
const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => { 
  if (event.key === 'Enter') 
    { 
      sendMessage(); 
    } 
  }; 

// Close the action menu when clicking outside of it 
useEffect(() => { 
  const handleClickOutside = (event: MouseEvent) => { 
    if ( 
      actionMenuRef.current && 
      !actionMenuRef.current.contains(event.target as Node) 
    ) { 
      setMessageOptions(null);  
      } 
    }; 
    document.addEventListener('mousedown', handleClickOutside); 
    return () => { 
      document.removeEventListener('mousedown', handleClickOutside); 
    }; 
  }, []); 
  useEffect(() => { 
    if (chatEndRef.current) { 
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
    } 
  }, [messages, activeUser]); 



// Filter users based on the search term 
const filteredUsers = users.filter((user) => 
    user.toLowerCase().includes(searchTerm.toLowerCase()) 
); 



// user chatting hover options message FaInfo,pin,star,delete
const handleDeleteMessage = (index: number) => {
  setMessages((prevMessages) => {
    let userMessages = prevMessages[activeUser] || [];
    userMessages = userMessages.filter((_, i) => i !== index);
    return { ...prevMessages, [activeUser]: userMessages };
  });
  setMessageOptions(null);
};


return ( 
<div className="flex min-h-screen overflow-hidden">
  <div className={`md:block ${activeUser ? "hidden" : "block"}`}>
    <Navbar />
  </div>
  
{showChat  && ( 
  <div
    className={`bg-gray-100 fixed top-0 left-0 h-screen transition-all duration-300 
    ${activeUser ? "hidden md:block" : "block"} w-full md:w-[350px] lg:w-[450px] p-4 shadow-md overflow-y-auto z-40`}>
    <div className="flex items-center justify-between mb-4"> 
      <h1 className="text-3xl font-bold mt-16 sm:mt-20">Chats</h1> 
      <div className="flex items-center space-x-4"> 
      </div> 
    </div> 
  <div className="mb-4"> 
    <div className="flex items-center border border-gray-300 rounded-full px-3 py-2"> 
      <FaSearch size={20} className="text-gray-600" /> 
      <input 
      type="text" 
      placeholder="Search" className="ml-6 w-full outline-none bg-transparent text-gray-700 text-lg" 
      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> 
    </div> 
</div> 


{/* directing to respective chat */}
<div className="space-y-4"> 
  {filteredUsers.map((user) => ( 
    <div 
    key={user} 
    className={`cursor-pointer p-2 rounded-md hover:bg-slate-400 ${activeUser === user ? 'bg-slate-400 text-white' : ''}`} 
    onClick={() => startChat(user)} > 
    {user} 
    </div> 
  ))} 
  </div> 
</div> 
)}


{/* Main Chat Area */}
<div className={`h-full w-full transition-all duration-300
  ${activeUser ? "block" : "hidden"} md:ml-[350px] lg:ml-[450px] pt-[4rem] relative`}>
    {activePage === 'chat' && activeUser ? ( 
      <> 
      {/* here change */}
      <div className="absolute top-0 left-0 w-full bg-slate-500 flex items-center text-white p-3 mt-0 md:mt-14 shadow-md">
        <div className="flex items-center"> 
          <button onClick={() => setActiveUser('')} className="mr-4 block sm:hidden"> 
            <FaArrowLeft size={20} className="text-white" />
          </button>
          <div className="w-11 h-12 bg-blue-200 rounded-full flex justify-center items-center text-white"> 
            {activeUser.charAt(0)} 
          </div> 
          <h1 className="ml-4 text-lg">{activeUser}</h1> 
        </div> 
      </div> 


{/* Chat Messages */}
<div className="bg-gray-400 w-auto p-4 overflow-y-auto h-[80vh] sm:pt-0 md:pt-[5rem]">
  {messages[activeUser]?.filter(msg => msg.pinned).map((msg, index) => 
  (<div key={`pinned-${index}`} 
  className={`flex flex-col mb-3 w-full`}>
    <div className={`flex-1 p-3 rounded-lg relative bg-gray-200 text-black text-left`}>
      <div className="flex items-center space-x-2">
        <FaThumbtack className="text-black text-md" /> 
        <div className="flex-1">{msg.content}</div>
      </div>
    </div>
  </div>
))}


{messages[activeUser]?.map((msg, index) => ( 
  <div key={index} className={`flex flex-col relative ${msg.sender === 'You' ? 'items-end' : 'items-start'} mb-3 `}
  onMouseEnter={() => setHoveredMessage(index)}
  // onMouseEnter={() => !msg.content.includes('auto-reply') && setHoveredMessage(index)}  
  onMouseLeave={() => setHoveredMessage(null)}>
    <div className={`max-w-lg p-3 rounded-lg relative ${msg.sender === 'You' ? 'bg-gray-300 text-black' : 'bg-gray-300'}`}>
      <div className="flex items-center space-x-2">
        <div className="flex-1">
        {msg.replyTo && (
        <div className="bg-blue-200 p-2 rounded-md mb-1 text-gray-800 text-sm border-l-4 border-blue-500 pl-3 w-full">
          <p className="font-semibold text-blue-800">{msg.replyTo.sender}</p>
          <p className="whitespace-pre-line">{msg.replyTo.content}</p>
        </div>
      )}
      <div className="flex justify-between items-center w-full">
        <p className="whitespace-pre-line">{msg.content}</p>
      </div>
      {msg.sender === "You" && (
        <div className="flex text-right justify-end mt-1">
          <span className="text-xs text-gray-600 ml-2">{msg.timestamp}</span>
          {msg.status === "sent" ? (
            <Check size={15} />
          ) : (
            <CheckCheck size={15} className="text-blue-500" />
          )}
        </div>
      )}
    </div>
  </div>
</div>


    
{/* Show the arrow when hovered */}
{hoveredMessage === index && ( 
  <button className="absolute top-2 transform -translate-y-1/2  text-black hover:text-black" onClick={() => setMessageOptions(index)}> 
  ˅ 
  </button> 
)}


{/* Show the message options menu */}
{messageOptions === index && (
  <div ref={actionMenuRef} 
  className="absolute top-6 right-0 bg-white border rounded-lg shadow-lg text-lg p-2 z-10 w-75" >
   {/* className="absolute left-0 mt-2 bg-white border rounded-lg shadow-lg text-lg p-2 z-10 w-40"> */}
  <button className="block w-full text-left text-gray-700 hover:bg-gray-200 p-2" onClick={() => handleReplyMessage(msg)}>Reply</button> 
  <button className="block w-full text-left text-gray-700 hover:bg-gray-200 p-2" onClick={() => handleCopyMessage(msg.content)}>Copy</button>
  <button className="block w-full text-left text-gray-700 hover:bg-gray-200 p-2" onClick={() => handleForwardMessage(msg)}>Forward</button>
  <button className="block w-full text-left text-gray-700 hover:bg-gray-200 p-2" onClick={() => handlePinMessage(index, msg?.pinned ?? false)}>
    {msg.pinned ? "Unpin" : "Pin"}
  </button>



{pinOptions.show && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] text-center">
      <h2 className="text-lg font-semibold mb-2">Choose how long your pin lasts</h2>
      <p className="text-sm text-gray-600 mb-4">You can unpin at any time.</p>
      <div className="space-y-2">
        <label className="flex items-center justify-between p-2 border rounded">
          <input type="radio" name="pinDuration" value={24 * 60 * 60 * 1000} 
            onChange={(e) => setPinDuration(Number(e.target.value))} defaultChecked /> 
          <span>24 Hours</span>
        </label>
        <label className="flex items-center justify-between p-2 border rounded">
          <input type="radio" name="pinDuration" value={7 * 24 * 60 * 60 * 1000} 
            onChange={(e) => setPinDuration(Number(e.target.value))} /> 
          <span>7 Days</span>
        </label>
        <label className="flex items-center justify-between p-2 border rounded">
          <input type="radio" name="pinDuration" value={30 * 24 * 60 * 60 * 1000} 
            onChange={(e) => setPinDuration(Number(e.target.value))} /> 
          <span>30 Days</span>
        </label>
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setPinOptions({ index: -1, show: false })}>Cancel</button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={confirmPinMessage}>Pin</button>
      </div>
    </div>
  </div>
)}
<button className="block w-full text-left text-gray-600 hover:bg-gray-200 p-2" onClick={() => handleDeleteMessage(index)}>Delete</button> 
</div> 
)}
</div> 
))}
<div ref={chatEndRef} /> 
</div> 


{/* forwarding message */}
{forwardingMessage && (
  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-md shadow-lg w-64 h-72 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">
    <h2 className="text-lg font-bold mb-2">Forward Message</h2>
    <p className="mb-2">{forwardingMessage.content}</p>
    <div className="space-y-2">
      {users.map((user) => (
        <div key={user} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={user}
            className="h-4 w-4"
            checked={forwardingUsers.includes(user)}
            onChange={() => toggleUserSelection(user)}
          />
          <label htmlFor={user} className="text-sm">{user}</label>
        </div>
      ))}
    </div>
    <div className="flex justify-between mt-4">
      <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={sendForwardedMessage}>
        Send
      </button>
      <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setForwardingMessage(null)}>
        Cancel
      </button>
    </div>
  </div>
)}



{/* replying to message */}
<div className="relative w-full">  
{repliedMessage && (
  <div className="absolute bottom-[60px] left-0 w-full bg-gray-200 rounded-lg p-2 flex justify-between items-center shadow-md">
  <div className="flex-1 text-left">
    <p className="font-semibold">{repliedMessage.sender}</p>
    <p className="truncate max-w-xs">{repliedMessage.content}</p>
  </div>
  <button className="text-gray-500 text-xl" onClick={() => setRepliedMessage(null)} title="Close Reply">
    &#10005;
  </button>
</div>
)}


{/* Message Input */}
<div className={` flex items-center space-x-2  rounded-full p-2 shadow-sm transition-all duration-200 ${repliedMessage ? 'pb-3' : 'pb-2'}`}>
<input
type="text"
placeholder="Type a message..."
className="w-full outline-none text-black text-lg"
value={messageInput}
onChange={(e) => setMessageInput(e.target.value)}
onKeyDown={handleKeyPress}
/>
<button onClick={sendMessage} className="ml-2  text-black px-4 py-2">Send</button>
</div>
  </div>
</> 
) : activePage === 'chat' && !activeUser ? (
<div className="flex flex-1 items-center justify-center h-screen"> 
  <h1 className="text-3xl text-gray-400">Select a user to start chatting</h1> 
</div> 
) : null} 
</div> 
</div> 
); 
}; 
export default Messaging;
