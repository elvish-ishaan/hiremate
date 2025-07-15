
import "@/app/globals.css"; 
import Hero from "@/components/Landing/Hero";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import Navbar from "@/components/nav/Navbar";

const Home = () => {
  return (
    <div className="">
      <Navbar/>
      <FlickeringGrid
        className="absolute -z-10 inset-0 h-screen w-full"
        squareSize={8}
        gridGap={10}
        color="#52b788"
        maxOpacity={0.3}
        flickerChance={0.1}
      />
      <div className=" w-full flex justify-center items-center">
        <Hero/>
      </div>
    </div>
  )
}

export default Home
