import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const ImageGenerator = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const font = new FontFace('Spray', 'url(https://fonts.gstatic.com/s/permanentmarker/v10/Fh4uPib9Iyv2ucM6pGQMWimMp004La2Cf5b6jlg.woff2)');
    font.load().then(() => {
      document.fonts.add(font);
    });
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => setUploadedImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const generateImages = () => {
    if (!uploadedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      const images = [];
      for (let i = 1; i <= 100; i++) {
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        // Configuração do texto
        const text = i.toString();
        ctx.font = `bold ${img.height * 0.4}px Spray, Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Efeito de sombra para simular spray
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // Desenhar o texto várias vezes para criar efeito de spray
        for (let j = 0; j < 10; j++) {
          const offsetX = (Math.random() - 0.5) * 10;
          const offsetY = (Math.random() - 0.5) * 10;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`;
          ctx.fillText(text, img.width / 2 + offsetX, img.height / 2 + offsetY);
        }

        // Texto principal
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = img.height * 0.01;
        ctx.strokeText(text, img.width / 2, img.height / 2);
        ctx.fillText(text, img.width / 2, img.height / 2);

        images.push(canvas.toDataURL('image/png'));
      }
      setGeneratedImages(images);
    };
    img.src = uploadedImage;
  };

  const downloadAllImages = async () => {
    const zip = new JSZip();

    generatedImages.forEach((dataUrl, index) => {
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      zip.file(`pixacao_${index + 1}.png`, base64Data, {base64: true});
    });

    const content = await zip.generateAsync({type: "blob"});
    saveAs(content, "todas_imagens_pixacao.zip");
  };

  return (
    <div className="p-4">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        className="mb-4 p-2 border rounded"
      />
      {uploadedImage && (
        <button 
          onClick={generateImages}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Gerar 100 Imagens
        </button>
      )}
      {generatedImages.length > 0 && (
        <button 
          onClick={downloadAllImages}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Baixar Todas as Imagens (ZIP)
        </button>
      )}
      <div className="flex flex-wrap">
        {generatedImages.map((src, index) => (
          <img key={index} src={src} alt={`Generated ${index + 1}`} className="w-24 h-24 m-1 object-cover" />
        ))}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageGenerator;