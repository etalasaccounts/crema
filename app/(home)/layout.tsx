import { NavbarDemo } from "../navbar";

export default function HomeLayout({ children }: any) {
  return (
    <>
      <NavbarDemo />
      <div className="container mx-auto py-24">{children}</div>
    </>
  );
}
