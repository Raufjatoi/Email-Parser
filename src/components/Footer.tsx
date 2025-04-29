
import React from "react";

const Footer = () => {
  return (
    <footer className="py-6 mt-12 border-t border-gray-100">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-gray-600 text-sm">
          <span>By <a href="https://rauf-psi.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Abdul Rauf Jatoi</a></span>
          <span className="hidden sm:block">•</span>
          <span className="text-gray-500">Icreativez Technology</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
