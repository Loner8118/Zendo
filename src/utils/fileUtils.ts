// File utility functions

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const iconMap: { [key: string]: string } = {
    // Documents
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📝',
    rtf: '📝',
    
    // Spreadsheets
    xls: '📊',
    xlsx: '📊',
    csv: '📊',
    
    // Presentations
    ppt: '📊',
    pptx: '📊',
    
    // Images
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    bmp: '🖼️',
    svg: '🖼️',
    webp: '🖼️',
    
    // Videos
    mp4: '🎥',
    avi: '🎥',
    mov: '🎥',
    wmv: '🎥',
    flv: '🎥',
    mkv: '🎥',
    webm: '🎥',
    
    // Audio
    mp3: '🎵',
    wav: '🎵',
    ogg: '🎵',
    m4a: '🎵',
    flac: '🎵',
    
    // Archives
    zip: '🗜️',
    rar: '🗜️',
    '7z': '🗜️',
    tar: '🗜️',
    gz: '🗜️',
    
    // Code
    js: '💻',
    ts: '💻',
    jsx: '💻',
    tsx: '💻',
    html: '💻',
    css: '💻',
    py: '💻',
    java: '💻',
    cpp: '💻',
    c: '💻',
    php: '💻',
    rb: '💻',
    go: '💻',
    rs: '💻',
    json: '💻',
    xml: '💻',
    
    // Others
    exe: '⚙️',
    apk: '📱',
    dmg: '💿',
    iso: '💿',
  };
  
  return iconMap[extension || ''] || '📎';
}

export function downloadFile(fileName: string, base64Data: string): void {
  try {
    console.log('Download attempt for:', fileName);
    console.log('Data length:', base64Data?.length);
    console.log('Data preview:', base64Data?.substring(0, 100));
    
    if (!base64Data || base64Data.length === 0) {
      throw new Error('No file data provided');
    }
    
    // Remove the data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Content = base64Data.includes(',')
      ? base64Data.split(',')[1]
      : base64Data;
    
    console.log('Base64 content length after split:', base64Content.length);
    
    if (base64Content.length === 0) {
      throw new Error('Empty file data after processing');
    }
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);
    
    console.log('Blob size:', blob.size);
    
    if (blob.size === 0) {
      throw new Error('Generated blob is empty');
    }
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Download completed successfully');
  } catch (error) {
    console.error('Error downloading file:', error);
    console.error('File name:', fileName);
    console.error('Data received:', base64Data?.substring(0, 200));
    throw new Error('Failed to download file: ' + error.message);
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}

export function validateFile(file: File, maxSize: number = 100 * 1024 * 1024): boolean {
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${formatFileSize(maxSize)} limit`);
  }
  return true;
}