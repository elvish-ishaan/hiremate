
import "@/app/globals.css"; 
import {Feature} from "@/components/Landing/Feature";
import Footer from "@/components/Landing/Footer";
import Hero from "@/components/Landing/Hero";
import Testimonials from "@/components/Landing/Testimonials";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import Navbar from "@/components/nav/Navbar";

const Home = () => {
  return (
    <div className="">
      <Navbar/>
      <FlickeringGrid
        className="absolute -z-10 inset-0 h-[120vh] w-full"
        squareSize={8}
        gridGap={10}
        color="#52b788"
        maxOpacity={0.3}
        flickerChance={0.1}
      />
      <div className=" w-full flex justify-center items-center">
        <Hero/>
      </div>
      <Feature/>
      <Testimonials/>
      <Footer/>
    </div>
    
  )
}

export default Home
