import { NavbarDemo } from "../navbar";

export default function HomeLayout({ children }: any) {
  return (
    <body>
      <NavbarDemo />
      <div className="container mx-auto py-24">{children}</div>
    </body>
  );
}
