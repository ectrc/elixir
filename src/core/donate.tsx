import { useEffect, useRef, useState } from "react";
import JSConfetti from "js-confetti";
import useAuth from "src/state/auth";

import { HiX } from "react-icons/hi";

const Donate = () => {
  const auth = useAuth();

  const [showMe, set] = useState(auth.user?.Role >= 10 ? false : true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<JSConfetti | null>();

  useEffect(() => {
    if (confettiRef.current) return;
    if (!canvasRef.current) return;

    confettiRef.current = new JSConfetti({
      canvas: canvasRef.current,
    });

    return () => {
      confettiRef.current = null;
    };
  }, [canvasRef]);

  const handleClick = () => {
    if (!confettiRef.current) return;
    confettiRef.current.addConfetti({
      confettiNumber: 200,
      confettiColors: ["#804bd6", "#c957a7", "#ca3863"],
    });
  };

  return (
    <>
      <canvas ref={canvasRef}></canvas>
      {showMe && (
        <button className="donate" onClick={handleClick}>
          <b>Donate for exclusive rewards! </b>

          <div className="close" onClick={() => set(false)}>
            <HiX />
          </div>
        </button>
      )}
    </>
  );
};

export default Donate;
