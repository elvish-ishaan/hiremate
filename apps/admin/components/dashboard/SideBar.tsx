"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ReceiptEuro,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { ShimmerButton } from "../magicui/shimmer-button";
import { OrgModal } from "./OrgModal";

const sidebarLinks = [
  {
    id: 1,
    name: "Dashboard",
    icon: <Home/>,
    href: "/dashboard",
  },
  {
    id: 3,
    name: "Portals",
    icon: <LayoutDashboard/>,
    href: "/portals",
  },
  {
    id: 4,
    name: "Settings",
    icon: <Settings/>,
    href: "/settings",
  },
]

interface Organisation {
  id: string
  name: string
  logo: string
  createdAt?: string
  updatedAt?: string
}
const Sidebar = () => {
  const router = useRouter();
  const [organization, setOrganization] = useState<Organisation | null>(null) 
    const [openOrgModal, setOpenOrgModal] = useState(false);


  const handleLogout = () => {
    //remove the token from local storage
    localStorage.removeItem("token");
    toast("loged out")
    router.push("/auth/login");
  };

  useEffect(() => {
      const {organizations} = JSON.parse(localStorage.getItem("user") as string)
      setOrganization(organizations[0])
  },[])
  return (
    <aside className="h-screen w-64 bg-white/10 backdrop-blur-lg border-r border-white/10 shadow-lg flex flex-col justify-between py-6 px-4">
      {/* Top Section: Title + Links */}
      <div>
        <h1 className="text-2xl font-bold text-primary mb-6">HireMate</h1>
        {
          organization ? <div className=" flex gap-2 px-2 py-4 items-center">
           <div>
             <img src={organization?.logo} alt="logo" className="w-8 h-8" />
           </div>
           <div className=" text-muted-foreground">
             <div>{organization?.name}</div>
           </div>
        </div> : <>
        <ShimmerButton onClick={()=>setOpenOrgModal(true)} className="shadow-2xl">
                   <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-primary dark:from-white dark:to-slate-900/10 lg:text-lg">
                     Create Organisation
                   </span>
                  </ShimmerButton>
                  <OrgModal open={openOrgModal} onOpenChange={setOpenOrgModal}/>
        </>
        }
        <Separator className=" my-2"/>
        <nav className="space-y-2">
          {sidebarLinks.map((link) => (
            <SidebarLink key={link.id} href={link.href} icon={link.icon} label={link.name} />
          ))}

        </nav>
      </div>

      {/* Bottom: Logout */}
      <div>
        <Separator className="my-4" />
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:bg-red-500/10"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

const SidebarLink = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <Link
    href={href}
    className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-primary rounded-md transition-colors"
  >
    {icon}
    {label}
  </Link>
);

export default Sidebar;
