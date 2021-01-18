import React, { useRef, useEffect } from 'react';
import { canvasInit } from '../utils/CanvasUtils';

const useCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    //initialise animation and retrieve callback functions to pass to animation frame
    const { callback, resizeFunc, mousemoveFunc } = canvasInit(canvasRef);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      callback();
      animationFrameId = window.requestAnimationFrame(
        render.bind(null, callback)
      );
    };
    render();

    //tidy up objects on unmounting of component
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeFunc, false);
      window.removeEventListener('mousemove', mousemoveFunc);
    };
  }, []);

  return canvasRef;
};

export const Animation = (props) => {
  const { draw, ...rest } = props;
  const canvasRef = useCanvas(draw);

  return <canvas ref={canvasRef} {...rest} />;
};
