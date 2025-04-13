import React from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
