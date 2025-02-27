import React from 'react';

export const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  logout: () => Promise<void>;
}>({
  isAuthenticated: false,
  setIsAuthenticated: () => { },
  logout: async () => { },
});