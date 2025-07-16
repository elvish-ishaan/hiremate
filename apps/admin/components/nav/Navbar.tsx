"use client"

import React from 'react'
import { ThemeToggle } from '../ThemeToggle'
import { Button } from '../ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();

  return (
    <div className=' flex justify-between items-center my-5 mx-10 bg-white/10 backdrop-blur-xs border border-white/20 shadow-lg rounded-md px-5 py-3'>
        <div className=' text-primary text-xl font-medium'>Hiremate</div>
        <div className=' text-primary flex gap-3'>
          <Link href={"#"}>Solutions</Link>
          <Link href={"#"}>Products</Link>
          <Link href={"#"}>Pricing</Link>
        </div>
        <div className=' flex gap-3'>
            <ThemeToggle />
            <Button onClick={ () => router.push('/auth/login')} className=' bg-primary'>Login</Button>
            <Button onClick={ () => router.push('/auth/register')} className=' bg-secondary'>Register</Button>
        </div>
    </div>
  )
}

export default Navbar