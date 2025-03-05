import {BrowserRouter, Routes, Route} from "react-router-dom";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Createuserprofile from "./pages/CreateUserprofile";
import Feed from "./pages/Feed"
import Createproject from "./pages/Createproject";
import Profile from "./pages/Profile";
import AllProjects from "./pages/Allprojects";
import MyProjects from "./pages/Myprojects";
import Bookmarks from "./pages/Bookmark";
import LikedProjects from "./pages/Likedprojects";
import CollaborationRequests from "./pages/Collaborationrequests";
import Updateproject from "./pages/Updateproject";
import UpdateUserProfile from "./pages/Updateprofile";
import Logout from "./components/Logout";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import './App.css';


function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup/>}></Route>
        <Route path="/signin" element={<Signin/>}></Route>
        <Route path="/createprofile" element={<Createuserprofile/>}></Route>
        <Route path="/feed" element={<Feed/>}></Route>
        <Route path="/createproject" element={<Createproject/>}></Route>
        <Route path="/profile" element={<Profile/>}></Route>
        <Route path="/allprojects" element={<AllProjects/>}></Route>
        <Route path="/myprojects" element={<MyProjects/>}></Route>
        <Route path="/bookmarks" element={<Bookmarks/>}></Route>
        <Route path="/liked-projects" element={<LikedProjects/>}></Route>
        <Route path="/collaboration-requests" element={<CollaborationRequests />} />
        <Route path="/updateproject/:projectId" element={<Updateproject />} />
        <Route path="/updateprofile" element={<UpdateUserProfile />} />
        <Route path="/chat" element={<HomePage />} />
        <Route path="/chat/:userId" element={<ChatPage />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
      </BrowserRouter> 
    </>
  )
}

export default App
