"use client"; // Ensure this is a Client Component
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { PenBox } from "lucide-react";
import UserMenu from "./user-menu";
import { checkUser } from "@/lib/checkUser";
import UserLoading from "./user-loading";

const Header = () => {
  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      await checkUser(); // Call the checkUser  function
      setUserChecked(true); // Set the state to true after the check
    };

    checkUserStatus(); // Call the function
  }, []); // Empty dependency array to run only once

  if (!userChecked) {
    return null; // Optionally, you can return a loading spinner or placeholder
  }

  return (
    <header className="container mx-auto">
      <nav className="py-6 px-4 flex justify-between items-center">
        <Link href="/">
          <Image
            src={"/logo2.jpeg"}
            alt="Project_Manager logo"
            width={200}
            height={56}
            className="h-10 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/project/create">
            <Button variant="destructive" className="flex items-center gap-2">
              <PenBox size={18} />
              <span>Create Project</span>
            </Button>
          </Link>
          <SignedOut>
            <SignInButton forceRedirectUrl="/onboarding">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserMenu />
          </SignedIn>
        </div>
      </nav>
      <UserLoading />
    </header>
  );
};

export default Header;
