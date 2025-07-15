import React from 'react'
import { ThemeToggle } from '../ThemeToggle'

const Navbar = () => {
  return (
    <div className=' flex justify-between my-5 mx-10 bg-white/10 backdrop-blur-xs border border-white/20 shadow-lg rounded-md p-3'>
        <div>Hiremate</div>
        <div>links</div>
        <div>auth</div>
    </div>
  )
}

export default Navbar