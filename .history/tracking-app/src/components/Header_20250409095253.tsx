"use client";

import React from "react";
import { Nav, HeaderWrapper, Logo, NavList, NavItemLink } from "./Header.styles";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [{ name: "", href: "/" }];

const Header = () => {
  return (
    <HeaderWrapper>
      <Nav>
        <Logo href="/">MyApp</Logo>
        <NavList>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavItemLink href={item.href}>{item.name}</NavItemLink>
            </li>
          ))}
        </NavList>
      </Nav>
    </HeaderWrapper>
  );
};

export default Header;
