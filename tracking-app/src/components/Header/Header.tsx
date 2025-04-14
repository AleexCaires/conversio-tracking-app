"use client";

import React from "react";
import Image from "next/image";
import { Nav, HeaderWrapper, Logo, NavList, NavItemLink} from "./Header.styles";

interface NavItem {
  name: string;
  href: string;
}

const navItems = [{ name: "See all", href: "/historyComp" }];

const Header = () => {
  return (
    <HeaderWrapper>
      <Nav>
        <Logo href="/">
          <Image src="/conversioLogo.png" alt="Conversio Logo" width={120} height={40} priority />
        </Logo>
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
