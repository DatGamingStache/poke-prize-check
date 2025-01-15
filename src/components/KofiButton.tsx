import { useEffect } from 'react';

declare global {
  interface Window {
    kofiwidget2: {
      init: (text: string, color: string, id: string) => void;
      draw: () => void;
    };
  }
}

const KofiButton = () => {
  useEffect(() => {
    // Load Ko-fi widget script
    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/widget/Widget_2.js';
    script.async = true;
    script.onload = () => {
      // Initialize Ko-fi widget after script loads
      if (window.kofiwidget2) {
        window.kofiwidget2.init('Support me on Ko-fi', '#000000', 'H2H519101Y');
        window.kofiwidget2.draw();
      }
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="kofi-button-container" />;
};

export default KofiButton;