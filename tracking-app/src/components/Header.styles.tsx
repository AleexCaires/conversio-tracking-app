import Link from "next/link";
import styled from "styled-components";

export const HeaderWrapper = styled.header`
  background-color: #fff;
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: #333;

  &:hover {
    color: #0070f3;
  }
`;

export const NavList = styled.ul`
  display: flex;
  list-style: none;
  gap: 2rem;
  padding: 0;
  margin: 0;
`;

export const NavItemLink = styled(Link)`
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #0070f3;
  }
`;
