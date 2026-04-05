function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-600">
      {children}
    </div>
  );
}

export default AuthLayout;
