"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import LoginDialog from "@/components/LoginDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faUserLock,
  faUserPlus,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const router = useRouter();
  const { profile, loading, clearProfile, refetch } = useStaffProfile();
  const [showLogin, setShowLogin] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearProfile();
    router.push("/");
  }

  return (
    <>
      <h1 className="text-xl font-bold text-black">WU Canteen</h1>
      <nav>
        <ul className="flex gap-6 text-gray-900">
          <li>
            <Link href="/" className="hover:text-purple-500">
              Home
            </Link>
          </li>
          <li>
            <Link href="/menu" className="hover:text-purple-500">
              Menu
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-purple-500">
              About
            </Link>
          </li>

          {!loading && !profile && (
            <li>
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className="hover:text-purple-500"
              >
                <FontAwesomeIcon icon={faUserLock} className="ml-2" />
              </button>
            </li>
          )}

          {!loading && profile && (
            <>
              <li>
                <Link
                  href={profile.role === "admin" ? "/admin" : "/staff"}
                  className="hover:text-purple-500"
                >
                  <FontAwesomeIcon
                    icon={profile.role === "admin" ? faUserTie : faUserPlus}
                    className="mr-2"
                  />
                  {profile.full_name}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hover:text-purple-500"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="ml-2" />
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
      {showLogin && (
        <LoginDialog
          onClose={() => setShowLogin(false)}
          onLoginSuccess={refetch}
        />
      )}
    </>
  );
}
