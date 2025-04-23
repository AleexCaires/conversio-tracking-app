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
  color: #333;
  font-weight: 500;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #0070f3;
  }
`;

