export const handleCopyImg = (
  imgSrc,
  callback,
  imgWidth = 100,
  imgHeight = 100
) => {

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();

  canvas.width = imgWidth;
  canvas.height = imgHeight;

  img.src = imgSrc

  img.onload = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

    canvas.toBlob(async (blob) => {
      const data = [
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ];

      await navigator.clipboard.write(data).then(
        () => {
          console.log("Copied to clipboard successfully!");
          callback();
        },
        () => {
          console.error("Unable to write to clipboard.");
        }
      );
    });
  };
};
