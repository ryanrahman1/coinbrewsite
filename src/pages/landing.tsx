import Beams from "./../components/Beams";
import { Button } from "../components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) {
      navigate("/home");
    }
  }, [navigate]);


  return (
    <div className="relative w-full h-screen bg-gray-950 text-white overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Beams
          beamWidth={2}
          beamHeight={15}
          beamNumber={12}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <nav className="flex items-center justify-between w-full px-6 md:px-10 py-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-wide hidden">coinbrew</span>
          </div>

          <div>
            <Button
              className="px-4 py-2 rounded-lg font-semibold bg-white text-black hover:bg-gray-100 shadow-md transition cursor-pointer hidden"
              onClick={() => (navigate('/signup'))}
              aria-label="Get Started"
            >
              Get Started
            </Button>
          </div>
        </nav>

        <main className="flex flex-col items-center justify-center flex-grow text-center px-6">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold mb-4 bg-clip-text text-transparent bg-white">
            coinbrew
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
            a paper-trading crypto simulator
          </p>

          <Button
            className="flex items-center justify-center gap-3 !px-15 py-8 text-2xl rounded-lg font-semibold shadow-lg transition cursor-pointer 
             bg-[#F87171] hover:bg-[#fb8a8a] text-white"
            onClick={() => (navigate('/signup'))}
            aria-label="Get Started"
          >
            Get Started
            <ArrowRight className="w-7 h-7" />
          </Button>

        </main>
      </div>
    </div>
  );
}
