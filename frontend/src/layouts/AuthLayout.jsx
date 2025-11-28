// frontend/src/layouts/AuthLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;