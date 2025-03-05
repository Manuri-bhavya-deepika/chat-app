import React, { ChangeEventHandler } from "react";

interface InputboxProps {
  label: string;
  placeholder?: string;
  value?: string;
  type?: string; 
  onChange?: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  errorMessage?: string; // Add this line
}

const Inputbox: React.FC<InputboxProps> = ({ 
  label, 
  placeholder, 
  value, 
  type = "text",
  onChange, 
  disabled, 
  errorMessage // Destructure errorMessage here
}) => {
  return (
    <div>
      <div className="text-sm font-medium text-left py-2">{label}</div>
      <input
        type={type} 
        placeholder={placeholder}
        value={value} 
        onChange={onChange}
        disabled={disabled}
        className="w-full px-2 py-1 border rounded border-slate-200"
      />
      {errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>} {/* Display error message */}
    </div>
  );
};

export default Inputbox;
