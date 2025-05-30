import Link from "next/link";
import styled from "styled-components";

export const HeaderWrapper = styled.header`
  background-color: #fff;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const Nav = styled.nav`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
`;

export const Logo = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  grid-column: 2;

  img {
    object-fit: contain;
    width: 400px;
    height: 60px;
  }
`;

export const NavList = styled.ul`
  display: flex;
  list-style: none;
  gap: 2rem;
  padding: 0;
  margin: 0;
  grid-column: 3;
  justify-content: flex-end;
`;

export const NavItemLink = styled(Link)`
  text-decoration: none;
  color: white;
  font-weight: 700;
  transition: color 0.2s ease-in-out;


`;

export const NavItem = styled.li`
  background: #582E89;
  border-radius: 16px;
  height: 48px;
  width: 115px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`