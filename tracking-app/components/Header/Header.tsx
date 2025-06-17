"use client";

import React from "react";
import Image from "next/image";
import { Nav, HeaderWrapper, Logo, NavList, NavItemLink, NavItem } from "./Header.styles";
import { usePathname } from "next/navigation";

const navItems = [{ name: "Saved Events", href: "/historyComp" }];

const Header = () => {
  const pathname = usePathname();

  return (
    <HeaderWrapper>
      <Nav>
        <Logo href="/">
          <Image src="/conversioLogo.png" alt="Conversio Logo" width={120} height={40} priority />
        </Logo>
        <NavList>
          {navItems.map((item) => {
            if (item.href === "/historyComp" && pathname === "/historyComp") {
              return (
                <NavItem key="build-events">
                  <NavItemLink href="/">Build Events</NavItemLink>
                </NavItem>
              );
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
