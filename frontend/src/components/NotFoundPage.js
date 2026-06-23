import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <p className="text-8xl font-black text-green-100">404</p>
      <h1 className="text-2xl font-black text-foreground">Page not found</h1>
      <p className="text-muted-foreground max-w-sm text-sm">The page you're looking for doesn't exist or you may have typed the wrong URL.</p>
      <button onClick={() => navigate('/')} className="btn-primary h-10 px-6">Go back home</button>
    </div>
  );
};

export default NotFoundPage;
