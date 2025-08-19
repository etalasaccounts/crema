import AuthFooter from "@/app/(auth)/auth-footer";

export default function AuthLayout({ children }: any) {
  return (
    <>
      <div className="flex flex-col w-full h-screen ">
        <div className="flex flex-col w-full h-full px-4 md:px-6 items-center justify-center">
          {children}
        </div>
        <AuthFooter />
      </div>
    </>
  );
}
