import { useState, useEffect } from "react";

export default function useGenerateRandomColors(length: number) {
  const [colorList, setColorList] = useState<string[]>([]);
  const generateColorString = () => {
    const letters = "0123456789ABCDEF";
    let generatedColor = "#";
    for (let i = 0; i < 6; i++) {
      // It's not the common formula.
      // 0 to 5, not 0 to 15
      const randomValue = Math.floor(Math.random() * 6);
      if (i !== 4) generatedColor += letters[randomValue];
      // for making color more blue
      else generatedColor += letters[randomValue + 2];
    }
    return generatedColor;
  };
  const generateColor = () => {
    let generatedColor = generateColorString();
    while (colorList.includes(generatedColor))
      generatedColor = generateColorString();
    setColorList((prevColorList) => [...prevColorList, generatedColor]);
  };

  useEffect(() => {
    for (let i = 0; i < length; i++) {
      generateColor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length]);

  return colorList;
}
