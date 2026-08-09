/**
 * imageCompressor.ts
 * 브라우저 Canvas API를 사용해 이미지를 압축합니다.
 * - 가장 긴 변이 MAX_DIMENSION(1200px)을 초과하면 비율을 유지하며 축소
 * - 압축 후 파일 크기가 MAX_SIZE_BYTES(0.5 MB)를 초과하면
 *   JPEG quality를 0.05씩 낮추며 목표 이하로 만듭니다.
 */

const MAX_DIMENSION = 1200;    // px
const MAX_SIZE_BYTES = 500_000; // 0.5 MB
const MIN_QUALITY = 0.3;        // 최저 품질 (이 이하로는 내리지 않음)

/**
 * File → 압축된 Blob 반환
 */
export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // ── 1. 크기 계산 ──────────────────────────
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height / width) * MAX_DIMENSION);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width / height) * MAX_DIMENSION);
          height = MAX_DIMENSION;
        }
      }

      // ── 2. Canvas에 그리기 ────────────────────
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context를 가져올 수 없습니다.'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // ── 3. quality를 낮춰가며 목표 크기 이하로 ─
      const tryEncode = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob 실패'));
              return;
            }

            if (blob.size <= MAX_SIZE_BYTES || quality <= MIN_QUALITY) {
              // 목표 달성 또는 최저 품질 도달 → File로 변환
              const ext = 'jpg';
              const baseName = file.name.replace(/\.[^/.]+$/, '');
              const compressedFile = new File(
                [blob],
                `${baseName}_compressed.${ext}`,
                { type: 'image/jpeg' }
              );
              resolve(compressedFile);
            } else {
              // 아직 크면 quality를 0.05 낮춰서 재시도
              tryEncode(Math.max(quality - 0.05, MIN_QUALITY));
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryEncode(0.85); // 최초 품질 85%부터 시작
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지 로딩 실패'));
    };

    img.src = objectUrl;
  });
};
