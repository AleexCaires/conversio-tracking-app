"use client";

import React from "react";
import Image from "next/image";
import { Nav, HeaderWrapper, Logo, NavList, NavItemLink, NavItem } from "./Header.styles";
import { usePathname } from "next/navigation"; // Import usePathname

const navItems = [{ name: "Saved Events", href: "/historyComp" }];

const Header = () => {
  const pathname = usePathname(); // Get current pathname

  return (
    <HeaderWrapper>
      <Nav>
        <Logo href="/">
          <Image src="/conversioLogo.png" alt="Conversio Logo" width={120} height={40} priority />
        </Logo>
        <NavList>
          {navItems.map((item) => {
            // Conditionally render the item
            if (item.href === "/historyComp" && pathname === "/historyComp") {
              return null; // Don't render if on /historyComp page
            }
            return (
              <NavItem key={item.name}>
                <NavItemLink href={item.href}>{item.name}</NavItemLink>
              </NavItem>
            );
          })}
        </NavList>
      </Nav>
    </HeaderWrapper>
  );
};

export default Header;
