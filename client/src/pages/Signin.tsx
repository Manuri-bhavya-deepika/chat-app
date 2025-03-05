import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

// Corrected import for Heroicons
import { UserIcon } from "@heroicons/react/20/solid";

const Signin: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    
    setError(null); // Clear any previous errors
    
    try {
      const response = await axios.post("http://localhost:3000/api/v1/user/google-signin", {
        token: credentialResponse.credential,
      });
      
      localStorage.setItem("token", response.data.token);
      navigate("/feed");
    } catch (error: any) {
      console.error("Google login failed:", error);
      
      // Check if it's a 400 error (user not found)
      if (error.response && error.response.status === 400) {
        setError("Account not found. Please sign up first.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900">
      {/* Overlay with texture */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 opacity-60"></div>
      
      <div className="relative w-full max-w-md p-8 bg-slate-900 shadow-2xl rounded-xl transition-transform duration-300 transform hover:scale-105">
        <h1 className="text-3xl font-semibold text-white text-center mb-8">Sign In</h1>
        
        {/* Person Icon inside a Circle with soft gray background */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-500 p-4 rounded-full">
            <UserIcon className="w-12 h-12 text-white" />
          </div>
        </div>
        
        {/* Display error message if exists */}
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-center">
            {error}
          </div>
        )}
        
        <div className="flex flex-col space-y-6">
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.error("Login Failed");
                setError("Google authentication failed. Please try again.");
              }}
              useOneTap
              shape="pill"
              text="continue_with"
            />
          </div>
          
          {/* Already have an account link */}
          <div className="text-center text-sm text-gray-400">
            <p>
              Don't have an account? 
              <span
                className="text-blue-500 cursor-pointer hover:underline ml-1"
                onClick={() => navigate("/")}
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;