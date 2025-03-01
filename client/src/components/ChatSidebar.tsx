import { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface ChatSidebarProps {
  activePage: string;
  users: string[];
  activeUser: string;
  startChat: (user: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ activePage, users, activeUser, startChat }) => {
  const [showChat] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filter users based on search input
  const filteredUsers = users.filter((user) =>
    user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hide sidebar if not on chat page
  if (!showChat || activePage !== "chat") return null;

  return (
    <div className="bg-gray-100 w-[450px] min-h-screen p-4 fixed left-2 shadow-md overflow-y-auto top-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Chats</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="flex items-center border border-gray-300 rounded-full px-3 py-2">
          <FaSearch size={20} className="text-gray-600" />
          <input
            type="text"
            placeholder="Search"
            className="ml-6 w-full outline-none bg-transparent text-gray-700 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* User List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user}
            className={`cursor-pointer p-2 rounded-md hover:bg-blue-300 ${
              activeUser === user ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => startChat(user)}
          >
            {user}
          </div>
        ))}
      </div>
    </div>
  );
};
export default ChatSidebar;







