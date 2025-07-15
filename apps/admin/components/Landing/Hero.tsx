import React from 'react'
import HeroVideoDialog from '../magicui/hero-video-dialog'
import { Button } from '../ui/button'

const Hero = () => {
  return (
    <div className=' h-screen w-full my-10 mx-20'>
     <div className=' flex flex-col text-center'>
         <h1 className='text-6xl font-bold text-[#52b788] mb-2'>AUTOMATE YOUR INTERVIEWS</h1>
         <h2 className='text-xl text-[#52b788]'>The smartest way to interview candidates — automate, detect, and evaluate with AI.</h2>
         <div className=' mt-10 flex gap-4 justify-center'>
            <Button className=' bg-[#52b788]'>Get Started</Button>
            <Button variant="outline">Learn More</Button>
         </div>
     </div>
    <div className=' flex items-center w-full justify-center my-10'>
         <HeroVideoDialog
        className="block dark:hidden h-1/3 w-1/2"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
        thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
        thumbnailAlt="Hero Video"
      />
      <HeroVideoDialog
        className="hidden dark:block h-1/3"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
        thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
        thumbnailAlt="Hero Video"
      /> 
    </div>
    </div>
  )
}

export default Hero