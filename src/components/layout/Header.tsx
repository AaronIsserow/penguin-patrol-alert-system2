import React from "react";
import UserMenu from "./UserMenu";

interface HeaderProps {
  systemTime: string;
}

const Header: React.FC<HeaderProps> = ({ systemTime }) => {
  return (
    <header className="bg-primary text-primary-foreground py-4 mb-6">
      <div className="container">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🐾 EEE4113F Honey Badger Detection System</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm bg-primary-foreground/20 px-3 py-1 rounded-full">
              System Time: {systemTime}
            </div>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
