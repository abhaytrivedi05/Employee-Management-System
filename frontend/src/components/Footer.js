import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-border bg-white mt-auto">
    <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} TeamHub HR Management. All rights reserved.</p>
      <div className="flex gap-4 text-xs text-muted-foreground">
        {[['/', 'Home'], ['/dashboard', 'Dashboard'], ['/employees', 'Employees'], ['/departments', 'Departments']].map(([path, label]) => (
          <Link key={path} to={path} className="hover:text-foreground transition-colors">{label}</Link>
        ))}
        <span>Privacy Policy</span>
        <span>Terms</span>
        <span>Contact</span>
      </div>
    </div>
  </footer>
);

export default Footer;
