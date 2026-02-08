import { useState } from "react";

interface TicketUploadProps {
  onImageUploaded: (file: File) => void;
}

export default function TicketUpload({ onImageUploaded }: TicketUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImageUploaded(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
        Subir foto de ticket
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {preview && (
        <img src={preview} alt="Preview" className="w-48 h-auto rounded shadow" />
      )}
    </div>
  );
}
