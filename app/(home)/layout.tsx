import { NavbarDemo } from "./navbar";

export default function HomeLayout({ children }: any) {
  return (
    <>
      <NavbarDemo />
      <div className="container mx-auto pt-32">{children}</div>
    </>
  );
}
