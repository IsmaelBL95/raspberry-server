import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";

export default function Home() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}