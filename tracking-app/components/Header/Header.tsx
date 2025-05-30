"use client";

import React from "react";
import Image from "next/image";
import { Nav, HeaderWrapper, Logo, NavList, NavItemLink, NavItem } from "./Header.styles";

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
            <NavItem key={item.name}>
              <NavItemLink href={item.href}>{item.name}</NavItemLink>
            </NavItem>
          ))}
        </NavList>
      </Nav>
    </HeaderWrapper>
  );
};

export default Header;
