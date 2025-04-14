import { useState, useRef, useEffect } from 'react';
import { Copy, Trash2, CheckCircle, ArrowUpDown } from 'lucide-react';

export default function JSONTokenSorter() {
  const [inputJSON, setInputJSON] = useState('');
  const [outputJSON, setOutputJSON] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const outputRef = useRef(null);
  const canvasRef = useRef(null);
  const outputContainerRef = useRef(null);
  
  const orderObjectAlphabetically = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => orderObjectAlphabetically(item));
    }
    
    const ordered = {};
    const keys = Object.keys(obj).sort();
    
    for (const key of keys) {
      ordered[key] = orderObjectAlphabetically(obj[key]);
    }
    
    return ordered;
  };

  const processJSON = () => {
    setError('');
    if (!inputJSON.trim()) {
      setError('Please enter some JSON to order');
      return;
    }

    try {
      const parsed = JSON.parse(inputJSON);
      const ordered = orderObjectAlphabetically(parsed);
      setOutputJSON(JSON.stringify(ordered, null, 2));
      
      // Wait for DOM update before triggering animation
      setTimeout(() => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }, 0);
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
    }
  };

  const clearFields = () => {
    setInputJSON('');
    setOutputJSON('');
    setError('');
    setCopySuccess(false);
  };

  const copyOutput = () => {
    if (!outputJSON) return;
    
    try {
      if (outputRef.current) {
        outputRef.current.select();
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  useEffect(() => {
    if (!showConfetti || !canvasRef.current || !outputContainerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Position canvas over the output container
    const containerRect = outputContainerRef.current.getBoundingClientRect();
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    
    const confettiCount = 100;
    const confettiColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const confettiParticles = [];
    
    class ConfettiParticle {
      constructor() {
        // Start from the center of the output field
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.size = Math.random() * 8 + 3;
        
        // Radial explosion velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.01; // Fade out speed
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.rotation += this.rotationSpeed;
        this.alpha -= this.decay;
      }
      
      draw() {
        if (this.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }
    
    // Create confetti particles
    for (let i = 0; i < confettiCount; i++) {
      confettiParticles.push(new ConfettiParticle());
    }
    
    let animationId;
    let startTime = Date.now();
    const animationDuration = 1500; // 1.5 seconds
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > animationDuration || !showConfetti) {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < confettiParticles.length; i++) {
        const particle = confettiParticles[i];
        particle.update();
        particle.draw();
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [showConfetti]);

  const buttonBaseStyle = "px-4 py-2 rounded font-medium transition-all duration-200 shadow-sm flex items-center gap-2 transform";
  const primaryButtonStyle = `${buttonBaseStyle} bg-blue-600 text-white hover:bg-blue-700 hover:shadow active:bg-blue-800 active:shadow-inner active:scale-95`;
  const secondaryButtonStyle = `${buttonBaseStyle} bg-gray-200 hover:bg-gray-300 hover:shadow active:bg-gray-400 active:shadow-inner active:scale-95`;

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Design Token Alphabetical Sorter</h1>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="input-json" className="font-bold">Original JSON:</label>
        <textarea 
          id="input-json"
          className="w-full h-64 p-3 border rounded shadow-sm font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200" 
          value={inputJSON}
          onChange={(e) => setInputJSON(e.target.value)}
          placeholder="Paste your JSON here..."
        />
      </div>
      
      <div className="flex justify-start gap-4">
        <button 
          onClick={processJSON}
          className={primaryButtonStyle}
        >
          <ArrowUpDown size={16} /> 
          Order Alphabetically
        </button>
        <button 
          onClick={clearFields}
          className={secondaryButtonStyle}
        >
          <Trash2 size={16} /> Clear
        </button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="flex flex-col gap-2 relative" ref={outputContainerRef}>
        <label htmlFor="output-json" className="font-bold">Ordered JSON:</label>
        <textarea 
          id="output-json"
          ref={outputRef}
          className="w-full h-64 p-3 border rounded shadow-sm font-mono text-sm bg-gray-50" 
          value={outputJSON}
          readOnly
          placeholder="Ordered result will appear here..."
        />
        
        {showConfetti && (
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 top-6 pointer-events-none z-10"
            aria-hidden="true"
          />
        )}
      </div>
      
      <div className="flex justify-start">
        <button 
          onClick={copyOutput}
          disabled={!outputJSON}
          className={`${buttonBaseStyle} ${
            copySuccess 
              ? 'bg-green-600 text-white scale-105 shadow-md' 
              : outputJSON 
                ? primaryButtonStyle
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          aria-label={copySuccess ? "Copied to clipboard" : "Copy ordered JSON"}
        >
          <span className="transition-all duration-300">
            {copySuccess ? <CheckCircle className="animate-pulse" size={16} /> : <Copy size={16} />}
          </span>
          <span className="transition-all duration-300">
            {copySuccess ? 'Copied!' : 'Copy Ordered JSON'}
          </span>
        </button>
      </div>
    </div>
  );
}
